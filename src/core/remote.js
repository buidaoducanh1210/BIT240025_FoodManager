import { AppError, codec } from './domain.js';
export function createRemote(studentId, baseUrl, fetcher = globalThis.fetch) {
  const { encode, decode, table } = codec(studentId);
  const base = baseUrl.trim().replace(/\/+$/, '');
  async function request(entity, method = 'GET', id, body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetcher(`${base}/${table(entity)}${id ? `/${encodeURIComponent(id)}` : ''}`, {
        method, signal: controller.signal, headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(encode(body)) } : {}),
      });
      if (!response.ok) throw new AppError(response.status === 404 ? 'apiNotFound' : 'apiError');
      if (response.status === 204) return null;
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.name === 'AbortError' ? 'apiTimeout' : 'apiError');
    } finally { clearTimeout(timer); }
  }
  return {
    async list(entity) {
      const list = await request(entity);
      if (!Array.isArray(list)) throw new AppError('apiDataInvalid');
      return list.map(item => {
        const model = decode(item);
        // Có thể đổi tên Object ID mặc định trên MockAPI để mọi field đều có tiền tố MSSV.
        // Id ứng dụng giữ ổn định khi offline; RemoteId chỉ dùng cho đường dẫn PUT/DELETE.
        const remoteId = item[table('RemoteId')] ?? item.id;
        delete model.RemoteId;
        if (!model.Id || remoteId === undefined || remoteId === null) throw new AppError('apiDataInvalid');
        return { remoteId: String(remoteId), model };
      });
    },
    async put(entity, remoteId, value) { return request(entity, remoteId ? 'PUT' : 'POST', remoteId, value); },
    async remove(entity, remoteId) { return request(entity, 'DELETE', remoteId); },
  };
}
