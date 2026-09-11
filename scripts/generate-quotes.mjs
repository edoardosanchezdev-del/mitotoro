import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'src', 'data', 'quotes.json');

const traits = [
  'tu risa', 'tu mirada', 'tu voz', 'tu calma', 'tu energía', 'tu ternura', 'tu honestidad',
  'tu paciencia', 'tu forma de amar', 'tu manera de escuchar', 'tu abrazo', 'tu sonrisa',
  'tu inteligencia', 'tu sensibilidad', 'tu valentía', 'tu dulzura', 'tu humor', 'tu presencia',
  'tu forma de cuidarme', 'tu manera de hacerme reír', 'tu forma de mirarme', 'tu calidez',
  'tu forma de decir mi nombre', 'tu manera de quedarte', 'tu forma de perdonar', 'tu constancia',
  'tu forma de soñar', 'tu manera de elegirme', 'tu forma de ser tú', 'tu luz'
];

const moments = [
  'cuando te ríes sin filtros', 'cuando me tomas de la mano', 'cuando me miras dormir',
  'cuando bailamos sin música', 'cuando cocinamos juntos', 'cuando caminamos sin prisa',
  'cuando me mandas un mensaje random', 'cuando me abrazas fuerte', 'cuando me calmas',
  'cuando me haces sentir en casa', 'cuando me eliges otra vez', 'cuando me escuchas de verdad',
  'cuando compartimos silencio', 'cuando planeamos cosas pequeñas', 'cuando me cuidas sin decirlo',
  'cuando me haces reír en días grises', 'cuando me recuerdas lo importante', 'cuando me miras con paciencia',
  'cuando me acompañas sin quejarte', 'cuando celebramos lo mínimo', 'cuando me haces sentir suficiente',
  'cuando me esperas con calma', 'cuando me sorprendes con detalles', 'cuando me dices que confíes',
  'cuando volvemos a empezar juntos', 'cuando me haces sentir elegido', 'cuando me acompañas en lo difícil',
  'cuando me haces sentir seguro', 'cuando me miras como si importara', 'cuando me dices te quiero'
];

const feelings = [
  'paz', 'calma', 'alegría', 'hogar', 'esperanza', 'ternura', 'gratitud', 'confianza',
  'ligereza', 'seguridad', 'inspiración', 'dulzura', 'fortaleza', 'serenidad', 'magia',
  'felicidad', 'compañía', 'cariño', 'armonía', 'calidez', 'propósito', 'ternura infinita'
];

const verbs = ['Amo', 'Adoro', 'Valoro', 'Admiro', 'Agradezco', 'Celebró', 'Atesoro', 'Respeto', 'Quiero'];

