class HeaderShow {
  constructor() {
    this.header = document.querySelector('.js-header');
    this.btn = document.querySelector('.js-sp-menu-btn');

    this.onScroll();
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  onScroll() {
    const showPosition = window.innerHeight * 0.8;

    if (window.pageYOffset > showPosition && !this.header.classList.contains('is-show')) {
      this.header.classList.add('is-show');
    } else if (window.pageYOffset < showPosition && this.header.classList.contains('is-show')) {
      this.header.classList.remove('is-show');

      this.btn.classList.remove('is-open');
    }
  }
}

export default HeaderShow;
