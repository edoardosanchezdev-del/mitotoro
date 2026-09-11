import { authService } from '../services/auth.js';

export const createAuthGate = ({ onAuthenticated, showToast }) => {
  const gate = document.querySelector('#authGate');
  const app = document.querySelector('#appRoot');
  const form = document.querySelector('#authForm');
  const errorEl = document.querySelector('#authError');
  const submitBtn = document.querySelector('#authSubmit');

  const showApp = () => {
    gate.hidden = true;
    app.hidden = false;
    onAuthenticated();
  };

  const showGate = () => {
    gate.hidden = false;
    app.hidden = true;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorEl.textContent = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'entrando...';

    try {
      await authService.signIn(
        document.querySelector('#authEmail').value.trim(),
        document.querySelector('#authPassword').value
      );
      showToast('bienvenidos de vuelta ♡');
      showApp();
    } catch {
      errorEl.textContent = 'Correo o contraseña incorrectos.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'entrar';
    }
  });

  document.querySelector('#authSignOut').addEventListener('click', async () => {
    await authService.signOut();
    showGate();
  });

  return {
    async bootstrap() {
      const session = await authService.getSession();
      if (session) showApp();
      else showGate();
      authService.onAuthChange((nextSession) => {
        if (nextSession) showApp();
        else showGate();
      });
    }
  };
};
