/**
 * AnchorScrollerクラス
 * ・URLやアンカーリンクにスクロール効果適用
 * ・jQuery不要
 * @example
 * new AnchorScroller();
 * 
 * 固定ヘッダがある場合のCSS
 * section:before {
 *    content: "";
 *    display: block;
 *    visibility: hidden;
 *    margin-top: -120px; // -ヘッダの高さ
 *    height: 120px; // ヘッダの高さ
 * }
 */
export default class AnchorScroller {
    constructor() {
        const anchorStr = window.location.href.split('#')[1];
        if(anchorStr) setTimeout(() => {this._scrollHandler(anchorStr)}, 400); // ページ遷移処理
        this._clickHandler(); // クリックイベント設定
    }

    _clickHandler() {
        const aTags = document.querySelectorAll('a[href^="#"]');
        if(aTags.length === 0) return;
        aTags.forEach(aTag => {
            aTag.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const anchorStr = aTag.getAttribute('href').replace('#', '');
                this._scrollHandler(anchorStr)
            });
        });
    }

    _scrollHandler(anchorStr) {
        const targetElm = document.getElementById(anchorStr);
        targetElm.scrollIntoView({behavior: 'smooth'});
    }
}
