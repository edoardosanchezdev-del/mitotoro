export const createNavigation = () => {
  const buttons = [...document.querySelectorAll('[data-page-target]')];
  let activePage = document.querySelector('[data-page].is-active');

  const changePage = (pageName) => {
    const nextPage = document.querySelector(`[data-page="${pageName}"]`);
    if (!nextPage || nextPage === activePage) return;

    const previousPage = activePage;
    nextPage.hidden = false;
    nextPage.classList.add('is-entering');
    window.scrollTo({ top: 0, behavior: 'auto' });

    requestAnimationFrame(() => {
      previousPage.classList.remove('is-active');
      previousPage.classList.add('is-leaving');
      nextPage.classList.add('is-active');
      nextPage.classList.remove('is-entering');
    });

    window.setTimeout(() => {
      previousPage.hidden = true;
      previousPage.classList.remove('is-leaving');
    }, 330);

    buttons.forEach((button) => {
      const selected = button.dataset.pageTarget === pageName;
      button.classList.toggle('is-active', selected);
      button.toggleAttribute('aria-current', selected);
    });

    activePage = nextPage;
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => changePage(button.dataset.pageTarget));
  });

  return { changePage };
};
