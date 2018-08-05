import Hammer from 'hammerjs';

class Key {
  constructor(el, props = el.dataset) {
    this._el = el;
    this[`_text${0}`] = props.text;
    this[`_command${0}`] = props.command;
    this[`_hint${0}`] = props.hint;
    for (let i = 1; i < 9; i++) {
      this[`_text${i}`] = props[`text${i}`];
      this[`_command${i}`] = props[`command${i}`];
      this[`_hint${i}`] = props[`hint${i}`];
    }
    this._dispatchSwipe = this[props.dispatchSwipe || '_dispatchSwipe4cross'];
    this._renderHints = this[props.renderHints || '_renderHints4cross'];
    this._flashDuration = Number(props.flashDuration || 100);
    this._hammer = new Hammer.Manager(this._el);

    this._el.classList.add('poke43-key');

    this._hammer.add(new Hammer.Tap());
    this._hammer.add(new Hammer.Swipe({
      direction: Hammer.DIRECTION_ALL,
      treshold: 2,
      velocity: 0.05
    }));

    this._hammer.on('tap', ev => {
      ev.preventDefault(); // Prevent zoom on double-tap

      this.onCommand(ev);
    });
    this._hammer.on('swipe', ev => {
      let handler = this._dispatchSwipe(ev.angle);

      handler.call(this, ev);
    });
  }

  _dispatchSwipe4cross(angle) {
    if (angle > -135 && angle <= -45) {
      return this.onCommand1;
    } else if (angle > -45 && angle <= 45) {
      return this.onCommand3;
    } else if (angle > 45 && angle <= 135) {
      return this.onCommand5;
    }

    return this.onCommand7;
  }

  _dispatchSwipe4diag(angle) {
    if (angle > -90 && angle <= 0) {
      return this.onCommand2;
    } else if (angle > 0 && angle <= 90) {
      return this.onCommand4;
    } else if (angle > 90 && angle <= 180) {
      return this.onCommand6;
    }

    return this.onCommand8;
  }

  _dispatchSwipe8(angle) {
    if (angle > -158 && angle <= -113) {
      return this.onCommand8;
    } else if (angle > -113 && angle <= -68) {
      return this.onCommand1;
    } else if (angle > -68 && angle <= -23) {
      return this.onCommand2;
    } else if (angle > -23 && angle <= 23) {
      return this.onCommand3;
    } else if (angle > 23 && angle <= 68) {
      return this.onCommand4;
    } else if (angle > 68 && angle <= 113) {
      return this.onCommand5;
    } else if (angle > 113 && angle <= 158) {
      return this.onCommand6;
    }

    return this.onCommand7;
  }

  _hint(i) {
    return this[`_hint${i}`] || this[`_text${i}`] || '&nbsp;';
  }

  _renderHints4cross() {
    this._el.innerHTML = `<table>
<tr>
  <td class="poke43-key-hint1">${this._hint(1)}</td>
  <td rowspan="3" class="poke43-key-hint0">${this._hint(0)}</td>
  <td class="poke43-key-hint3">${this._hint(3)}</td>
</tr>
<tr>
  <td></td>
  <td></td>
</tr>
<tr>
  <td class="poke43-key-hint7">${this._hint(7)}</td>
  <td class="poke43-key-hint5">${this._hint(5)}</td>
</tr>
    </table>`;
  }

  _renderHints4diag() {
    this._el.innerHTML = `<table>
<tr>
  <td class="poke43-key-hint8">${this._hint(8)}</td>
  <td rowspan="3" class="poke43-key-hint0">${this._hint(0)}</td>
  <td class="poke43-key-hint2">${this._hint(2)}</td>
</tr>
<tr>
  <td></td>
  <td></td>
</tr>
<tr>
  <td class="poke43-key-hint6">${this._hint(6)}</td>
  <td class="poke43-key-hint4">${this._hint(4)}</td>
</tr>
    </table>`;
  }

  _renderHints8() {
    this._el.innerHTML = `<table>
<tr>
  <td class="poke43-key-hint8">${this._hint(8)}</td>
  <td class="poke43-key-hint1">${this._hint(1)}</td>
  <td class="poke43-key-hint2">${this._hint(2)}</td>
</tr>
<tr>
  <td class="poke43-key-hint7">${this._hint(7)}</td>
  <td class="poke43-key-hint0">${this._hint(0)}</td>
  <td class="poke43-key-hint3">${this._hint(3)}</td>
</tr>
<tr>
  <td class="poke43-key-hint6">${this._hint(6)}</td>
  <td class="poke43-key-hint5">${this._hint(5)}</td>
  <td class="poke43-key-hint4">${this._hint(4)}</td>
</tr>
    </table>`;
  }

  _flash(ev, index, text, command) {
    let classes = this._el.classList;

    !text && !command && classes.add('poke43-key-flash-no-action');
    classes.add('poke43-key-flash');
    classes.add(`poke43-key-flash${index}`);
    setTimeout(() => {
      classes.remove('poke43-key-flash-no-action');
      classes.remove('poke43-key-flash');
      classes.remove(`poke43-key-flash${index}`);
    }, this._flashDuration);
  }

  _execute(ev, index, text, command) {
    console.log(JSON.stringify({
      hammer: `${ev.type} (angle: ${ev.angle.toFixed(2)})`,
      index: index,
      text: text,
      command: command
    }, null, 2));
  }

  onCommand(ev) {
    this._flash(ev, 0, this._text0, this._command0);
    this._execute(ev, 0, this._text0, this._command0);
  }
}

[1, 2, 3, 4, 5, 6, 7, 8].forEach(i => {
  Key.prototype[`onCommand${i}`] = function (ev) {
    this._flash(ev, i, this[`_text${i}`], this[`_command${i}`]);
    this._execute(ev, i, this[`_text${i}`], this[`_command${i}`]);
  };
});

export default Key;
