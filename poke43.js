/*
  Poke43 - Touch based browser writing system experiments

  Copyright (c) 2018 Radoslav Peev <rpeev@ymail.com> (MIT License)
*/

class Poke {
  constructor(el) {
    this._el = el;
    this._el.classList.add('poke');
    this._content = this._el.textContent;
    this._pos = this._content.length;
    this._part1 = document.createElement('span');
    this._caret = document.createElement('span');
    this._part2 = document.createElement('span');

    this._part1.classList.add('poke-line-part1');
    this._caret.classList.add('poke-line-caret');
    this._caret.classList.add('blink-smooth');
    this._part2.classList.add('poke-line-part2');

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
    this._el = el;
    this._el.classList.add('keyboard');
  }
}

class Key {
  constructor(el, opts = {}) {
    let classes = el.classList,
      ds = el.dataset;

    this._el = el;
    this[`_text${0}`] = ds.text;
    this[`_command${0}`] = ds.command;
    for (let i = 1; i < 9; i++) {
      this[`_text${i}`] = ds[`text${i}`];
      this[`_command${i}`] = ds[`command${i}`];
    }
    this._hammer = new Hammer(this._el);
    this._dispatch = this._dispatch4cross;
    this._flashDuration = 100;

    classes.add('key');

    this._hammer.
      get('swipe').
      set({direction: Hammer.DIRECTION_ALL});

    this._hammer.
      on('tap', ev => {
        ev.preventDefault(); // Prevent zoom on double-tap

        this.onCommand(ev);
      }).
      on('swipe', ev => this._dispatch(ev.angle).call(this, ev));

    for (let k in opts) {
      if (k.match(/^on[A-Z]/)) {
        this[k] = opts[k];
      }
    }
  }

  _dispatch4cross(angle) {
    if (angle > -135 && angle <= -45) {
      return this.onCommand1;
    } else if (angle > -45 && angle <= 45) {
      return this.onCommand2;
    } else if (angle > 45 && angle <= 135) {
      return this.onCommand3;
    }

    return this.onCommand4;
  }

  _dispatch4diag(angle) {
    if (angle > -90 && angle <= 0) {
      return this.onCommand1;
    } else if (angle > 0 && angle <= 90) {
      return this.onCommand2;
    } else if (angle > 90 && angle <= 180) {
      return this.onCommand3;
    }

    return this.onCommand4;
  }

  _dispatch8(angle) {
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

  _flash(ev, index, text, command) {
    let classes = this._el.classList;

    classes.add('key-flash');
    classes.add(`key-flash${index}`);
    setTimeout(() => {
      classes.remove('key-flash');
      classes.remove(`key-flash${index}`);
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

class PokeKey extends Key {
  constructor(el, poke) {
    super(el);

    this._poke = poke;
  }

  _execute(ev, index, text, command) {
    //super._execute(...arguments);

    text && this._poke.insert(text);
    command && this._poke[command]();
  }
}

class PokeCharacterKey extends PokeKey {
  constructor(el, poke) {
    let classes = el.classList;

    super(el, poke);

    this._text1 = this._text1 || this._text0.toUpperCase();
    this._command2 = this._command2 || 'moveForward';
    this._text3 = this._text3 || ' ';
    this._command4 = this._command4 || 'moveBackward';

    classes.add('key-character');
  }
}

class PokeCharacterKey1 extends PokeKey {
  constructor(el, poke) {
    let classes = el.classList;

    super(el, poke);

    this._text1 = this._text1 || this._text0.toUpperCase();
    this._command2 = this._command2 || 'deleteForward';
    this._text3 = this._text3 || '\n';
    this._command4 = this._command4 || 'deleteBackward';

    classes.add('key-character');
    classes.add('key-danger');
  }
}

class PokeSymbolKey extends PokeKey {
  constructor(el, poke) {
    let classes = el.classList;

    super(el, poke);

    this._dispatch = this._dispatch4diag;

    classes.add('key-symbol');
  }
}
