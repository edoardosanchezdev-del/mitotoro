import { memoryService } from '../services/memories.js';
import { musicService } from '../services/music.js';
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

  let memories = [];
  let viewingMemory = null;
  let editingMemory = null;
  let isSaving = false;
  let selectedSong = null;
  let searchTimer = null;
  let previewAudio = null;

  /* ------------------------------ canciones ------------------------------ */

  const stopPreview = () => {
    previewAudio?.pause();
    previewAudio = null;
    songResults.querySelectorAll('.song-play.playing').forEach((btn) => {
      btn.classList.remove('playing');
      btn.textContent = '▶';
    });
  };

  const renderSelectedSong = () => {
    songSelected.hidden = !selectedSong;
    if (!selectedSong) return;
    document.querySelector('#songSelectedArt').src = selectedSong.artworkUrl || '';
    document.querySelector('#songSelectedTitle').textContent = selectedSong.title;
    document.querySelector('#songSelectedArtist').textContent = selectedSong.artist;
  };

  const selectSong = (song) => {
    stopPreview();
    selectedSong = song;
    songResults.hidden = true;
    songResults.innerHTML = '';
    songSearchInput.value = '';
    renderSelectedSong();
  };

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
    block.innerHTML = '<p class="memory-song-label">♫ nuestra canción</p>';

    const audio = document.createElement('audio');
    audio.preload = 'none';
    audio.src = memory.song.previewUrl;
    audio.volume = 0.5;

    const cover = document.createElement('button');
    cover.type = 'button';
    cover.className = 'song-cover';
    cover.setAttribute('aria-label', `Reproducir ${memory.song.title}`);
    cover.innerHTML = `
      ${memory.song.artworkUrl ? `<img src="${memory.song.artworkUrl}" alt="">` : '<span class="song-cover-fallback">♫</span>'}
      <span class="song-cover-state">▶</span>
    `;

    const state = cover.querySelector('.song-cover-state');
    cover.addEventListener('click', () => {
      if (audio.paused) audio.play();
      else audio.pause();
    });
    audio.addEventListener('play', () => { state.textContent = '❚❚'; cover.classList.add('playing'); });
    audio.addEventListener('pause', () => { state.textContent = '▶'; cover.classList.remove('playing'); });
    audio.addEventListener('ended', () => { audio.currentTime = 0; });

    const row = document.createElement('div');
    row.className = 'memory-song-row';
    const meta = document.createElement('p');
    meta.className = 'memory-song-meta';
    meta.innerHTML = `${memory.song.title}${memory.song.artist ? `<span>${memory.song.artist}</span>` : ''}`;
    row.append(cover, meta);
    block.append(row, audio);
    detailCard.querySelector('.modal-hearts').before(block);
  };

  const openMemory = (memory, { editable = false } = {}) => {
    viewingMemory = editable ? memory : null;
    modalActions.hidden = !editable;

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
      card.addEventListener('click', () => openMemory(memory, { editable: true }));
      list.append(card);
      revealObserver.observe(card);
    });
  };

  const refresh = async () => {
    memories = await memoryService.list();
    renderMemories();
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

  return { refresh };
};
