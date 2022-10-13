import AnchorScroller from './site/AnchorScroller';
import ShareBtn from './site/ShareBtn';
import YoutubeModal from './site/YoutubeModal';
/**
 * Vue component内で使うものはWindow.xxxxに置き、
 * onMoutedやonUpdatedで呼び出す
 * 動的生成リンクにaddEventListerが付与されない対策
 */
(function () {
    new AnchorScroller();
    window.ShareBtn = new ShareBtn();
    window.YoutubeModal = new YoutubeModal();
}());
  