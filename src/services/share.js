import { config } from '../config.js';

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});

const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (context.measureText(test).width > maxWidth && line) {
      context.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) context.fillText(line, x, currentY);
  return currentY;
};

export const shareService = {
  getMemoryUrl(memoryId) {
    const url = new URL(config.appUrl || window.location.origin);
    url.searchParams.set('m', memoryId);
    return url.toString();
  },

  buildShareText(memory) {
    const lines = [
      `✦ ${memory.title}`,
      memory.description ? `"${memory.description}"` : '',
      memory.song ? `🎵 ${memory.song.title}${memory.song.artist ? ` — ${memory.song.artist}` : ''}` : '',
      'Un recuerdo de nosotros ♡'
    ].filter(Boolean);
    return lines.join('\n');
  },

  async createShareCard(memory) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#fffdf8');
    gradient.addColorStop(0.45, '#f3e6dd');
    gradient.addColorStop(1, '#eadabf');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    try {
      const cover = await loadImage(memory.coverUrl);
      const coverHeight = 920;
      ctx.drawImage(cover, 0, 180, canvas.width, coverHeight);
      ctx.fillStyle = 'rgba(32, 18, 20, 0.35)';
      ctx.fillRect(0, 180 + coverHeight - 220, canvas.width, 220);
    } catch {
      ctx.fillStyle = '#f4d8d3';
      ctx.fillRect(0, 180, canvas.width, 920);
    }

    ctx.fillStyle = '#6D4C82';
    ctx.font = '500 72px "Playfair Display", serif';
    wrapText(ctx, memory.title, 72, 1180, 936, 84);

    ctx.fillStyle = '#2A4B7C';
    ctx.font = '400 42px "Playfair Display", serif';
    wrapText(ctx, memory.description || 'Un capítulo bonito de nuestra historia.', 72, 1380, 936, 58);

    if (memory.song) {
      ctx.fillStyle = '#FF7A33';
      ctx.font = '500 36px "DM Mono", monospace';
      ctx.fillText(`♫ ${memory.song.title}${memory.song.artist ? ` — ${memory.song.artist}` : ''}`, 72, 1680);
    }

    ctx.fillStyle = '#9F7150';
    ctx.font = '500 34px "DM Mono", monospace';
    ctx.fillText('NOSOTROS ✦', 72, 1780);
    ctx.fillStyle = '#6D4C82';
    ctx.fillText('mitotoro ♡', 72, 1840);

    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.92));
  },

  // Genera la tarjeta 1080x1920 y abre el menú nativo de compartir del sistema,
  // donde aparecen las historias de WhatsApp, Instagram, Facebook, TikTok, etc.
  // Si el dispositivo no soporta compartir archivos, descarga la imagen.
  async shareStory(memory) {
    const blob = await this.createShareCard(memory);
    const file = new File([blob], 'recuerdo.png', { type: 'image/png' });
    const text = this.buildShareText(memory);

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ title: memory.title, text, files: [file] });
        return 'shared';
      } catch (error) {
        if (error.name === 'AbortError') return 'cancelled';
        throw error;
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: memory.title, text, url: this.getMemoryUrl(memory.id) });
        return 'shared';
      } catch (error) {
        if (error.name === 'AbortError') return 'cancelled';
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recuerdo-${memory.title.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.click();
    URL.revokeObjectURL(url);
    return 'downloaded';
  },

  openWhatsApp(memory) {
    const text = encodeURIComponent(`${this.buildShareText(memory)}\n${this.getMemoryUrl(memory.id)}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  },

  openFacebook(memory) {
    const url = encodeURIComponent(this.getMemoryUrl(memory.id));
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer');
  },

  async copyLink(memory) {
    await navigator.clipboard.writeText(this.getMemoryUrl(memory.id));
  }
};
