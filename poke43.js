/*
  Poke43 - Touch based browser writing system experiments

  Copyright (c) 2018 Radoslav Peev <rpeev@ymail.com> (MIT License)
*/

(function () {

class Editor {
  constructor(el) {
    this._el = el;
    this._el.classList.add('poke43-editor');
    this._content = this._el.textContent;
    this._pos = this._content.length;
    this._part1 = document.createElement('span');
    this._caret = document.createElement('span');
    this._part2 = document.createElement('span');

    this._part1.classList.add('poke43-line-part1');
    this._caret.classList.add('poke43-line-caret');
    this._caret.classList.add('poke43-blink-smooth');
    this._part2.classList.add('poke43-line-part2');

    this._el.textContent = '';
    this._el.appendChild(this._part1);
    this._el.appendChild(this._caret);
    this._el.appendChild(this._part2);

    this._update();
  }

  get _parts() {
    return [
      this._content.slice(0, this._pos),
      this._content.slice(this._pos)
    ];
  }

  _update() {
    let [part1, part2] = this._parts;

    this._part1.textContent = part1;
    this._part2.textContent = part2;
  }

  noop() {}

  moveBackward() {
    if (this._pos === 0) {
      throw new RangeError('Cannot move before start');
    }

    this._pos -= 1;
    this._update();
  }

  moveForward() {
    if (this._pos === this._content.length) {
      throw new RangeError('Cannot move past end');
    }

    this._pos += 1;
    this._update();
  }

  deleteBackward() {
    if (this._pos === 0) {
      throw new RangeError('Cannot delete before start');
    }

    this._content = `${this._content.slice(0, this._pos - 1)}${this._content.slice(this._pos)}`;
    this._pos -= 1;
    this._update();
  }

  deleteForward() {
    if (this._pos === this._content.length) {
      throw new RangeError('Cannot delete past end');
    }

    this._content = `${this._content.slice(0, this._pos)}${this._content.slice(this._pos + 1)}`;
    this._update();
  }

  insert(str) {
    this._content = `${this._content.slice(0, this._pos)}${str}${this._content.slice(this._pos)}`;
    this._pos += 1;
    this._update();
  }
}

class Keyboard {
  constructor(el) {
    let classes = el.classList;

    this._el = el;
    this._hammer = new Hammer(this._el);

    classes.add('poke43-keyboard');

    this._hammer.
      get('swipe').
      set({direction: Hammer.DIRECTION_ALL});

    this._hammer.
      on('tap', ev => {
        ev.preventDefault(); // Prevent zoom on double-tap
      }).
      on('swipe', ev => {});
  }
}

class Key {
  constructor(el, opts = {}) {
    let classes = el.classList,
      ds = el.dataset;

    this._el = el;
    this[`_text${0}`] = ds.text;
    this[`_command${0}`] = ds.command;
    this[`_hint${0}`] = ds.hint;
    for (let i = 1; i < 9; i++) {
      this[`_text${i}`] = ds[`text${i}`];
      this[`_command${i}`] = ds[`command${i}`];
      this[`_hint${i}`] = ds[`hint${i}`];
    }
    this._hammer = new Hammer(this._el);
    this._dispatchSwipe = this._dispatchSwipe4cross;
    this._renderHints = this._renderHints4cross;
    this._flashDuration = 100;

    classes.add('poke43-key');

    this._hammer.
      get('swipe').
      set({direction: Hammer.DIRECTION_ALL});

    this._hammer.
      on('tap', ev => {
        ev.preventDefault(); // Prevent zoom on double-tap

        this.onCommand(ev);
      }).
      on('swipe', ev => this._dispatchSwipe(ev.angle).call(this, ev));

    for (let k in opts) {
      if (k.match(/^on[A-Z]/)) {
        this[k] = opts[k];
      }
    }
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

  _flash(ev, index, text, command) {
    let classes = this._el.classList;

    classes.add('poke43-key-flash');
    classes.add(`poke43-key-flash${index}`);
    setTimeout(() => {
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

class EditorKey extends Key {
  constructor(el, editor) {
    super(el);

    this._editor = editor;
  }

  _execute(ev, index, text, command) {
    //super._execute(...arguments);

    text && this._editor.insert(text);
    command && this._editor[command]();
  }
}

class EditorKeyChar extends EditorKey {
  constructor(el, editor) {
    let classes = el.classList;

    super(el, editor);

    this._text1 = this._text1 || this._text0.toUpperCase();
    this._command3 = this._command3 || 'moveForward';
    this._text5 = this._text5 || ' ';
    this._hint5 = this._hint5 || '\u2423';
    this._command7 = this._command7 || 'moveBackward';

    classes.add('poke43-key-char');

    this._renderHints();
  }
}

class EditorKeyChar1 extends EditorKey {
  constructor(el, editor) {
    let classes = el.classList;

    super(el, editor);

    this._text1 = this._text1 || this._text0.toUpperCase();
    this._command3 = this._command3 || 'deleteForward';
    this._text5 = this._text5 || '\n';
    this._hint5 = this._hint5 || '\u21b2';
    this._command7 = this._command7 || 'deleteBackward';

    classes.add('poke43-key-char');
    classes.add('poke43-key-danger');

    this._renderHints();
  }
}

class EditorKeySym extends EditorKey {
  constructor(el, editor) {
    let classes = el.classList;

    super(el, editor);

    this._dispatchSwipe = this._dispatchSwipe4diag;
    this._renderHints = this._renderHints4diag;

    classes.add('poke43-key-sym');

    this._renderHints();
  }
}

// exports
window.poke43 = {
  Editor: Editor,
  Keyboard: Keyboard,
  Key: Key,
  EditorKey: EditorKey,
  EditorKeyChar: EditorKeyChar,
  EditorKeyChar1: EditorKeyChar1,
  EditorKeySym: EditorKeySym
};

})();
