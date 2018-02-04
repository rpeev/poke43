/*
  Poke43 - Touch based browser writing system experiments

  Copyright (c) 2018 Radoslav Peev <rpeev@ymail.com> (MIT License)
*/

(function () {

class Poke {
  constructor(el) {
    let classes = el.classList;

    this._el = el;
    this._elEditor = document.createElement('div');
    this._elKeyboard = document.createElement('div');

    classes.add('poke43-poke');

    this._el.textContent = '';
    this._el.appendChild(this._elEditor);
    this._el.appendChild(this._elKeyboard);

    this._editor = new poke43.Editor(this._elEditor);
    this._keyboard = new poke43.EditorKeyboard(this._editor, this._elKeyboard);

    this._editor._hammer.on('tap', ev => {
      this._keyboard.show();
    });
  }
}

class Editor {
  constructor(el) {
    let classes = el.classList;

    this._el = el;
    this._hammer = new Hammer(this._el);
    this._content = this._el.textContent;
    this._pos = this._content.length;
    this._part1 = document.createElement('span');
    this._caret = document.createElement('span');
    this._part2 = document.createElement('span');

    classes.add('poke43-editor');

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

  showCaret() {
    this._caret.style.visibility = 'visible';
  }

  hideCaret() {
    this._caret.style.visibility = 'hidden';
  }

  noop() {}

  moveBackward() {
    if (this._pos === 0) {
      //throw new RangeError('Cannot move before start');
      return;
    }

    this._pos -= 1;
    this._update();
  }

  moveForward() {
    if (this._pos === this._content.length) {
      //throw new RangeError('Cannot move past end');
      return;
    }

    this._pos += 1;
    this._update();
  }

  moveForward2() {
    this.moveForward();
    this.moveForward();
  }

  moveBackwardLeap() {
    if (this._pos === 0) {
      //throw new RangeError('Cannot move before start');
      return;
    }

    let [part1, part2] = this._parts,
      match = part1.match(/(\w+)$/);

    if (match) {
      this._pos -= match[1].length;
      this._update();
    } else {
      let match = part1.match(/(\W+)$/);

      if (match) {
        this._pos -= match[1].length;
        this._update();
      }
    }
  }

  moveForwardLeap() {
    if (this._pos === this._content.length) {
      //throw new RangeError('Cannot move past end');
      return;
    }

    let [part1, part2] = this._parts,
      match = part2.match(/^(\w+)/);

    if (match) {
      this._pos += match[1].length;
      this._update();
    } else {
      let match = part2.match(/^(\W+)/);

      if (match) {
        this._pos += match[1].length;
        this._update();
      }
    }
  }

  moveStart() {
    this._pos = 0;
    this._update();
  }

  moveEnd() {
    this._pos = this._content.length;
    this._update();
  }

  deleteBackward() {
    if (this._pos === 0) {
      //throw new RangeError('Cannot delete before start');
      return;
    }

    this._content = `${this._content.slice(0, this._pos - 1)}${this._content.slice(this._pos)}`;
    this._pos -= 1;
    this._update();
  }

  deleteForward() {
    if (this._pos === this._content.length) {
      //throw new RangeError('Cannot delete past end');
      return;
    }

    this._content = `${this._content.slice(0, this._pos)}${this._content.slice(this._pos + 1)}`;
    this._update();
  }

  deleteBackwardLeap() {
    if (this._pos === 0) {
      //throw new RangeError('Cannot delete before start');
      return;
    }

    let [part1, part2] = this._parts,
      match = part1.match(/(\w+)$/);

    if (match) {
      this._content = `${part1.slice(0, match.index)}${part2}`;
      this._pos -= match[1].length;
      this._update();
    } else {
      let match = part1.match(/(\W+)$/);

      if (match) {
        this._content = `${part1.slice(0, match.index)}${part2}`;
        this._pos -= match[1].length;
        this._update();
      }
    }
  }

  deleteForwardLeap() {
    if (this._pos === this._content.length) {
      //throw new RangeError('Cannot delete past end');
      return;
    }

    let [part1, part2] = this._parts,
      match = part2.match(/^(\w+)/);

    if (match) {
      this._content = `${part1}${part2.slice(match[1].length)}`;
      this._update();
    } else {
      let match = part2.match(/(^\W+)/);

      if (match) {
        this._content = `${part1}${part2.slice(match[1].length)}`;
        this._update();
      }
    }
  }

  insert(str) {
    this._content = `${this._content.slice(0, this._pos)}${str}${this._content.slice(this._pos)}`;
    this._pos += str.length;
    this._update();
  }

  expandAbbreviation() {
    let abbr = emmetExtractAbbreviation.extractAbbreviation(this._content, this._pos, true);

    if (abbr) {
      let part1 = this._content.slice(0, abbr.location),
        part2 = this._content.slice(abbr.location + abbr.abbreviation.length),
        expanded = emmet.expand(abbr.abbreviation, {
          field: emmetFieldParser.createToken,
          profile: {
            indent: '  '
          }
        }),
        {string, fields} = emmetFieldParser.parse(expanded);

      this._content = `${part1}${string}${part2}`;
      this._pos = part1.length + ((fields.length > 0) ?
        fields[0].location :
        string.length);
      this._update();
    }
  }

  evalJS() {
    eval(this._content);
  }
}

class EditorKeyboard {
  constructor(editor, el) {
    let classes = el.classList;

    this._editor = editor;
    this._el = el;
    this._hammer = new Hammer(this._el);
    this._rowEls = this._getRowEls();
    this._keys = this._getKeys();
    this._symRowActive = true;
    this._currSymLayout = 'Poke43';
    this._custRowActive = false;
    this._currLangLayout = 'enUSQwerty';

    classes.add('poke43-keyboard');

    this._hammer.
      get('swipe').
      set({direction: Hammer.DIRECTION_ALL});

    this._hammer.
      on('tap', ev => {
        ev.preventDefault(); // Prevent zoom on double-tap
      }).
      on('swipe', ev => {});

    if (this._rowEls.length === 0) {
      this._renderDefaultLayout();

      this._rowEls = this._getRowEls();
      this._keys = this._getKeys();
    }
  }

  expandAbbreviation() {
    this._editor.expandAbbreviation();
  }

  evalJS() {
    this._editor.evalJS();
  }

  show() {
    if (this._el.style.display === 'none') {
      this._el.style.display = 'flex';
      this._editor.showCaret();
    }
  }

  hide() {
    this._el.style.display = 'none';
    this._editor.hideCaret();
  }

  toggleSymRow() {
    if (this._symRowActive) {
      this._rowEls[0].style.display = 'none';
      this._rowEls[1].style.display = 'none';
      this._symRowActive = false;
    } else {
      switch (this._currSymLayout) {
      case 'Poke43':
        this._rowEls[0].style.display = 'block';
        this._rowEls[1].style.display = 'none';
        break;
      case 'Textastic':
        this._rowEls[0].style.display = 'none';
        this._rowEls[1].style.display = 'block';
        break;
      }
      this._symRowActive = true;
    }
  }

  cycleSymLayouts() {
    if (!this._symRowActive) {
      return;
    }

    switch (this._currSymLayout) {
    case 'Poke43':
      this._rowEls[0].style.display = 'none';
      this._rowEls[1].style.display = 'block';
      this._currSymLayout = 'Textastic';
      break;
    case 'Textastic':
      this._rowEls[0].style.display = 'block';
      this._rowEls[1].style.display = 'none';
      this._currSymLayout = 'Poke43';
      break;
    }
  }

  toggleCustRow() {
    /*if (this._custRowActive) {
      this._rowEls[2].style.display = 'none';
      this._custRowActive = false;
    } else {
      this._rowEls[2].style.display = 'block';
      this._custRowActive = true;
    }*/
  }

  cycleLangLayouts() {
    switch (this._currLangLayout) {
    case 'enUSQwerty':
      this._enUSQwertyIndices.forEach(i => this._rowEls[i].style.display = 'none');
      this._bgBGPhoneticIndices.forEach(i => this._rowEls[i].style.display = 'block');
      this._currLangLayout = 'bgBGPhonetic';
      break;
    case 'bgBGPhonetic':
      this._enUSQwertyIndices.forEach(i => this._rowEls[i].style.display = 'block');
      this._bgBGPhoneticIndices.forEach(i => this._rowEls[i].style.display = 'none');
      this._currLangLayout = 'enUSQwerty';
      break;
    }
  }

  _getRowEls() {
    return [].slice.call(
      this._el.querySelectorAll('.poke43-keyboard-row')
    );
  }

  _getKeys() {
    return [].map.call(
      this._el.querySelectorAll('.poke43-keyboard-row > span'),
      elKey => new poke43[elKey.dataset.type](
        (elKey.dataset.type === 'KeyboardKey') ? this : this._editor, elKey
      )
    );
  }

  get _symRowLayout() {
    return `<div class="poke43-keyboard-row">
<span data-type="EditorSymKey"
  data-text="0"
  data-text2="2"
  data-text4="4"
  data-text6="3"
  data-text8="1"></span>
<span data-type="EditorSymKey"
  data-text="5"
  data-text2="7"
  data-text4="9"
  data-text6="8"
  data-text8="6"></span>
<span data-type="EditorSymKey"
  data-text="+"
  data-text2="*"
  data-text4="%"
  data-text6="_"
  data-text8="-"></span>
<span data-type="EditorSymKey"
  data-text="="
  data-text2="/"
  data-text4=">"
  data-text6="<"
  data-text8="\\"></span>
<span data-type="EditorSymKey"
  data-text="&"
  data-text2="^"
  data-text4="$"
  data-text6="~"
  data-text8="|"></span>
<span data-type="EditorSymKey"
  data-text="()" data-command="moveBackward"
  data-text2="@"
  data-text4="{}" data-command4="moveBackward"
  data-text6="[]" data-command6="moveBackward"
  data-text8="#"></span>
<span data-type="EditorSymKey"
  data-text='""' data-command="moveBackward" data-hint='"'
  data-text2="?"
  data-text4="\`\`" data-command4="moveBackward" data-hint4="\`"
  data-text6="''" data-command6="moveBackward" data-hint6="'"
  data-text8="!"></span>
<span class="poke43-key-important" data-type="EditorSymKey1"
  data-text=";"
  data-text2=":"
  data-command3="moveEnd"
  data-text4="."
  data-text6=","
  data-command7="moveStart"></span>
    </div>`;
  }

  get _symRowTextasticLayout() {
    return `<div class="poke43-keyboard-row" style="display: none;">
<span data-type="EditorSymKey"
  data-text='"'
  data-text2=")"
  data-text4="]"
  data-text6="["
  data-text8="("></span>
<span data-type="EditorSymKey"
  data-text="'"
  data-text2="}"
  data-text4=">"
  data-text6="<"
  data-text8="{"></span>
<span data-type="EditorSymKey"
  data-text="$"
  data-text2="/"
  data-text4="\`"
  data-text6="´"
  data-text8="\\"></span>
<span data-type="EditorSymKey"
  data-text="|"
  data-text2="^"
  data-text4="£"
  data-text6="€"
  data-text8="~"></span>
<span data-type="EditorSymKey"
  data-text="="
  data-text2="+"
  data-text4="*"
  data-text6="%"
  data-text8="-"></span>
<span data-type="EditorSymKey"
  data-text="#"
  data-text2="?"
  data-text4="&"
  data-text6="@"
  data-text8="!"></span>
<span class="poke43-key-important" data-type="EditorSymKey1"
  data-text=";"
  data-text2=":"
  data-command3="moveEnd"
  data-text4="."
  data-text6=","
  data-command7="moveStart"
  data-text8="_"></span>
<span data-type="EditorSymKey"
  data-text="0"
  data-text2="2"
  data-text4="4"
  data-text6="3"
  data-text8="1"></span>
<span data-type="EditorSymKey"
  data-text="5"
  data-text2="7"
  data-text4="9"
  data-text6="8"
  data-text8="6"></span>
    </div>`;
  }

  get _custRowLayout() {
    return `<div class="poke43-keyboard-row" style="display: none;">
<span data-type="EditorCustKey"></span>
<span data-type="EditorCustKey"></span>
<span data-type="EditorCustKey"></span>
<span data-type="EditorCustKey"></span>
<span data-type="EditorCustKey"></span>
<span data-type="EditorCustKey"></span>
    </div>`;
  }

  get _enUSQwertyIndices() {
    return [3, 4, 5];
  }

  get _enUSQwertyLayout() {
    return `<div class="poke43-keyboard-row">
<span data-type="EditorCharKey" data-text="q"></span>
<span data-type="EditorCharKey" data-text="w"></span>
<span data-type="EditorCharKey" data-text="e"></span>
<span data-type="EditorCharKey" data-text="r"></span>
<span data-type="EditorCharKey" data-text="t"></span>
<span data-type="EditorCharKey" data-text="y"></span>
<span data-type="EditorCharKey" data-text="u"></span>
<span data-type="EditorCharKey" data-text="i"></span>
<span data-type="EditorCharKey" data-text="o"></span>
<span class="poke43-key-important" data-type="EditorCharKey"
  data-text="p"
  data-command3="moveForwardLeap"
  data-command7="moveBackwardLeap"></span>
    </div>
    <div class="poke43-keyboard-row">
<span data-type="EditorCharKey" data-text="a"></span>
<span data-type="EditorCharKey" data-text="s"></span>
<span data-type="EditorCharKey" data-text="d"></span>
<span data-type="EditorCharKey" data-text="f"></span>
<span data-type="EditorCharKey" data-text="g"></span>
<span data-type="EditorCharKey" data-text="h"></span>
<span data-type="EditorCharKey" data-text="j"></span>
<span data-type="EditorCharKey" data-text="k"></span>
<span class="poke43-key-important" data-type="EditorCharKey"
  data-text="l"
  data-command3="moveForwardLeap"
  data-command7="moveBackwardLeap"></span>
    </div>
    <div class="poke43-keyboard-row">
<span data-type="KeyboardKey"
  data-command="cycleLangLayouts" data-hint="\u{1f310}"
  data-command1="toggleSymRow"
  data-command3="cycleSymLayouts"
  data-command5="toggleCustRow"></span>
<span data-type="EditorCharKey1" data-text="z"></span>
<span data-type="EditorCharKey1" data-text="x"></span>
<span data-type="EditorCharKey1" data-text="c"></span>
<span data-type="EditorCharKey1" data-text="v"></span>
<span data-type="EditorCharKey1" data-text="b"></span>
<span data-type="EditorCharKey1" data-text="n"></span>
<span class="poke43-key-important" data-type="EditorCharKey1"
  data-text="m"
  data-command3="deleteForwardLeap"
  data-command7="deleteBackwardLeap"></span>
<span data-type="KeyboardKey"
  data-hint="\u2728"
  data-command1="hide"
  data-command3="expandAbbreviation"
  data-command5="evalJS"></span>
    </div>`;
  }

  get _bgBGPhoneticIndices() {
    return [6, 7, 8];
  }

  get _bgBGPhoneticLayout() {
    return `<div class="poke43-keyboard-row" style="display: none;">
<span data-type="EditorCharKey" data-text="я"></span>
<span data-type="EditorCharKey" data-text="в"></span>
<span data-type="EditorCharKey" data-text="е"></span>
<span data-type="EditorCharKey" data-text="р"></span>
<span data-type="EditorCharKey" data-text="т"></span>
<span data-type="EditorCharKey" data-text="ъ"></span>
<span data-type="EditorCharKey" data-text="у"></span>
<span data-type="EditorCharKey" data-text="и"></span>
<span data-type="EditorCharKey" data-text="о"></span>
<span data-type="EditorCharKey" data-text="п"></span>
<span class="poke43-key-important" data-type="EditorCharKey"
  data-text="ю"
  data-command3="moveForwardLeap"
  data-command7="moveBackwardLeap"></span>
    </div>
    <div class="poke43-keyboard-row" style="display: none;">
<span data-type="EditorCharKey" data-text="а"></span>
<span data-type="EditorCharKey" data-text="с"></span>
<span data-type="EditorCharKey" data-text="д"></span>
<span data-type="EditorCharKey" data-text="ф"></span>
<span data-type="EditorCharKey" data-text="г"></span>
<span data-type="EditorCharKey" data-text="х"></span>
<span data-type="EditorCharKey" data-text="й"></span>
<span data-type="EditorCharKey" data-text="к"></span>
<span data-type="EditorCharKey" data-text="л"></span>
<span data-type="EditorCharKey" data-text="ш"></span>
<span class="poke43-key-important" data-type="EditorCharKey"
  data-text="щ"
  data-command3="moveForwardLeap"
  data-command7="moveBackwardLeap"></span>
    </div>
    <div class="poke43-keyboard-row" style="display: none;">
<span data-type="KeyboardKey"
  data-command="cycleLangLayouts" data-hint="\u{1f310}"
  data-command1="toggleSymRow"
  data-command3="cycleSymLayouts"
  data-command5="toggleCustRow"></span>
<span data-type="EditorCharKey1" data-text="з"></span>
<span data-type="EditorCharKey1" data-text="ь"></span>
<span data-type="EditorCharKey1" data-text="ц"></span>
<span data-type="EditorCharKey1" data-text="ж"></span>
<span data-type="EditorCharKey1" data-text="б"></span>
<span data-type="EditorCharKey1" data-text="н"></span>
<span data-type="EditorCharKey1" data-text="м"></span>
<span class="poke43-key-important" data-type="EditorCharKey1"
  data-text="ч"
  data-command3="deleteForwardLeap"
  data-command7="deleteBackwardLeap"></span>
<span data-type="KeyboardKey"
  data-hint="\u2728"
  data-command3="expandAbbreviation"
  data-command5="evalJS"></span>
    </div>`;
  }

  _renderDefaultLayout() {
    this._el.innerHTML = `${this._symRowLayout}${this._symRowTextasticLayout}${this._custRowLayout}${this._enUSQwertyLayout}${this._bgBGPhoneticLayout}`;
  }
}

class Key {
  constructor(el, props = el.dataset) {
    let classes = el.classList;

    this._el = el;
    this[`_text${0}`] = props.text;
    this[`_command${0}`] = props.command;
    this[`_hint${0}`] = props.hint;
    for (let i = 1; i < 9; i++) {
      this[`_text${i}`] = props[`text${i}`];
      this[`_command${i}`] = props[`command${i}`];
      this[`_hint${i}`] = props[`hint${i}`];
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

class KeyboardKey extends Key {
  constructor(keyboard, el, props = el.dataset) {
    let classes = el.classList;

    super(el, props);

    this._keyboard = keyboard;

    classes.add('poke43-key-keyboard');

    this._renderHints();
  }

  _execute(ev, index, text, command) {
    //super._execute(...arguments);

    command && this._keyboard[command]();
  }
}

class EditorKey extends Key {
  constructor(editor, el, props = el.dataset) {
    super(el, props);

    this._editor = editor;

    // TODO: Avoid double render in subclasses?
    this._renderHints();
  }

  _execute(ev, index, text, command) {
    //super._execute(...arguments);

    text && this._editor.insert(text);
    command && this._editor[command]();
  }
}

class EditorCharKey extends EditorKey {
  constructor(editor, el, props = el.dataset) {
    let classes = el.classList;

    super(editor, el, props);

    this._text1 = this._text1 || this._text0.toUpperCase();
    this._command3 = this._command3 || 'moveForward';
    this._text5 = this._text5 || ' ';
    this._hint5 = this._hint5 || '\u2423';
    this._command7 = this._command7 || 'moveBackward';

    classes.add('poke43-key-char');

    this._renderHints();
  }
}

class EditorCharKey1 extends EditorKey {
  constructor(editor, el, props = el.dataset) {
    let classes = el.classList;

    super(editor, el, props);

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

class EditorSymKey extends EditorKey {
  constructor(editor, el, props = el.dataset) {
    let classes = el.classList;

    super(editor, el, props);

    this._dispatchSwipe = this._dispatchSwipe4diag;
    this._renderHints = this._renderHints4diag;

    classes.add('poke43-key-sym');

    this._renderHints();
  }
}

class EditorSymKey1 extends EditorKey {
  constructor(editor, el, props = el.dataset) {
    let classes = el.classList;

    super(editor, el, props);

    this._dispatchSwipe = this._dispatchSwipe8;
    this._renderHints = this._renderHints4diag;

    classes.add('poke43-key-sym');

    this._renderHints();
  }
}

class EditorCustKey extends EditorKey {
  constructor(editor, el, props = el.dataset) {
    let classes = el.classList;

    super(editor, el, props);

    this._dispatchSwipe = this._dispatchSwipe8;
    this._renderHints = this._renderHints8;

    classes.add('poke43-key-cust');

    this._renderHints();
  }
}

// exports
window.poke43 = {
  Poke: Poke,
  Editor: Editor,
  EditorKeyboard: EditorKeyboard,
  Key: Key,
  KeyboardKey: KeyboardKey,
  EditorKey: EditorKey,
  EditorCharKey: EditorCharKey,
  EditorCharKey1: EditorCharKey1,
  EditorSymKey: EditorSymKey,
  EditorSymKey1: EditorSymKey1,
  EditorCustKey: EditorCustKey
};

})();
