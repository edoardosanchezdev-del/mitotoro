const ENDPOINT = 'https://itunes.apple.com/search';

// Búsqueda en el catálogo de Apple Music (API pública de iTunes, sin API key).
// Devuelve previews de 30 segundos, como las historias de Instagram.
export const musicService = {
  async search(term) {
    const params = new URLSearchParams({
      term,
      media: 'music',
      entity: 'song',
      limit: '8',
      country: 'MX',
      lang: 'es_mx'
    });
    const response = await fetch(`${ENDPOINT}?${params}`);
    if (!response.ok) throw new Error('No se pudo buscar la canción. Intenta de nuevo.');
    const data = await response.json();
    return (data.results ?? [])
      .filter((item) => item.previewUrl)
      .map((item) => ({
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName ?? '',
        artworkUrl: item.artworkUrl100?.replace('100x100', '300x300') ?? '',
        previewUrl: item.previewUrl
      }));
  }
};
