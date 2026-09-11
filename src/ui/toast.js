const DEFAULT = 'un besito enviado ♡';

export const createToast = (element) => {
  let timer = null;

  return (message = DEFAULT) => {
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => {
      element.classList.remove('show');
      element.textContent = DEFAULT;
    }, 2400);
  };
};
