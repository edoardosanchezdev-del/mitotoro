import { registerSW } from 'virtual:pwa-register';
import { isConfigured } from './config.js';
import { quoteService } from './services/quotes.js';
import { createAuthGate } from './ui/auth.js';
import { initFloaties } from './ui/floaties.js';
import { createMemoriesController } from './ui/memories.js';
import { createNavigation } from './ui/navigation.js';
import { initReveal } from './ui/reveal.js';
import { createToast } from './ui/toast.js';
import './styles/styles.css';
import './styles/theme.css';

const boot = async () => {
  const today = new Date();
  const quote = quoteService.getToday(today);

  document.querySelector('#dailyQuote').textContent = `“${quote.text}”`;
  document.querySelector('#quoteDay').textContent = quote.dayNumber;
  document.querySelector('#todayLabel').textContent = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long'
  }).format(today);

  const showToast = createToast(document.querySelector('#toast'));
  const revealObserver = initReveal();
  const { changePage } = createNavigation();

  const spawnFloaty = initFloaties();

  document.querySelector('#heartButton').addEventListener('click', () => {
    showToast('un besito enviado ♡');
    // Un besito también invoca amiguitos.
    spawnFloaty();
    setTimeout(spawnFloaty, 350);
    setTimeout(spawnFloaty, 750);
  });

  if (!isConfigured()) {
    document.querySelector('#configWarning').hidden = false;
    return;
  }

  let memoriesController;
  const authGate = createAuthGate({
    showToast,
    onAuthenticated: async () => {
      if (!memoriesController) {
        memoriesController = createMemoriesController({ showToast, revealObserver, changePage });
      }
      await memoriesController.refresh();
    }
  });

  await authGate.bootstrap();

  registerSW({ immediate: true });
};

boot().catch((error) => {
  console.error('Error al iniciar la app:', error);
  const warning = document.querySelector('#configWarning');
  warning.querySelector('div').innerHTML =
    `<p>Algo falló al iniciar la app.</p><p style="font-size:13px;color:#8f7072">${error?.message ?? error}</p>`;
  warning.hidden = false;
});
