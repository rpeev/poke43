import poke43 from './base.js';
import Keyboard from './keyboard';

/* Notes:
  - Class factory (pokeize) is used instead of just extending from CodeMirror to avoid introducing hard dependency on it and reserve the possibility to add options
  - CodeMirror.fromTextArea creates CodeMirror instance so just extending from it and implementing the Poke43 editor interface methods won't work. Instead, the created CodeMirror instance (either via fromTextArea or the constructor) is augmented with the necessary methods and props using a mixin approach
*/

// Necessary options to prevent native touch keyboard from popping up
const initialize = opts => Object.assign(opts, {
  inputStyle: 'textarea',
  readOnly: 'nocursor'
});

// Poke43 editor interface (without getters/setters)
// implemented in terms of a CodeMirror instance (this)
const editorMixin = {
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

// Poke43 editor interface (getters/setters)
// implemented in terms of a CodeMirror instance (this)
const editorMixinGetSet = {
  content: {
    get() { return this.getValue(); },
    set(text) { this.setValue(text); }
  }
};

// Mix-in the Poke43 editor interface implementation to CodeMirror instance
const editorize = inst => Object.defineProperties(
  Object.assign(inst, editorMixin), editorMixinGetSet
);

// Create and attach Poke43 keyboard to CodeMirror instance
const keyboardize = inst => {
  let el = inst.getWrapperElement();
  let elParent = el.parentElement;
  let elKbd = document.createElement('div');

  elParent.insertBefore(elKbd, el);
  inst._keyboard = new Keyboard(inst, elKbd);
  inst.on('touchstart', () => inst._keyboard.show());

  return inst;
};

// 'pokeized' CodeMirror class factory, use like:
// const PokeMirror = pokeize(CodeMirror);
// ...use like the regular CodeMirror ctor (fromTextArea, constructor, etc)
const pokeize = ctor => class extends ctor {
  static get [Symbol.toStringTag]() {
    return 'pokeize(CodeMirror)';
  }

  get [Symbol.toStringTag]() {
    return 'pokeize(CodeMirror)';
  }

  static fromTextArea(el, opts) {
    let inst = super.fromTextArea(el, initialize(opts));

    return keyboardize(editorize(inst));
  }

  constructor(el, opts) {
    super(el, initialize(opts));

    keyboardize(editorize(this));
  }
};

Object.assign(poke43, {
  pokeize
});

export {
  pokeize
};
