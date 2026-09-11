import { memoryService } from '../services/memories.js';
import { musicService } from '../services/music.js';
import { shareService } from '../services/share.js';
import { renderCarousel } from './carousel.js';

const formatDate = (value) => new Intl.DateTimeFormat('es-MX', {
  day: '2-digit', month: 'short', year: 'numeric'
}).format(new Date(`${value}T12:00:00`)).replace(/\./g, '').toUpperCase();

export const createMemoriesController = ({ showToast, revealObserver, changePage }) => {
  const list = document.querySelector('#memoryList');
  const count = document.querySelector('#memoryCount');
  const modal = document.querySelector('#modal');
  const detailCard = document.querySelector('#detailCard');
  const modalActions = document.querySelector('#modalActions');
  const sharePanel = document.querySelector('#sharePanel');
  const editor = document.querySelector('#editor');
  const form = document.querySelector('#memoryForm');
  const saveBtn = document.querySelector('#saveMemory');

  const titleInput = document.querySelector('#memoryTitle');
  const dateInput = document.querySelector('#memoryDate');
  const descriptionInput = document.querySelector('#memoryDescription');
  const coverInput = document.querySelector('#memoryCover');
  const mediaInput = document.querySelector('#memoryMedia');
  const coverLabel = document.querySelector('#memoryCoverLabel');
  const mediaLabel = document.querySelector('#memoryMediaLabel');

  const songSearchInput = document.querySelector('#songSearch');
  const songResults = document.querySelector('#songResults');
  const songSelected = document.querySelector('#songSelected');
  const songTrim = document.querySelector('#songTrim');
  const songStartInput = document.querySelector('#songStart');
  const songStartLabel = document.querySelector('#songStartLabel');
  const songTrimPlay = document.querySelector('#songTrimPlay');

  let memories = [];
  let viewingMemory = null;
  let editingMemory = null;
  let isSaving = false;
  let selectedSong = null;
  let searchTimer = null;
  let previewAudio = null;

  /* ------------------------------ canciones ------------------------------ */

  const formatSeconds = (value) => `0:${String(value).padStart(2, '0')}`;

  const stopPreview = () => {
    previewAudio?.pause();
    previewAudio = null;
    songResults.querySelectorAll('.song-play.playing').forEach((btn) => {
      btn.classList.remove('playing');
      btn.textContent = '▶';
    });
    songTrimPlay.textContent = '▶ escuchar desde aquí';
  };

  const renderSelectedSong = () => {
    songSelected.hidden = !selectedSong;
    songTrim.hidden = !selectedSong;
    if (!selectedSong) return;
    document.querySelector('#songSelectedArt').src = selectedSong.artworkUrl || '';
    document.querySelector('#songSelectedTitle').textContent = selectedSong.title;
    document.querySelector('#songSelectedArtist').textContent = selectedSong.artist;
    songStartInput.value = String(selectedSong.startSeconds ?? 0);
    songStartLabel.textContent = `desde ${formatSeconds(selectedSong.startSeconds ?? 0)}`;
  };

  const selectSong = (song) => {
    stopPreview();
    selectedSong = { ...song, startSeconds: 0 };
    songResults.hidden = true;
    songResults.innerHTML = '';
    songSearchInput.value = '';
    renderSelectedSong();
  };

  songStartInput.addEventListener('input', () => {
    if (!selectedSong) return;
    selectedSong.startSeconds = Number(songStartInput.value);
    songStartLabel.textContent = `desde ${formatSeconds(selectedSong.startSeconds)}`;
    if (previewAudio) previewAudio.currentTime = selectedSong.startSeconds;
  });

  songTrimPlay.addEventListener('click', () => {
    if (!selectedSong) return;
    if (previewAudio) {
      stopPreview();
      return;
    }
    previewAudio = new Audio(selectedSong.previewUrl);
    previewAudio.addEventListener('loadedmetadata', () => {
      if (previewAudio) previewAudio.currentTime = selectedSong.startSeconds ?? 0;
    }, { once: true });
    previewAudio.play();
    previewAudio.onended = stopPreview;
    songTrimPlay.textContent = '❚❚ pausar';
  });

  const renderSongResults = (items) => {
    songResults.innerHTML = '';
    songResults.hidden = !items.length;

    items.forEach((song) => {
      const row = document.createElement('div');
      row.className = 'song-result';

      const art = document.createElement('img');
      art.src = song.artworkUrl;
      art.alt = '';
      art.width = art.height = 42;
      art.loading = 'lazy';

      const info = document.createElement('button');
      info.type = 'button';
      info.className = 'song-info';
      info.innerHTML = `<p>${song.title}</p><span>${song.artist}</span>`;
      info.addEventListener('click', () => selectSong(song));

      const play = document.createElement('button');
      play.type = 'button';
      play.className = 'song-play';
      play.textContent = '▶';
      play.setAttribute('aria-label', `Escuchar ${song.title}`);
      play.addEventListener('click', () => {
        const wasPlaying = play.classList.contains('playing');
        stopPreview();
        if (wasPlaying) return;
        previewAudio = new Audio(song.previewUrl);
        previewAudio.play();
        previewAudio.onended = stopPreview;
        play.classList.add('playing');
        play.textContent = '❚❚';
      });

      row.append(art, info, play);
      songResults.append(row);
    });
  };

  songSearchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const term = songSearchInput.value.trim();
    if (term.length < 3) {
      songResults.hidden = true;
      songResults.innerHTML = '';
      return;
    }
    searchTimer = setTimeout(async () => {
      try {
        songResults.innerHTML = '<p class="song-searching">buscando...</p>';
        songResults.hidden = false;
        renderSongResults(await musicService.search(term));
      } catch {
        songResults.innerHTML = '<p class="song-searching">no se pudo buscar, revisa tu conexión</p>';
      }
    }, 450);
  });

  document.querySelector('#songRemove').addEventListener('click', () => {
    selectedSong = null;
    renderSelectedSong();
  });

  /* ------------------------------ detalle ------------------------------ */

  const renderSongPlayer = (memory) => {
    detailCard.querySelector('.memory-song')?.remove();
    if (!memory.song?.previewUrl) return;

    const block = document.createElement('div');
    block.className = 'memory-song';
    block.innerHTML = `
      <p class="memory-song-label">♫ nuestra canción</p>
      <div class="memory-song-row">
        ${memory.song.artworkUrl ? `<img src="${memory.song.artworkUrl}" alt="" width="52" height="52">` : ''}
        <p class="memory-song-meta">${memory.song.title}${memory.song.artist ? `<span>${memory.song.artist}</span>` : ''}</p>
      </div>
    `;
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.preload = 'none';
    audio.src = memory.song.previewUrl;
    const start = memory.song.startSeconds ?? 0;
    if (start > 0) {
      audio.addEventListener('loadedmetadata', () => { audio.currentTime = start; }, { once: true });
    }
    block.append(audio);
    detailCard.querySelector('.modal-hearts').before(block);
  };

  const openMemory = (memory, { editable = false, shareable = false } = {}) => {
    viewingMemory = editable || shareable ? memory : null;
    modalActions.hidden = !editable;
    sharePanel.hidden = !shareable;

    document.querySelector('#modalTitle').textContent = memory.title;
    document.querySelector('#modalDate').textContent = memory.id
      ? formatDate(memory.date)
      : (memory.date || 'CON TODO MI AMOR');
    document.querySelector('#modalText').textContent = memory.description
      || (memory.id ? 'Un capítulo bonito de nuestra historia.' : '');

    detailCard.classList.toggle('detail-card', Boolean(memory.media?.length || memory.song));
    detailCard.querySelector('.carousel')?.remove();
    detailCard.querySelector('.memory-song')?.remove();

    if (memory.media?.length) {
      detailCard.querySelector('.modal-hearts').before(renderCarousel(memory.media));
    }
    renderSongPlayer(memory);

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  };

  const closeMemory = () => {
    detailCard.querySelector('.memory-song audio')?.pause();
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    viewingMemory = null;
    modalActions.hidden = true;
    sharePanel.hidden = true;
  };

  /* ------------------------------ editor ------------------------------ */

  const setLoading = (state) => {
    isSaving = state;
    saveBtn.disabled = state;
    saveBtn.textContent = state ? 'guardando...' : (editingMemory ? 'guardar cambios' : 'guardar para siempre');
  };

  const openEditor = (memory = null) => {
    editingMemory = memory;
    document.querySelector('#editorEyebrow').textContent = memory ? 'EDITAR CAPÍTULO' : 'NUEVO CAPÍTULO';
    document.querySelector('#editorHeading').textContent = memory ? 'Actualicemos esto.' : 'Guardemos esto.';
    saveBtn.textContent = memory ? 'guardar cambios' : 'guardar para siempre';

    titleInput.value = memory?.title ?? '';
    dateInput.value = memory?.date ?? '';
    descriptionInput.value = memory?.description ?? '';
    coverInput.required = !memory;
    coverInput.value = '';
    mediaInput.value = '';
    songSearchInput.value = '';
    songResults.hidden = true;
    songResults.innerHTML = '';
    selectedSong = memory?.song ?? null;
    renderSelectedSong();

    coverLabel.textContent = memory?.coverPath ? 'cambiar portada' : 'elegir imagen';
    mediaLabel.textContent = memory?.media?.length
      ? `reemplazar archivos (${memory.media.length} actuales)`
      : 'añadir fotos y videos';

    closeMemory();
    editor.classList.add('open');
    editor.setAttribute('aria-hidden', 'false');
  };

  const closeEditor = () => {
    stopPreview();
    editingMemory = null;
    selectedSong = null;
    form.reset();
    coverInput.required = true;
    coverLabel.textContent = 'elegir imagen';
    mediaLabel.textContent = 'añadir fotos y videos';
    songResults.hidden = true;
    songResults.innerHTML = '';
    songSelected.hidden = true;
    setLoading(false);
    editor.classList.remove('open');
    editor.setAttribute('aria-hidden', 'true');
  };

  /* ------------------------------ listado ------------------------------ */

  const renderMemories = () => {
    list.innerHTML = '';
    count.textContent = String(memories.length).padStart(2, '0');

    if (!memories.length) {
      list.innerHTML = '<div class="empty-album reveal visible">Aquí vivirán las historias que quieran volver a sentir.<span>EMPIECEN CON SU PRIMER RECUERDO ♡</span></div>';
      return;
    }

    memories.forEach((memory, index) => {
      const card = document.createElement('article');
      card.className = `memory-card reveal ${index % 2 ? 'slide-right short' : 'slide-left'}`;
      card.innerHTML = `
        <img src="${memory.coverUrl}" alt="Portada de ${memory.title}" loading="lazy" decoding="async">
        <div class="card-overlay"></div>
        <div class="card-copy">
          <p>${formatDate(memory.date)}</p>
          <h3>${memory.title.replace(/ /g, '<br>')}</h3>
          <span>ver recuerdos <b>→</b></span>
        </div>`;
      card.addEventListener('click', () => openMemory(memory, { editable: true, shareable: true }));
      list.append(card);
      revealObserver.observe(card);
    });
  };

  const refresh = async () => {
    memories = await memoryService.list();
    renderMemories();
  };

  const openFromQuery = async () => {
    const id = new URLSearchParams(window.location.search).get('m');
    if (!id) return;
    const memory = await memoryService.getById(id);
    if (!memory) return;
    changePage('recuerdos');
    openMemory(memory, { shareable: true });
    window.history.replaceState({}, '', window.location.pathname);
  };

  /* ------------------------------ eventos ------------------------------ */

  document.querySelector('#loveLetter').addEventListener('click', () => openMemory({
    title: 'Una cartita para ti',
    date: 'CON TODO MI AMOR',
    description: 'Gracias por llegar a mi vida y convertirla en un lugar al que siempre quiero volver. Te elegiría en todas mis vidas.'
  }));

  document.querySelector('#closeModal').addEventListener('click', closeMemory);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeMemory(); });

  document.querySelector('#editMemory').addEventListener('click', () => {
    if (viewingMemory) openEditor(viewingMemory);
  });

  document.querySelector('#deleteMemory').addEventListener('click', async () => {
    if (!viewingMemory) return;
    if (!confirm(`¿Eliminar "${viewingMemory.title}"? No se puede deshacer.`)) return;
    try {
      await memoryService.remove(viewingMemory);
      memories = memories.filter((item) => item.id !== viewingMemory.id);
      closeMemory();
      renderMemories();
      showToast('recuerdo eliminado ♡');
    } catch {
      showToast('no pudimos eliminar el recuerdo');
    }
  });

  document.querySelector('#addMemory').addEventListener('click', () => openEditor());
  document.querySelector('#closeEditor').addEventListener('click', closeEditor);
  editor.addEventListener('click', (event) => { if (event.target === editor) closeEditor(); });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isSaving) return;

    const payload = {
      title: titleInput.value.trim(),
      date: dateInput.value,
      description: descriptionInput.value.trim(),
      coverFile: coverInput.files[0] ?? null,
      mediaFiles: [...mediaInput.files],
      song: selectedSong
    };

    if (!editingMemory && !payload.coverFile) {
      showToast('elige una imagen de portada');
      return;
    }

    setLoading(true);
    try {
      if (editingMemory) {
        await memoryService.update(editingMemory.id, payload, editingMemory);
        showToast('recuerdo actualizado ♡');
      } else {
        await memoryService.create(payload);
        showToast('recuerdo guardado ♡');
      }
      closeEditor();
      await refresh();
    } catch (error) {
      alert(error.message || 'No pudimos guardar ese recuerdo.');
    } finally {
      setLoading(false);
    }
  });

  document.querySelector('#shareStory').addEventListener('click', async () => {
    if (!viewingMemory) return;
    try {
      const result = await shareService.shareStory(viewingMemory);
      if (result === 'shared') showToast('recuerdo compartido ♡');
      if (result === 'downloaded') showToast('imagen descargada: súbela a tu historia ♡');
    } catch {
      showToast('no se pudo compartir');
    }
  });

  document.querySelector('#shareWhatsApp').addEventListener('click', () => {
    if (viewingMemory) shareService.openWhatsApp(viewingMemory);
  });

  document.querySelector('#shareFacebook').addEventListener('click', () => {
    if (viewingMemory) shareService.openFacebook(viewingMemory);
  });

  document.querySelector('#shareCopy').addEventListener('click', async () => {
    if (!viewingMemory) return;
    await shareService.copyLink(viewingMemory);
    showToast('enlace copiado ♡');
  });

  return { refresh, openFromQuery };
};
