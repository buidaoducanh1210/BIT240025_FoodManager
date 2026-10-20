import { AppError, codec, newId, validateDish, validateCategory, canDeleteCategory, DEFAULT_FILTERS, isUrl } from './domain.js';
import { seedData } from './seed.js';
import { createRemote } from './remote.js';
const clone = value => JSON.parse(JSON.stringify(value));

export class FoodStore {
  constructor(storage, studentId, defaultUrl = '', remoteFactory = createRemote) {
    this.storage = storage; this.studentId = studentId; this.remoteFactory = remoteFactory;
    this.codec = codec(studentId); this.key = this.codec.table('Database'); this.listeners = new Set();
    this.serial = Promise.resolve(); this.running = null;
    this.snapshot = { ready: false, online: false, syncing: false, error: '', syncError: '',
      data: { DishCategory: [], Dish: [], Outbox: [], Settings: { Language: 'en', BaseUrl: defaultUrl, Filters: { ...DEFAULT_FILTERS } } } };
  }
  getSnapshot = () => this.snapshot;
  subscribe = fn => { this.listeners.add(fn); return () => this.listeners.delete(fn); };
  publish = patch => { this.snapshot = { ...this.snapshot, ...patch }; for (const fn of this.listeners) fn(); };
  async initialize() {
    try {
      const stored = await this.storage.getItem(this.key);
      if (stored) {
        const data = this.codec.decode(JSON.parse(stored));
        if (!Array.isArray(data.Dish) || !Array.isArray(data.DishCategory) || !Array.isArray(data.Outbox) || !data.Settings) throw new AppError('storageCorrupt');
        data.Settings.Filters = { ...DEFAULT_FILTERS, ...data.Settings.Filters };
        this.publish({ data, ready: true, error: '' });
      } else {
        const sample = seedData();
        const data = { ...sample, Outbox: [], Settings: this.snapshot.data.Settings };
        for (const entity of ['DishCategory', 'Dish']) {
          data[entity] = data[entity].map(value => ({ ...value, Version: newId(), Deleted: false }));
          for (const value of data[entity]) data.Outbox.push({ Entity: entity, Id: value.Id, Version: value.Version });
        }
        await this.storage.setItem(this.key, JSON.stringify(this.codec.encode(data)));
        this.publish({ data, ready: true, error: '' });
      }
    } catch (error) { this.publish({ error: error.code || 'storageError' }); }
  }
  // Lưu cả dữ liệu lẫn outbox trong cùng một snapshot; không báo thành công nếu lưu local thất bại.
  commit(operation) {
    const task = this.serial.then(async () => {
      const next = clone(this.snapshot.data);
      const result = operation(next);
      try { await this.storage.setItem(this.key, JSON.stringify(this.codec.encode(next))); }
      catch { throw new AppError('storageError'); }
      this.publish({ data: next }); return result;
    });
    this.serial = task.catch(() => {});
    return task;
  }
  enqueue(data, entity, record) {
    data.Outbox = data.Outbox.filter(item => !(item.Entity === entity && item.Id === record.Id));
    data.Outbox.push({ Entity: entity, Id: record.Id, Version: record.Version });
  }
  async saveDish(values, editingId) {
    const id = await this.commit(data => {
      if (editingId && !data.Dish.some(item => item.Id === editingId && !item.Deleted)) throw new AppError('notFound');
      const errors = validateDish(values, data.DishCategory, data.Dish, editingId);
      if (Object.keys(errors).length) throw new AppError(Object.values(errors)[0]);
      const record = { Id: editingId || newId(), Name: values.Name.trim(), Price: Number(values.Price), PreparationTime: Number(values.PreparationTime),
        IsAvailable: Boolean(values.IsAvailable), Description: String(values.Description || '').trim(), DishCategoryId: values.DishCategoryId,
        DishImage: values.DishImage.map(image => ({ ImageUrl: image.ImageUrl.trim(), IsThumbnail: Boolean(image.IsThumbnail) })), Version: newId(), Deleted: false };
      const index = data.Dish.findIndex(item => item.Id === record.Id);
      if (index >= 0) data.Dish[index] = record; else data.Dish.push(record);
      this.enqueue(data, 'Dish', record); return record.Id;
    });
    this.sync(); return id;
  }
  async saveCategory(values, editingId) {
    const id = await this.commit(data => {
      if (editingId && !data.DishCategory.some(item => item.Id === editingId && !item.Deleted)) throw new AppError('notFound');
      const errors = validateCategory(values); if (Object.keys(errors).length) throw new AppError(errors.Name);
      const record = { Id: editingId || newId(), Name: values.Name.trim(), Description: String(values.Description || '').trim(), Deleted: false, Version: newId() };
      const index = data.DishCategory.findIndex(item => item.Id === record.Id);
      if (index >= 0) data.DishCategory[index] = record; else data.DishCategory.push(record);
      this.enqueue(data, 'DishCategory', record); return record.Id;
    }); this.sync(); return id;
  }
  async remove(entity, id) {
    await this.commit(data => {
      const record = data[entity].find(item => item.Id === id && !item.Deleted);
      if (!record) throw new AppError('notFound');
      if (entity === 'DishCategory' && !canDeleteCategory(id, data.Dish)) throw new AppError('categoryInUse');
      record.Deleted = true; record.Version = newId(); this.enqueue(data, entity, record);
    }); this.sync();
  }
  async setSettings(patch) {
    if (patch.BaseUrl && !isUrl(patch.BaseUrl)) throw new AppError('apiUrlInvalid');
    await this.commit(data => {
      if (patch.BaseUrl !== undefined && patch.BaseUrl !== data.Settings.BaseUrl) {
        for (const entity of ['DishCategory', 'Dish']) for (const record of data[entity]) this.enqueue(data, entity, record);
      }
      data.Settings = { ...data.Settings, ...patch };
    }); this.sync();
  }
  async setFilters(filters) { await this.commit(data => { data.Settings.Filters = { ...data.Settings.Filters, ...filters }; }); }
  setOnline(online) { this.publish({ online }); if (online) this.sync(); }
  sync() {
    if (this.running) return this.running;
    if (!this.snapshot.ready || !this.snapshot.online || !this.snapshot.data.Settings.BaseUrl) return Promise.resolve();
    const baseUrl = this.snapshot.data.Settings.BaseUrl;
    this.running = this.performSync(baseUrl).catch(error => { this.publish({ syncError: error.code || 'apiError' }); })
      .finally(() => { this.running = null; this.publish({ syncing: false }); });
    return this.running;
  }
  async performSync(baseUrl) {
    this.publish({ syncing: true, syncError: '' });
    const remote = this.remoteFactory(this.studentId, baseUrl);
    const priority = item => {
      const record = this.snapshot.data[item.Entity].find(value => value.Id === item.Id);
      return item.Entity === 'DishCategory' ? (record?.Deleted ? 3 : 0) : (record?.Deleted ? 2 : 1);
    };
    // Một vòng chụp outbox. Nếu có sửa đồng thời, version mới được giữ để vòng tự đồng bộ kế tiếp xử lý.
    const pending = [...this.snapshot.data.Outbox].sort((a, b) => priority(a) - priority(b));
    for (const entry of pending) {
      if (!this.snapshot.online || this.snapshot.data.Settings.BaseUrl !== baseUrl) return;
      const record = clone(this.snapshot.data[entry.Entity].find(value => value.Id === entry.Id));
      if (!record) continue;
      // Luôn tra Id ứng dụng trước POST: retry sau mất response sẽ PUT bản đã có thay vì tạo trùng.
      const matches = (await remote.list(entry.Entity)).filter(item => item.model.Id === entry.Id);
      if (matches.length > 1) throw new AppError('remoteDuplicate');
      if (record.Deleted) { if (matches[0]) await remote.remove(entry.Entity, matches[0].remoteId); }
      else await remote.put(entry.Entity, matches[0]?.remoteId, record);
      await this.commit(data => {
        const current = data[entry.Entity].find(value => value.Id === record.Id);
        if (current?.Version !== record.Version) return;
        data.Outbox = data.Outbox.filter(item => !(item.Entity === entry.Entity && item.Id === record.Id && item.Version === record.Version));
        if (current.Deleted) data[entry.Entity] = data[entry.Entity].filter(item => item.Id !== record.Id);
      });
    }
    const remoteData = {};
    for (const entity of ['DishCategory', 'Dish']) remoteData[entity] = (await remote.list(entity)).map(item => item.model).filter(item => !item.Deleted);
    if (this.snapshot.data.Settings.BaseUrl !== baseUrl) return;
    await this.commit(data => {
      for (const entity of ['DishCategory', 'Dish']) {
        const dirtyIds = new Set(data.Outbox.filter(item => item.Entity === entity).map(item => item.Id));
        data[entity] = [...remoteData[entity].filter(item => !dirtyIds.has(item.Id)), ...data[entity].filter(item => dirtyIds.has(item.Id))];
      }
      // Tránh ghi dữ liệu server sai quan hệ hoặc sai trường vào kho local.
      for (const category of data.DishCategory.filter(item => !item.Deleted)) if (Object.keys(validateCategory(category)).length) throw new AppError('apiDataInvalid');
      for (const dish of data.Dish.filter(item => !item.Deleted)) if (Object.keys(validateDish(dish, data.DishCategory, data.Dish, dish.Id)).length) throw new AppError('apiDataInvalid');
    });
  }
}
