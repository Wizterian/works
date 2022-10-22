export default class TopScrollEnterEvent {
  constructor() {
    const parallaxs = document.querySelectorAll('.fade-up, .fade-in');
    window.ScrollEnterEvent.add(
      parallaxs, {
        onEnter: (evt) => {
          const e = evt;
          e.target.className += ' parallax';
        },
        marginScale: 0.4
      }
    );
  }
}
