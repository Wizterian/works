class ShareBtn {
  constructor() {
    this.init();
    this.bindUIElements();
    this.setSNS();
  }

  init() {
    if (
      window.app
      && window.app.commonData
      && window.app.commonData.share
    ) {
      this.data = window.app.commonData.share;
    } else {
      this.data = [
        {
          text: '',
          url: '',
          hash: ''
        }
      ];
    }

    if (/iphone|ipad|ipod|android/gi.test(navigator.userAgent)) {
      this.isPC = false;
    } else {
      this.isPC = true;
    }
  }

  bindUIElements() {
    this.line = document.getElementsByClassName('js-share-line');
    this.twitter = document.getElementsByClassName('js-share-twitter');
    this.facebook = document.getElementsByClassName('js-share-facebook');
  }

  setSNS() {
    const index = Math.floor(Math.random() * this.data.length);
    const data = this.data[index];
    this.setLine(data);
    this.setTwitter(data);
    this.setFB(data);
  }

  setLine(data) {
    for (let i = 0; i < this.line.length; i += 1) {
      const text = this.line[i].getAttribute('data-text') || data.text;
      const url = this.line[i].getAttribute('data-url') || data.url;
      const encodeText = encodeURIComponent(`${text} ${url}`);
      this.line[i].href = `http://line.me/R/msg/text/?${encodeText}`;
      this.line[i].target = '_blank';
      if (this.isPC) {
        this.line[i].addEventListener('click', (evt) => {
          this.onClick(evt, 'line');
        });
      }
    }
  }

  setTwitter(data) {
    for (let i = 0; i < this.twitter.length; i += 1) {
      const text = this.twitter[i].getAttribute('data-text') || data.text;
      const url = this.twitter[i].getAttribute('data-url') || data.url;
      this.twitter[i].href = `http://twitter.com/share?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      this.twitter[i].target = '_blank';
      if (this.isPC) {
        this.twitter[i].addEventListener('click', (evt) => {
          this.onClick(evt, 'twitter');
        });
      }
    }
  }

  setFB(data) {
    for (let i = 0; i < this.facebook.length; i += 1) {
      const url = this.facebook[i].getAttribute('data-url') || data.url;
      this.facebook[i].href = `https://www.facebook.com/share.php?u=${encodeURIComponent(url)}`;
      this.facebook[i].target = '_blank';
      if (this.isPC) {
        this.facebook[i].addEventListener('click', (evt) => {
          this.onClick(evt, 'facebook');
        });
      }
    }
  }

  onClick(evt, sns) {
    if (evt.type === 'click') {
      let wSize;
      let hSize;
      let lPosition;
      let tPosition;

      switch (sns) {
      case 'twitter':
        evt.preventDefault();
        wSize = 680;
        hSize = 477;
        lPosition = Number((window.screen.width - wSize) / 2);
        tPosition = Number((window.screen.height - hSize) / 2);
        window.open(evt.currentTarget.getAttribute('href'), 'share_twitter', `width=${wSize}, height=${hSize}, left=${lPosition}, top=${tPosition}, menubar=no, toolbar=no, resizable=yes, scrollbars=yes`);
        break;

      case 'facebook':
        evt.preventDefault();
        wSize = 600;
        hSize = 630;
        lPosition = Number((window.screen.width - wSize) / 2);
        tPosition = Number((window.screen.height - hSize) / 2);
        window.open(evt.currentTarget.getAttribute('href'), 'share_facebook', `width=${wSize}, height=${hSize}, left=${lPosition}, top=${tPosition}, menubar=no, toolbar=no, resizable=yes, scrollbars=yes`);
        break;

      default:
        break;
      }
    }
  }
}

export default ShareBtn;
