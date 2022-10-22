export default class RequestAnimationFrame {
  constructor() {
    window.requestAnimationFrame = window.requestAnimationFrame
                                || window.webkitRequestAnimationFrame
                                || function (func) {
                                  return setTimeout(
                                    func,
                                    1000 / 60
                                  );
                                };

    window.cancelAnimationFrame = window.cancelAnimationFrame
      || window.webkitCancelAnimationFrame
      || function (id) {
        clearTimeout(id);
      };
  }
}
