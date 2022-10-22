import RequestAnimationFrame from '../../common/js/utils/RequestAnimationFrame';
import DocumentReady from '../../common/js/utils/DocumentReady';
import Main from './Main';

class Entry {
  constructor() {
    new Main('ja');
  }
}

(function() {
  new RequestAnimationFrame();
  new DocumentReady(Entry);
}());
