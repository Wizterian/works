export default class SlideBanner {
  constructor() {
    const $ = window.jQuery;
    $('.js-slide').slick({
      dots: true,
      arrows: false,
      autoplay: true,
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 1,
      centerMode: true,
      responsive: [{
        breakpoint: 736,
        settings: {
          slidesToShow: 1,
          centerMode: false
        }
      }]
    });

    $('.js-entry-slide').slick({
      dots: true,
      arrows: true,
      autoplay: false,
      infinite: false,
      slidesToShow: 1,
      slidesToScroll: 1,
      centerMode: true,
      adaptiveHeight: true,
      prevArrow: '<button class="slick-prev slick-arrow">前のSTEPへ</button>',
      nextArrow: '<button class="slick-next slick-arrow">次のSTEPへ</button>'
    });

    const img = $('.js-zoom-img');
    const modal = $('.js-zoom-modal');
    let scrollPos = 0;

    $('.js-zoom').on('click', (e) => {
      const imgsrc = $(e.currentTarget).data('img');

      img.attr('src', imgsrc);
      scrollPos = $(window).scrollTop();

      $('html').addClass('is-modal');

      if (e.currentTarget.classList.contains('top-finalistItem__teamThumb')) {
        document.querySelector('.js-zoom-img').classList.add('is-finalist');
      }

      modal.fadeIn(300);
    });

    $('.js-zoom-close, .js-zoom-bg').on('click', (e) => {
      modal.fadeOut(300);
      $('html').removeClass('is-modal');
      $(window).scrollTop(scrollPos);
      e.stopPropagation();

      if (
        e.currentTarget.classList.contains('js-zoom-close')
        || e.currentTarget.classList.contains('js-zoom-bg')
      ) {
        document.querySelector('.js-zoom-img').classList.remove('is-finalist');
      }
    });

    $('.js-zoom-bg').children().on('click', (e) => {
      e.stopPropagation();
    });
  }
}
