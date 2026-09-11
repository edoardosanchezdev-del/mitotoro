import { getSupabase } from '../lib/supabase.js';
import { storageService } from './storage.js';

const mapRow = (row, media = []) => ({
  id: row.id,
  title: row.title,
  date: row.memory_date,
  description: row.description ?? '',
  coverPath: row.cover_path,
  coverUrl: storageService.getPublicUrl(row.cover_path),
  songPath: row.song_path,
  song: row.song_title
    ? {
        title: row.song_title,
        artist: row.song_artist ?? '',
        artworkUrl: row.song_artwork_url ?? '',
        previewUrl: row.song_preview_url
          ?? (row.song_path ? storageService.getPublicUrl(row.song_path) : null)
      }
    : null,
  media: media.map((item) => ({
    id: item.id,
    path: item.storage_path,
    url: storageService.getPublicUrl(item.storage_path),
    type: item.media_type
  })),
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const songColumns = (song) => ({
  song_title: song?.title ?? null,
  song_artist: song?.artist ?? null,
  song_preview_url: song?.previewUrl ?? null,
  song_artwork_url: song?.artworkUrl ?? null
});

export const memoryService = {
  async list() {
    const supabase = getSupabase();
    const { data: rows, error } = await supabase
      .from('memories')
      .select('*')
      .order('memory_date', { ascending: false });
    if (error) throw error;
    if (!rows.length) return [];

    const ids = rows.map((row) => row.id);
    const { data: mediaRows, error: mediaError } = await supabase
      .from('memory_media')
      .select('*')
      .in('memory_id', ids)
      .order('sort_order', { ascending: true });
    if (mediaError) throw mediaError;

    const mediaByMemory = mediaRows.reduce((acc, item) => {
      (acc[item.memory_id] ??= []).push(item);
      return acc;
    }, {});

    return rows.map((row) => mapRow(row, mediaByMemory[row.id] ?? []));
  },

  async getById(id) {
    const supabase = getSupabase();
    const { data: row, error } = await supabase.from('memories').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!row) return null;

    const { data: mediaRows, error: mediaError } = await supabase
      .from('memory_media')
      .select('*')
      .eq('memory_id', id)
      .order('sort_order', { ascending: true });
    if (mediaError) throw mediaError;

    return mapRow(row, mediaRows ?? []);
  },

  async create(payload) {
    const memoryId = crypto.randomUUID();
    const coverPath = await storageService.uploadFile(memoryId, 'covers', payload.coverFile);

    const mediaPaths = payload.mediaFiles?.length
      ? await storageService.uploadMany(memoryId, 'media', payload.mediaFiles)
      : [];

    const supabase = getSupabase();
    const { error } = await supabase.from('memories').insert({
      id: memoryId,
      title: payload.title,
      memory_date: payload.date,
      description: payload.description,
      cover_path: coverPath,
      ...songColumns(payload.song)
    });
    if (error) throw error;

    if (mediaPaths.length) {
      const { error: mediaError } = await supabase.from('memory_media').insert(
        mediaPaths.map((path, index) => ({
          memory_id: memoryId,
          storage_path: path,
          media_type: payload.mediaFiles[index].type.startsWith('video/') ? 'video' : 'image',
          sort_order: index
        }))
      );
      if (mediaError) throw mediaError;
    }

    return this.getById(memoryId);
  },

  async update(id, payload, existing) {
    let coverPath = existing.coverPath;

    if (payload.coverFile) {
      coverPath = await storageService.uploadFile(id, 'covers', payload.coverFile);
      await storageService.removePaths([existing.coverPath]);
    }

    // Si la canción cambió y la anterior era un archivo subido, se limpia del bucket.
    const songChanged = (payload.song?.previewUrl ?? null) !== (existing.song?.previewUrl ?? null);
    let songPath = existing.songPath;
    if (songChanged && existing.songPath) {
      await storageService.removePaths([existing.songPath]);
      songPath = null;
    }

    if (payload.mediaFiles?.length) {
      await storageService.removePaths(existing.media.map((item) => item.path));
      const mediaPaths = await storageService.uploadMany(id, 'media', payload.mediaFiles);
      const supabase = getSupabase();
      await supabase.from('memory_media').delete().eq('memory_id', id);
      const { error: mediaError } = await supabase.from('memory_media').insert(
        mediaPaths.map((path, index) => ({
          memory_id: id,
          storage_path: path,
          media_type: payload.mediaFiles[index].type.startsWith('video/') ? 'video' : 'image',
          sort_order: index
        }))
      );
      if (mediaError) throw mediaError;
    }

    const supabase = getSupabase();
    const { error } = await supabase.from('memories').update({
      title: payload.title,
      memory_date: payload.date,
      description: payload.description,
      cover_path: coverPath,
      song_path: songPath,
      ...songColumns(payload.song)
    }).eq('id', id);
    if (error) throw error;

    return this.getById(id);
  },

  async remove(memory) {
    const paths = [
      memory.coverPath,
      memory.songPath,
      ...memory.media.map((item) => item.path)
    ].filter(Boolean);

    const supabase = getSupabase();
    const { error } = await supabase.from('memories').delete().eq('id', memory.id);
    if (error) throw error;

    await storageService.removePaths(paths);
  }
};
