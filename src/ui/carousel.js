export const renderCarousel = (items) => {
  const carousel = document.createElement('div');
  carousel.className = 'carousel';
  let position = 0;

  const viewport = document.createElement('div');
  viewport.className = 'carousel-viewport';
  const track = document.createElement('div');
  track.className = 'carousel-track';

  items.forEach((item, index) => {
    const slide = document.createElement('figure');
    slide.className = 'carousel-slide';
    const element = document.createElement(item.type === 'video' ? 'video' : 'img');
    element.src = item.url;
    element.alt = `Recuerdo ${index + 1}`;
    if (element.tagName === 'VIDEO') {
      element.controls = true;
      element.playsInline = true;
    }
    slide.append(element);
    track.append(slide);
  });

  viewport.append(track);
  carousel.append(viewport);

  if (items.length > 1) {
    const controls = document.createElement('div');
    controls.className = 'carousel-controls';
    const previous = document.createElement('button');
    const next = document.createElement('button');
    const counter = document.createElement('span');
    previous.type = next.type = 'button';
    previous.textContent = '←';
    previous.setAttribute('aria-label', 'Anterior');
    next.textContent = '→';
    next.setAttribute('aria-label', 'Siguiente');

    const update = () => {
      track.style.transform = `translateX(-${position * 100}%)`;
      counter.textContent = `${position + 1} / ${items.length}`;
      previous.disabled = position === 0;
      next.disabled = position === items.length - 1;
    };

    previous.addEventListener('click', () => { position -= 1; update(); });
    next.addEventListener('click', () => { position += 1; update(); });
    controls.append(previous, counter, next);
    carousel.append(controls);
    update();
  }

  return carousel;
};
