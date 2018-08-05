import Key from './key';

class KeyboardKey extends Key {
  constructor(keyboard, el, props = el.dataset) {
    super(el, props);

    this._keyboard = keyboard;

    this._el.classList.add('poke43-key-keyboard');

    this._renderHints();
  }

  _execute(ev, index, text, command) {
    command && this._keyboard[command]();
  }
}

export default KeyboardKey;