const templates = [
  (t) => `${verbs[0]} ${t}, porque es mi refugio favorito.`,
  (t) => `${verbs[0]} ${t}, porque me recuerda que estoy en el lugar correcto.`,
  (t) => `${verbs[1]} ${t}, porque hace que todo se sienta más bonito.`,
  (t) => `${verbs[2]} ${t}, porque es parte de lo que me hace mejor persona.`,
  (t) => `${verbs[3]} ${t}, porque es una de tus cosas más especiales.`,
  (m) => `${verbs[0]} ${m}.`,
  (m) => `${verbs[4]} ${m}, porque ahí veo lo mucho que te importo.`,
  (m) => `${verbs[5]} ${m}, porque son los momentos que guardaría por siempre.`,
  (f) => `Contigo encuentro ${f}, incluso cuando el día pesa.`,
  (f) => `Tu amor me da ${f} de una forma que nadie más logra.`,
  (f) => `Eres mi ${f} disfrazada de persona.`,
  () => 'Amo que contigo puedo ser yo, sin explicaciones y sin miedo.',
  () => 'Amo construir recuerdos contigo, porque son mis tesoros favoritos.',
  () => 'Amo cómo haces hogar en cualquier lugar cuando estás conmigo.',
  () => 'Amo cada versión de ti: la feliz, la soñadora y la que necesita un abrazo.',
  () => 'Amo la manera en que haces que los días normales se sientan especiales.',
  () => 'Amo tu risa, porque es mi sonido favorito en todo el mundo.',
  () => 'Amo tus ojos, porque siempre encuentro un poquito de paz en ellos.',
  () => 'Contigo aprendí que el amor también se nota en los detalles pequeños.',
  () => 'Contigo aprendí que quedarse también es una forma hermosa de amar.',
  () => 'Contigo aprendí que la felicidad puede ser simple y profunda a la vez.',
  () => 'Eres la respuesta a preguntas que ni sabía que tenía.',
  () => 'Siempre serás mi favorito entre todos los planes posibles.',
  () => 'Te elegiría en todas mis vidas, sin dudarlo ni un segundo.',
  () => 'Gracias por convertir lo ordinario en algo que quiero recordar.',
  () => 'Gracias por amarme de formas que se sienten y se notan.',
  () => 'Gracias por ser mi persona favorita en cualquier habitación.',
  () => 'Hay días difíciles, pero nunca días en los que deje de quererte.',
  () => 'Mi corazón te reconoce como su lugar más seguro.',
  () => 'No necesito más suerte: contigo ya gané en la vida.',
  () => 'Eres mi antes favorito y mi después soñado.',
  () => 'Amarte es la decisión más bonita que repito cada día.',
  () => 'Eres mi calma cuando el mundo se acelera demasiado.',
  () => 'Eres mi alegría favorita disfrazada de rutina.',
  () => 'Eres mi hogar, aunque estemos lejos de casa.',
  () => 'Eres mi suerte, mi paz y mi mejor historia.',
  () => 'Eres la parte bonita de mis días más simples.',
  () => 'Eres la razón por la que creo en los finales felices.',
  () => 'Eres la prueba de que el amor bonito sí existe.',
  () => 'Eres mi lugar favorito, pase lo que pase.',
  () => 'Eres mi siempre, mi hoy y mi mañana.',
  () => 'Eres mi refugio y mi aventura al mismo tiempo.',
  () => 'Eres mi paz después de un día largo.',
  () => 'Eres mi sonrisa favorita en cualquier foto.',
  () => 'Eres mi canción favorita en repeat.',
  () => 'Eres mi detalle favorito del universo.',
  () => 'Eres mi historia favorita y aún no termina.',
  () => 'Eres mi promesa favorita de quedarme.',
  () => 'Eres mi razón para creer en lo bonito.',
  () => 'Eres mi razón para sonreír sin motivo.',
  () => 'Eres mi razón para querer cuidar el amor.',
  () => 'Eres mi razón para soñar despierto.',
  () => 'Eres mi razón para volver a casa emocionalmente.',
  () => 'Eres mi razón para amar sin prisa.',
  () => 'Eres mi razón para confiar otra vez.',
  () => 'Eres mi razón para elegir el amor todos los días.',
  () => 'Eres mi razón para creer en los milagros pequeños.',
  () => 'Eres mi razón para guardar recuerdos con cuidado.',
  () => 'Eres mi razón para querer construir futuro.',
  () => 'Eres mi razón para sentirme afortunado.',
  () => 'Eres mi razón para creer en el para siempre.',
  () => 'Eres mi razón para amar con el alma.',
  () => 'Eres mi razón para sonreír al despertar.',
  () => 'Eres mi razón para querer ser mejor.',
  () => 'Eres mi razón para sentir paz en el pecho.',
  () => 'Eres mi razón para creer en las segundas oportunidades.',
  () => 'Eres mi razón para amar los detalles.',
  () => 'Eres mi razón para creer en el amor real.',
  () => 'Eres mi razón para querer quedarme.',
  () => 'Eres mi razón para sentirme completo.',
  () => 'Eres mi razón para amar la vida.',
  () => 'Eres mi razón para creer en nosotros.',
  () => 'Eres mi razón para amar sin condiciones.',
  () => 'Eres mi razón para sentirme en casa.',
  () => 'Eres mi razón para amar con ternura.',
  () => 'Eres mi razón para creer en lo eterno.',
  () => 'Eres mi razón para amar con paciencia.',
  () => 'Eres mi razón para sentirme agradecido.',
  () => 'Eres mi razón para amar con el corazón abierto.',
  () => 'Eres mi razón para creer en los finales bonitos.',
  () => 'Eres mi razón para amar cada día más.',
  () => 'Eres mi razón para sentirme vivo.',
  () => 'Eres mi razón para amar sin miedo.',
  () => 'Eres mi razón para creer en el amor verdadero.',
  () => 'Eres mi razón para amar con intensidad suave.',
  () => 'Eres mi razón para sentirme bendecido.',
  () => 'Eres mi razón para amar con gratitud.',
  () => 'Eres mi razón para creer en lo imposible.',
  () => 'Eres mi razón para amar con el alma entera.',
  () => 'Eres mi razón para sentirme en paz.',
  () => 'Eres mi razón para amar con devoción.',
  () => 'Eres mi razón para creer en lo nuestro.',
  () => 'Eres mi razón para amar con el corazón lleno.',
  () => 'Eres mi razón para sentirme pleno.',
  () => 'Eres mi razón para amar con el alma en calma.',
  () => 'Eres mi razón para creer en el amor profundo.',
  () => 'Eres mi razón para amar con ternura infinita.',
  () => 'Eres mi razón para sentirme querido.',
  () => 'Eres mi razón para amar con el corazón tranquilo.',
  () => 'Eres mi razón para creer en lo sagrado del amor.',
  () => 'Eres mi razón para amar con el alma en paz.',
  () => 'Eres mi razón para sentirme completo contigo.',
  () => 'Eres mi razón para amar con el corazón en calma.',
  () => 'Eres mi razón para creer en el amor eterno.',
  () => 'Eres mi razón para amar con el alma en armonía.',
  () => 'Eres mi razón para sentirme en paz contigo.',
  () => 'Eres mi razón para amar con el corazón en armonía.',
  () => 'Eres mi razón para creer en lo nuestro para siempre.',
  () => 'Eres mi razón para amar con el alma en calma y paz.'
];

