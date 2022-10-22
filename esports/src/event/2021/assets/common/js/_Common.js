import ScrollEnterEvent from './site/ScrollEnterEvent';
import SpMenu from './site/SpMenu';
import ShareBtn from './site/ShareBtn';
import AnchorScroll from './site/AnchorScroll';
import YoutubeModal from './site/YoutubeModal';

export default class Common {
  constructor() {
    new SpMenu();
    new ShareBtn();
    new AnchorScroll();
    window.ScrollEnterEvent = new ScrollEnterEvent();
    new YoutubeModal();
  }
}
