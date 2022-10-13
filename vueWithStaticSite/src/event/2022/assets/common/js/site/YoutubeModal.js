class YoutubeModal {
  constructor() {
    this.config = {
      autoInit: true,
      className: 'js-YT-video-modal',
      dataKey: 'data-YT-video-id',
      paramsKey: 'data-YT-params',
      background: 'rgba(0,0,0,0.75)',
      closeButton: {
        url: '',
        width: '100%',
        height: 'auto'
      },
      loop: false
    };
    this.YTVideoModal();
  }

  YTVideoModal() {
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

    this.setParams(
      root.style, {
        zIndex: 1000,
        position: 'fixed',
        width: '100%',
        height: '100%',
        left: '0px',
        top: '0px'
      }
    );

    this.setParams(
      bg.style, {
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: this.config.background,
        left: '0px',
        top: '0px'
      }
    );

    this.setParams(
      con.style, {
        position: 'relative',
        width: 'auto',
        height: 'auto',
        margin: '20px',
        marginTop: '19px',
        borderTop: 'solid 1px transparent'
      }
    );

    this.setParams(
      btnClose.style, {
        cursor: 'pointer',
        position: 'absolute',
        right: '0px',
        top: '-50px',
        width: '50px',
        height: '50px'
      }
    );

    this.setParams(
      wrapperVideo.style, {
        position: 'absolute',
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
      con.style.position = "absolute";
      con.style.width = "calc(100% - 30px)";
      con.style.margin = 0;
      con.style.left = "50%";
      con.style.top = "50%";
      con.style.transform = "translate(-50%, -50%)";
      con.style.paddingTop = "56.25%";

      const iframe = wrapperVideo.getElementsByTagName('iframe')[0];
      if (iframe) {
        iframe.style.width = "100%";
        iframe.height = "100%";
      }
    };
    onResize();
    window.addEventListener('resize', onResize);


    //     -     -     -     -     -     -     -     -     -     -

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
        btnClose.style.opacity = 1;
        break;

      case 'mouseover':
        btnClose.style.opacity = 0.6;
        break;

      case 'mouseout':
        btnClose.style.opacity = 1;
        break;
      default:
        break;
      }
    };

    btnClose.style.opacity = 1;

    const removeContent = function() {
      root.parentNode.removeChild(root);
      wrapperVideo.innerHTML = '';
    };

    bg.addEventListener('click', onClose);
    btnClose.addEventListener('click', onClose);
    btnClose.addEventListener('mouseover', onClose);
    btnClose.addEventListener('mouseout', onClose);


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
        style="z-index: 1010; position: absolute; left: 0px; top: 0px;"
        width="100%"
        height="100%"
        src="//www.youtube.com/embed/${id}?autoplay=1&showinfo=1&rel=0&wmode=transparent&iv_load_policy=3${loopParams}&${params}"
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

  setParams(targetObj, initObj, execution) {
    const target = targetObj;
    if (target instanceof Array) {
      // eslint-disable-next-line
      for (const i in target) this.setParams(target[i], initObj);
      return;
    }

    if (target && initObj) {
      // eslint-disable-next-line
      for (const paramStr in initObj) {
        if (execution || target[paramStr] !== undefined) {
          if (initObj[paramStr] instanceof Function) {
            target[paramStr] = initObj[paramStr];
          } else if (initObj[paramStr] instanceof Object) {
            this.setParams(target[paramStr], initObj[paramStr]);
          } else {
            target[paramStr] = initObj[paramStr];
          }
        }
      }
    }
  }
}

export default YoutubeModal;
