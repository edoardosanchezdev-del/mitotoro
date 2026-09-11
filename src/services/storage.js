import { config } from '../config.js';
import { getSupabase } from '../lib/supabase.js';

const sanitize = (name) => name.replace(/[^\w.\-() ]+/g, '').trim() || 'archivo';

const buildPath = (memoryId, folder, file) => {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  return `${folder}/${memoryId}/${crypto.randomUUID()}.${ext.toLowerCase()}`;
};

export const storageService = {
  getPublicUrl(path) {
    const { data } = getSupabase().storage.from(config.storageBucket).getPublicUrl(path);
    return data.publicUrl;
  },

  async uploadFile(memoryId, folder, file) {
    if (file.size > config.maxUploadBytes) {
      const limitMb = Math.round(config.maxUploadBytes / 1024 / 1024);
      throw new Error(`"${sanitize(file.name)}" supera el límite de ${limitMb} MB.`);
    }
    const path = buildPath(memoryId, folder, file);
    const { error } = await getSupabase().storage
      .from(config.storageBucket)
      .upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type });
    if (error) throw error;
    return path;
  },

  async uploadMany(memoryId, folder, files) {
    const uploads = [...files].slice(0, config.maxMediaFiles).map((file) => this.uploadFile(memoryId, folder, file));
    return Promise.all(uploads);
  },

  async removePaths(paths) {
    const valid = paths.filter(Boolean);
    if (!valid.length) return;
    const { error } = await getSupabase().storage.from(config.storageBucket).remove(valid);
    if (error) throw error;
  }
};
