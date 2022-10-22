export default class YoutubeModal {
  constructor() {
    this.config = {
      autoInit: true,
      className: 'js-YT-video-modal',
      dataKey: 'data-YT-video-id',
      paramsKey: 'data-YT-params',
      background: 'rgba(0,0,0,0.75)',
      closeButton: {
        url: '/event/2021/assets/common/img/close_btn.png',
        width: '24px',
        height: 'auto'
      },
      loop: false
    };
    this.YTVideoModal();
  }

  YTVideoModal() {
    const html = document.body.parentNode;
    const body = document.body;

    const that = this;
    window.YTVideoModal = this;

    const root = document.createElement('div');
    root.className = 'js-modal';
    root.style.opacity = 0;

    const bg = document.createElement('div');
    bg.className = 'js-modal-bg';

    const con = document.createElement('div');
    con.className = 'con';

    const btnClose = document.createElement('div');
    btnClose.className = 'wrapper-btn-close';

    const btnCloseImg = document.createElement('img');
    btnCloseImg.className = 'btn-close';
    btnCloseImg.src = this.config.closeButton.url;

    const wrapperVideo = document.createElement('div');
    wrapperVideo.className = 'wrapper-video';

    const iframeSize = {
      x: 0,
      y: 0,
      w: 640,
      h: 360,
      scale: 0,
      ratio: 0
    };


    this.setParams(
      root.style,
      {
        zIndex: 1000,
        position: 'fixed',
        width: '100%',
        height: '100%',
        left: '0px',
        top: '0px'
      }
    );

    this.setParams(
      bg.style,
      {
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: this.config.background,
        left: '0px',
        top: '0px'
      }
    );

    this.setParams(
      con.style,
      {
        position: 'relative',
        width: 'auto',
        height: 'auto',
        margin: '20px',
        marginTop: '19px',
        borderTop: 'solid 1px transparent'
      }
    );

    this.setParams(
      btnClose.style,
      {
        cursor: 'pointer',
        position: 'relative',
        textAlign: 'right',
        right: '0px',
        top: '0px'
      }
    );
    this.setParams(
      btnCloseImg.style,
      {
        position: 'relative',
        display: 'inline-block',
        width: this.config.closeButton.width,
        height: this.config.closeButton.height,
        right: '0px',
        top: '0px',
        marginBottom: '20px'
      }
    );

    this.setParams(
      wrapperVideo.style,
      {
        position: 'relative',
        left: '0px',
        top: '0px',
        width: '100%',
        height: '100%'
      }
    );

    btnClose.appendChild(btnCloseImg);
    con.appendChild(btnClose);
    con.appendChild(wrapperVideo);
    root.appendChild(bg);
    root.appendChild(con);
    root.style.visibility = '';


    const onResize = () => {
      const htmlWidth = html.offsetWidth;
      const htmlHeight = html.offsetHeight;

      iframeSize.scale = Math.max(640 / (htmlWidth - 40), 360 / (htmlHeight - 40 - 80));

      iframeSize.w = 640 / iframeSize.scale;
      iframeSize.h = 360 / iframeSize.scale;
      iframeSize.x = ((htmlWidth - 40) - iframeSize.w) / 2;
      iframeSize.y = ((htmlHeight - 40 - 80) - iframeSize.h) / 2;

      con.style.width = `${iframeSize.w}px`;
      con.style.height = `${iframeSize.h}px`;
      con.style.left = `${iframeSize.x}px`;
      con.style.top = `${iframeSize.y}px`;

      const iframe = wrapperVideo.getElementsByTagName('iframe')[0];
      if (iframe) {
        iframe.width = iframeSize.w;
        iframe.height = iframeSize.h;
      }
    };
    onResize();
    window.addEventListener('resize', onResize);


    let openedTarget = null;


    const onOpen = (evt) => {
      evt.preventDefault();
      const id = evt.currentTarget.getAttribute(this.config.dataKey);
      const params = evt.currentTarget.getAttribute(this.config.paramsKey);
      openedTarget = evt.currentTarget;
      that.openModal(id, params);
    };


    const onClose = (evt) => {
      switch (evt.type) {
      case 'click':
        that.closeModal();
        btnCloseImg.style.opacity = 1;
        break;

      case 'mouseover':
        btnCloseImg.style.opacity = 0.6;
        break;

      case 'mouseout':
        btnCloseImg.style.opacity = 1;
        break;
      default:
        break;
      }
    };

    btnCloseImg.style.opacity = 1;

    const removeContent = function() {
      root.parentNode.removeChild(root);
      wrapperVideo.innerHTML = '';
    };

    bg.addEventListener('click', onClose);
    btnCloseImg.addEventListener('click', onClose);
    btnCloseImg.addEventListener('mouseover', onClose);
    btnCloseImg.addEventListener('mouseout', onClose);


    let addedList = [];
    that.add = function(target) {
      addedList.push(target);
      target.addEventListener('click', onOpen);
    };


    const opacityTween = function(to, vector, onComplete) {
      opacityTween.to = to;
      opacityTween.vector = vector;
      opacityTween.onComplete = onComplete;
      opacityTween.act();
    };
    opacityTween.opacity = 0;
    opacityTween.to = 0;
    opacityTween.vector = 0;
    opacityTween.requestID = null;
    opacityTween.onComplete = null;
    opacityTween.act = function() {
      opacityTween.requestID = window.requestAnimationFrame(opacityTween.act);

      opacityTween.opacity += opacityTween.vector;

      if (opacityTween.vector < 0) {
        if (opacityTween.opacity <= opacityTween.to) {
          opacityTween.opacity = opacityTween.to;
        }
      } else {
        // eslint-disable-next-line
        if (opacityTween.opacity >= opacityTween.to) {
          opacityTween.opacity = opacityTween.to;
        }
      }

      root.style.opacity = opacityTween.opacity;
      if (opacityTween.opacity === opacityTween.to) {
        window.cancelAnimationFrame(opacityTween.requestID);
        if (opacityTween.onComplete) {
          opacityTween.onComplete();
        }
      }
    };


    that.openModal = function(id, params) {
      onResize();

      if (root.parentNode) return;

      body.style.overflow = 'hidden';

      let loopParams = '';
      if (this.config.loop) {
        loopParams = `&loop=${this.config.loop}&playlist=${id}`;
      }

      wrapperVideo.innerHTML = 	`<iframe
        style="z-index: 1010; position: relative; left: 0px; top: 0px;"
        width="${iframeSize.w}"
        height="${iframeSize.h}"
        src="//www.youtube.com/embed/${id}?autoplay=1&showinfo=1&rel=0&wmode=transparent&mute=1&playsinline=1&iv_load_policy=3${loopParams}&${params}"
        frameborder="0"
        allowfullscreen
      ></iframe>`;
      body.appendChild(root);
      opacityTween(1, 0.15);
    };

    that.closeModal = function() {
      if (body.style.overflow === '') return;
      body.style.overflow = '';
      opacityTween(0, -0.15, removeContent);
      const onclose = openedTarget.getAttribute('data-onclose');
      if (onclose && window[onclose]) {
        window[onclose]();
      }
      openedTarget = null;
    };


    that.dispose = function() {
      if (addedList.length) {
        for (let i = 0; i < addedList.length; i += 1) {
          addedList[i].removeEventListener('click', onOpen);
        }
        addedList = [];
      }
    };

    that.parse = function() {
      that.dispose();
      const autoSettingTarget = document.getElementsByClassName(this.config.className);
      for (let i = 0; i < autoSettingTarget.length; i += 1) {
        that.add(autoSettingTarget[i]);
      }
    };
    that.parse();
  }

  setParams(target, initObj, execution) {
    const tgt = target;
    if (tgt instanceof Array) {
      // eslint-disable-next-line
      for (const i in tgt) this.setParams(tgt[i], initObj);
      return;
    }

    if (tgt && initObj) {
      // eslint-disable-next-line
      for (const paramStr in initObj) {
        if (execution || tgt[paramStr] !== undefined) {
          if (initObj[paramStr] instanceof Function) {
            tgt[paramStr] = initObj[paramStr];
          } else if (initObj[paramStr] instanceof Object) {
            this.setParams(tgt[paramStr], initObj[paramStr]);
          } else {
            tgt[paramStr] = initObj[paramStr];
          }
        }
      }
    }
  }
}
