export default class SpMenu {
  constructor() {
    this.showToggle();
    this.accordionToggle();
  }

  showToggle() {
    this.btn = document.getElementsByClassName('js-sp-menu-btn')[0];
    if (this.btn) {
      this.btn.addEventListener('click', this.btnClickHandler.bind(this));
    }

    this.menu = document.getElementsByClassName('js-sp-menu')[0];
    if (this.menu) {
      this.menu.addEventListener('click', this.menuClickHandler.bind(this));
    }
  }

  btnClickHandler() {
    this.btn.classList.toggle('is-open');
  }

  menuClickHandler() {
    const btn = this.menu.previousElementSibling;
    btn.classList.toggle('is-open');
  }

  accordionToggle() {
    const btns = document.querySelectorAll('.js-accordion');
    const subBtns = document.querySelectorAll('.gNav__sublink');

    for (let i = 0; i < btns.length; i += 1) {
      btns[i].addEventListener('click', this.subBtnClickHandler, false);
    }

    for (let j = 0; j < subBtns.length; j += 1) {
      subBtns[j].addEventListener('click', (event) => {
        event.stopPropagation();
        this.btn.classList.remove('is-open');
      });
    }
  }

  subBtnClickHandler(event) {
    event.stopPropagation();
    event.target.classList.toggle('is-open');
  }
}
