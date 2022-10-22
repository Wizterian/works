export default class ScrollEnterEvent {
  add(target, obj) {
    if (target && target.length) {
      for (let i = 0; i < target.length; i += 1) {
        const cloneObj = {};
        // eslint-disable-next-line
        for (const temp in obj) {
          cloneObj[temp] = obj[temp];
        }
        this.add(target[i], cloneObj);
      }
      return;
    }

    const o = {};

    o.func = obj.func || null;
    o.marginScale = obj.marginScale || 0;
    o.autoRemove = obj.autoRemove === undefined ? true : obj.autoRemove;
    o.enabled = obj.enabled || true;
    o.autoFirstCheck = obj.autoFirstCheck || true;
    o.timeout = obj.timeout || 0;
    o.data = obj.data === undefined ? null : obj.data;
    o.target = target;
    o.timeoutID = null;

    o.onEnter = obj.onEnter || o.func || null;
    o.onExit = obj.onExit || null;
    o.onInside = obj.onInside || null;
    o.onOutside = obj.onOutside || null;

    o.isInside = false;

    const onScroll = () => {
      if (!o.enabled) {
        return;
      }

      if (o.timeout) {
        clearTimeout(o.timeoutID);
        o.timeoutID = setTimeout(this.check, o.timeout * 1000, o);
      } else {
        this.check(o);
      }
    };

    o.onScroll = onScroll;

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onScroll);

    if (o.autoFirstCheck) {
      window.requestAnimationFrame(() => {
        if (o) {
          onScroll();
        }
      });
    }
    // eslint-disable-next-line
    return o;
  }

  check(obj) {
    let o = obj;

    if (!o.enabled) {
      return;
    }
    let target = o.target;
    const margin = window.innerHeight * o.marginScale;
    const scrollY = window.pageYOffset;
    const targetH = target.offsetHeight;

    let targetY = target.offsetTop;
    let parent = target.offsetParent;
    while (parent && parent !== document.body) {
      targetY += parent.offsetTop;
      parent = parent.offsetParent;
    }

    const enterAreaTop = targetY + margin;
    const enterAreaBottom = targetY + targetH - margin;

    const position1 = scrollY - enterAreaTop + window.innerHeight;
    const position2 = enterAreaBottom - enterAreaTop + window.innerHeight;
    const position = position1 / position2;

    if (scrollY + window.innerHeight > enterAreaTop && scrollY < enterAreaBottom) {
      if (!o.isInside && o.onEnter) {
        o.onEnter({
          type: 'enter',
          target,
          data: o.data,
          position
        });
        if (o.autoRemove) {
          window.removeEventListener('scroll', o.onScroll);
          o.enabled = false;
        }
      }
      if (o.onInside) {
        o.onInside({
          type: 'inside',
          target,
          data: o.data,
          position
        });
      }
      o.isInside = true;
    } else {
      if (o.isInside && o.onExit) {
        o.onExit({
          type: 'exit',
          target,
          data: o.data,
          position
        });
      }
      if (o.onOutside) {
        o.onOutside({
          type: 'outside',
          target,
          data: o.data,
          position
        });
      }
      o.isInside = false;
    }
    target = null;
    o = null;
  }
}
