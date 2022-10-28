import Main from './Main';

class Entry {
  constructor() {
    new Main();
  }
}

window.addEventListener('DOMContentLoaded', () => new Entry());