const quotes = new Set();

for (const trait of traits) {
  for (const template of templates.slice(0, 5)) {
    quotes.add(template(trait));
    if (quotes.size >= 365) break;
  }
  if (quotes.size >= 365) break;
}

for (const moment of moments) {
  for (const template of templates.slice(5, 8)) {
    quotes.add(template(moment));
    if (quotes.size >= 365) break;
  }
  if (quotes.size >= 365) break;
}

for (const feeling of feelings) {
  for (const template of templates.slice(8, 11)) {
    quotes.add(template(feeling));
    if (quotes.size >= 365) break;
  }
  if (quotes.size >= 365) break;
}

for (const template of templates.slice(11)) {
  quotes.add(typeof template === 'function' ? template() : template);
  if (quotes.size >= 365) break;
}

let index = 0;
while (quotes.size < 365) {
  const trait = traits[index % traits.length];
  const moment = moments[index % moments.length];
  quotes.add(`Amo ${trait} y ${moment}; contigo todo encaja.`);
  quotes.add(`Cada día descubro algo nuevo que amar de ti, y hoy es ${trait}.`);
  quotes.add(`Si hoy fuera un capítulo, sería sobre ${moment}.`);
  quotes.add(`No hay forma de explicar lo mucho que significas, pero empiezo por ${trait}.`);
  index += 1;
}

const list = [...quotes].slice(0, 365);
writeFileSync(output, `${JSON.stringify(list, null, 2)}\n`, 'utf8');
console.log(`Generadas ${list.length} frases en ${output}`);
