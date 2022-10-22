export default class AnchorScroll {
  constructor() {
    window.$ = window.jQuery;
    this.instance = [];
    this.initScroll();
    this.add();
  }

  initScroll() {
    const target = window.location.href.split('#');

    if (window.$(`#${target[1]}`).length > 0) {
      const adjust = window.$('.header').height();

      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          const position = window.$(`#${target[1]}`).offset().top - adjust;
          window.$('body,html').animate({ scrollTop: position }, 500, 'easeOutQuart');
        }, 800);
      });
    }
  }

  add(target) {
    if (target) {
      this.check(target);
    } else {
      const a = document.getElementsByTagName('a');
      for (let i = 0; i < a.length; i += 1) {
        this.check(a[i]);
      }
    }
  }

  check(target) {
    if (this.instance.indexOf(target) !== -1) {
      return;
    }

    if (/#/.test(target.href)) {
      const hrefSplit = target.href.split('#')[0].split('/');
      if (hrefSplit[hrefSplit.length - 1] === '') {
        hrefSplit[hrefSplit.length - 1] = 'index.html';
      }

      const currentHrefSplit = window.location.href.split('#')[0].split('/');
      if (currentHrefSplit[hrefSplit.length - 1] === '') {
        currentHrefSplit[hrefSplit.length - 1] = 'index.html';
      }

      if (
        hrefSplit[hrefSplit.length - 1] !== currentHrefSplit[hrefSplit.length - 1]
        || hrefSplit[hrefSplit.length - 2] !== currentHrefSplit[hrefSplit.length - 2]
      ) {
        return;
      }

      if (target.hasAttribute('data-no-scroll')) {
        return;
      }

      this.instance.push(target);
      window.$(target).on('click', this.onAnchorClick.bind(this));
    }
  }

  onAnchorClick(evt) {
    evt.preventDefault();
    const hash = evt.currentTarget.href.split('#')[1].split('?')[0];
    let target;
    if (hash !== '') {
      target = document.getElementById(hash);
      target.id = '';
      window.location.href = `#${hash}`;
      target.id = hash;
    }
    this.toScroll(target);
  }

  toScroll(target, time, transition) {
    if (time === undefined) {
      this.time = 800;
    }
    if (transition === undefined) {
      this.transition = 'easeInOutQuint';
    }
    let top = 0;
    if (target) {
      top = this.getOffsetTop(target);
    }

    // eslint-disable-next-line
    const adjust = (window.innerWidth < 737) ? 62 : 80 ;
    top -= adjust;
    if (window.Fit && window.Fit.zoomScale) {
      // eslint-disable-next-line
      top = top * window.Fit.zoomScale;
    }


    window.$('html, body').animate(
      {
        scrollTop: top
      },
      this.time,
      this.transition
    );
  }

  getOffsetTop(target, rootTarget) {
    if (rootTarget === undefined) {
      this.rootTarget = document;
    }

    let targetY = target.offsetTop;
    let parent = target.offsetParent;
    while (parent && parent !== document.body) {
      targetY += parent.offsetTop;
      parent = parent.offsetParent;
    }
    return targetY;
  }
}
