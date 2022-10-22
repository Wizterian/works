import SlideBanner from './site/SlideBanner';
import TopScrollEnterEvent from './site/TopScrollEnterEvent';
import ResultJson from '../../regionals/js/site/ResultJson';

class Main {
  constructor(obj) {
    new SlideBanner();
    new TopScrollEnterEvent();
    new ResultJson({
      webID: obj.website,
      showClose: true
    });
  }
}

export default Main;
