import poke43 from './base.js';
import './styles/base.scss';
import Editor, {
  EditorModel,
  EditorView
} from './editor';
import Keyboard, {
  Key,
  EditorKey,
  EditorKeyCharacter,
  EditorKeyCharacterSpaceMove,
  EditorKeyCharacterSpaceMoveWB,
  EditorKeyCharacterEnterDelete,
  EditorKeyCharacterEnterDeleteWB,
  EditorKeyCharSymSpaceMove,
  EditorKeyCharSymSpaceMoveWB,
  EditorKeyCharSymEnterDelete,
  EditorKeyCharSymEnterDeleteWB,
  EditorKeySymbol,
  EditorKeyCustom,
  KeyboardKey
} from './keyboard';

class Poke {
  constructor(el) {
    this._el = el;
    this._elEditor = document.createElement('div');
    this._editor = new Editor(this._elEditor);
    this._elKeyboard = document.createElement('div');
    this._keyboard = new Keyboard(this._editor, this._elKeyboard);

    this._el.classList.add('poke43-poke');
    this._el.textContent = '';
    this._el.appendChild(this._elEditor);
    this._el.appendChild(this._elKeyboard);

    this._editor._hammer.on('tap', ev => this._keyboard.show());
  }
}

function pokeize(CM) {
  const ensure = opts => Object.assign(opts, {
    inputStyle: 'textarea',
    readOnly: 'nocursor'
  });

  const getset = {
    content: {
      get() { return this.getValue(); },
      set(text) { this.setValue(text); }
    }
  };

  return class extends CM {
    static fromTextArea(el, opts) {
      let cm = Object.defineProperties(
        Object.assign(
          super.fromTextArea(el, ensure(opts)),
          _PokeEditorMixin
        ),
        getset
      );

      let elCm = cm.getWrapperElement();
      let elCmParent = elCm.parentElement;
      let elKbd = document.createElement('div');

      elCmParent.insertBefore(elKbd, elCm);
      cm._keyboard = new Keyboard(cm, elKbd);
      cm.on('touchstart', () => cm._keyboard.show());

      return cm;
    }

    constructor(el, opts) {
      super(el, ensure(opts));

      Object.defineProperties(
        Object.assign(
          this,
          _PokeEditorMixin
        ),
        getset
      );

      let elCm = this.getWrapperElement();
      let elCmParent = elCm.parentElement;
      let elKbd = document.createElement('div');

      elCmParent.insertBefore(elKbd, elCm);
      this._keyboard = new Keyboard(this, elKbd);
      this.on('touchstart', () => this._keyboard.show());
    }
  };
}

const _PokeEditorMixin = {
  // Dummy
  _el: {
    classList: {
      add() {},
      remove() {}
    }
  },

  // Dummy
  _view: {
    showCaret() {},
    hideCaret() {}
  },

  moveBackward() {
    if (this.getSelection().length === 0) {
      this.execCommand('goCharLeft');
    }
    return this;
  },

  moveForward() {
    if (this.getSelection().length === 0) {
      this.execCommand('goCharRight');
    }
    return this;
  },

  moveBackwardWB() {
    if (this.getSelection().length === 0) {
      this.execCommand('goWordLeft');
    }
    return this;
  },

  moveForwardWB() {
    if (this.getSelection().length === 0) {
      this.execCommand('goWordRight');
    }
    return this;
  },

  moveToSOL() {
    if (this.getSelection().length === 0) {
      this.execCommand('goLineStart');
    }
    return this;
  },

  moveToEOL() {
    if (this.getSelection().length === 0) {
      this.execCommand('goLineEnd');
    }
    return this;
  },

  deleteBackward() {
    if (this.getSelection().length === 0) {
      this.execCommand('delCharBefore');
    }
    return this;
  },

  deleteForward() {
    if (this.getSelection().length === 0) {
      this.execCommand('delCharAfter');
    }
    return this;
  },

  deleteBackwardWB() {
    if (this.getSelection().length === 0) {
      this.execCommand('delWordBefore');
    }
    return this;
  },

  deleteForwardWB() {
    if (this.getSelection().length === 0) {
      this.execCommand('delWordAfter');
    }
    return this;
  },

  insert(text) {
    if (this.getSelection().length === 0) {
      this.replaceRange(text, this.getCursor());
    } else {
      this.replaceSelection((text.match(/\s/)) ? '' : text);
    }
    return this;
  },

  expandAbbreviation() {
    console.warn('TODO: Implement expandAbbreviation');
  },

  evalJS() {
    console.warn('TODO: Implement evalJS');
  }
};

Object.assign(poke43, {
  Poke,
  pokeize,
  Editor,
  EditorModel,
  EditorView,
  Keyboard,
  Key,
  EditorKey,
  EditorKeyCharacter,
  EditorKeyCharacterSpaceMove,
  EditorKeyCharacterSpaceMoveWB,
  EditorKeyCharacterEnterDelete,
  EditorKeyCharacterEnterDeleteWB,
  EditorKeyCharSymSpaceMove,
  EditorKeyCharSymSpaceMoveWB,
  EditorKeyCharSymEnterDelete,
  EditorKeyCharSymEnterDeleteWB,
  EditorKeySymbol,
  EditorKeyCustom,
  KeyboardKey
});

export {
  Poke,
  pokeize,
  Editor,
  EditorModel,
  EditorView,
  Keyboard,
  Key,
  EditorKey,
  EditorKeyCharacter,
  EditorKeyCharacterSpaceMove,
  EditorKeyCharacterSpaceMoveWB,
  EditorKeyCharacterEnterDelete,
  EditorKeyCharacterEnterDeleteWB,
  EditorKeyCharSymSpaceMove,
  EditorKeyCharSymSpaceMoveWB,
  EditorKeyCharSymEnterDelete,
  EditorKeyCharSymEnterDeleteWB,
  EditorKeySymbol,
  EditorKeyCustom,
  KeyboardKey
};
export default poke43;
