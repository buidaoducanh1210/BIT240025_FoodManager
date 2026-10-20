export class AppError extends Error {
  constructor(code) { super(code); this.code = code; }
}
export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
export const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();
export const sameName = (a, b) => String(a).trim().replace(/\s+/g, ' ').toLowerCase() === String(b).trim().replace(/\s+/g, ' ').toLowerCase();
export function isUrl(value) {
  try { const url = new URL(String(value).trim()); return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname); }
  catch { return false; }
}
export function validateDish(value, categories, dishes, editingId) {
  const errors = {};
  if (!String(value.Name ?? '').trim()) errors.Name = 'nameRequired';
  if (String(value.Price ?? '').trim() === '' || !Number.isFinite(Number(value.Price)) || Number(value.Price) <= 0) errors.Price = 'pricePositive';
  if (String(value.PreparationTime ?? '').trim() === '' || !Number.isFinite(Number(value.PreparationTime)) || Number(value.PreparationTime) <= 0) errors.PreparationTime = 'timePositive';
  if (!categories.some(item => !item.Deleted && item.Id === value.DishCategoryId)) errors.DishCategoryId = 'categoryRequired';
  if (dishes.some(item => !item.Deleted && item.Id !== editingId && item.DishCategoryId === value.DishCategoryId && sameName(item.Name, value.Name))) errors.Name = 'duplicateName';
  if (!Array.isArray(value.DishImage) || value.DishImage.some(image => !isUrl(image.ImageUrl))) errors.DishImage = 'imageUrlInvalid';
  else if (value.DishImage.filter(image => image.IsThumbnail).length > 1) errors.DishImage = 'oneThumbnail';
  return errors;
}
export function validateCategory(value) { return String(value.Name ?? '').trim() ? {} : { Name: 'nameRequired' }; }
export const canDeleteCategory = (id, dishes) => !dishes.some(item => !item.Deleted && item.DishCategoryId === id);
export function parseRange(min, max) {
  const low = String(min ?? '').trim() === '' ? 0 : Number(min);
  const high = String(max ?? '').trim() === '' ? Infinity : Number(max);
  if (!Number.isFinite(low) || low < 0 || Number.isNaN(high) || high < 0 || (String(max ?? '').trim() !== '' && !Number.isFinite(high)) || low > high) return null;
  return [low, high];
}
export const DEFAULT_FILTERS = { Search: '', Category: '', Available: 'all', Min: '', Max: '', Sort: 'name' };
export function selectDishes(dishes, filters) {
  const range = parseRange(filters.Min, filters.Max);
  if (!range) return { items: [], error: 'priceRangeInvalid' };
  const items = dishes.filter(item => !item.Deleted && normalize(item.Name).includes(normalize(filters.Search))
    && (!filters.Category || item.DishCategoryId === filters.Category)
    && (filters.Available === 'all' || item.IsAvailable === (filters.Available === 'available'))
    && Number(item.Price) >= range[0] && Number(item.Price) <= range[1]);
  const comparator = filters.Sort === 'priceAsc' ? (a, b) => a.Price - b.Price
    : filters.Sort === 'priceDesc' ? (a, b) => b.Price - a.Price
      : filters.Sort === 'timeAsc' ? (a, b) => a.PreparationTime - b.PreparationTime : (a, b) => a.Name.localeCompare(b.Name);
  return { items: [...items].sort(comparator), error: null };
}
export function codec(studentId) {
  if (!/^[A-Za-z0-9]+$/.test(studentId)) throw new AppError('studentIdInvalid');
  const prefix = `${studentId}_`;
  const encode = value => Array.isArray(value) ? value.map(encode)
    : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, item]) => [prefix + key, encode(item)])) : value;
  const decode = value => Array.isArray(value) ? value.map(decode)
    : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).filter(([key]) => key.startsWith(prefix)).map(([key, item]) => [key.slice(prefix.length), decode(item)])) : value;
  return { encode, decode, table: name => prefix + name };
}
