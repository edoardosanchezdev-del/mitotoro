// Personajes que flotan por la pantalla de vez en cuando.
// Para agregar más, sube la imagen a public/media y añádela aquí.
const IMAGES = [
  '/media/Totoro1.png',
  '/media/imgbin_241ae2c02da9021a09f81d6f246487ca.png',
  '/media/imgbin_a33eff045798d4fa53f08c647726ab97.png',
  '/media/acuarela.png',
  '/media/comunismo.png',
  '/media/coraline.png',
  '/media/coraline2.png',
  '/media/coraline3.png',
  '/media/guitarraelec.png',
  '/media/guitarratlous.png',
  '/media/libros.png',
  '/media/libros2.png',
  '/media/mononoke.png',
  '/media/mononoke2.png',
  '/media/mrpb.png',
  '/media/mrpb2.png',
  '/media/ora.png',
  '/media/pantalones.png',
  '/media/ustedescontrami.png'
];

const random = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

let lastImage = null;
const pickImage = () => {
  let image;
  do { image = pick(IMAGES); } while (image === lastImage && IMAGES.length > 1);
  lastImage = image;
  return image;
};

export const initFloaties = () => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const spawn = () => {
    if (document.hidden) return;

    const floaty = document.createElement('div');
    floaty.className = 'floaty';
    floaty.style.setProperty('--dur', `${random(9, 16)}s`);
    floaty.style.setProperty('--sway', `${random(1.8, 3.2)}s`);
    floaty.style.setProperty('--rot', `${random(-30, 30)}deg`);
    floaty.style.left = `${random(4, 82)}vw`;
    floaty.style.width = `${Math.round(random(56, 130))}px`;

    const img = document.createElement('img');
    img.src = pickImage();
    img.alt = '';
    img.draggable = false;
    floaty.append(img);

    floaty.addEventListener('animationend', () => floaty.remove());
    document.body.append(floaty);
  };

  // Aparición espontánea cada 7-18 segundos.
  const schedule = () => {
    setTimeout(() => {
      spawn();
      schedule();
    }, random(7_000, 18_000));
  };

  schedule();
  setTimeout(spawn, 3_000); // la primera aparición, poco después de entrar

  return spawn;
};
