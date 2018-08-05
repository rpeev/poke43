import Key from './key';

class EditorKey extends Key {
  constructor(editor, el, props = el.dataset) {
    super(el, props);

    this._editor = editor;

    this._el.classList.add('poke43-key-editor');

    this._renderHints();
  }

  _execute(ev, index, text, command) {
    text && this._editor.insert(text);
    command && this._editor[command]();
  }
}

class EditorKeyCharacter extends EditorKey {
  constructor(editor, el, props = el.dataset) {
    super(editor, el, props);

    this._text1 = this._text1 || this._text0.toUpperCase();

    this._el.classList.add('poke43-key-character');

    this._renderHints();
  }
}

class EditorKeyCharacterSpaceMove extends EditorKey {
  constructor(editor, el, props = el.dataset) {
    super(editor, el, props);

    this._text1 = this._text1 || this._text0.toUpperCase();
    this._command3 = this._command3 || 'moveForward';
    this._text5 = this._text5 || ' ';
    //this._hint5 = this._hint5 || '\u2423';
    this._command7 = this._command7 || 'moveBackward';

    this._el.classList.add('poke43-key-character');
    this._el.classList.add('poke43-key-move');

    this._renderHints();
  }
}

class EditorKeyCharacterSpaceMoveWB extends EditorKey {
  constructor(editor, el, props = el.dataset) {
    super(editor, el, props);

    this._text1 = this._text1 || this._text0.toUpperCase();
    this._command3 = this._command3 || 'moveForwardWB';
    this._text5 = this._text5 || ' ';
    //this._hint5 = this._hint5 || '\u2423';
    this._command7 = this._command7 || 'moveBackwardWB';

    this._el.classList.add('poke43-key-character');
    this._el.classList.add('poke43-key-move');
    this._el.classList.add('poke43-key-important');

    this._renderHints();
  }
}

class EditorKeyCharacterEnterDelete extends EditorKey {
  constructor(editor, el, props = el.dataset) {
    super(editor, el, props);

    this._text1 = this._text1 || this._text0.toUpperCase();
    this._command3 = this._command3 || 'deleteForward';
    this._text5 = this._text5 || '\n';
    //this._hint5 = this._hint5 || '\u21b2';
    this._command7 = this._command7 || 'deleteBackward';

    this._el.classList.add('poke43-key-character');
    this._el.classList.add('poke43-key-delete');

    this._renderHints();
  }
}

class EditorKeyCharacterEnterDeleteWB extends EditorKey {
  constructor(editor, el, props = el.dataset) {
    super(editor, el, props);

    this._text1 = this._text1 || this._text0.toUpperCase();
    this._command3 = this._command3 || 'deleteForwardWB';
    this._text5 = this._text5 || '\n';
    //this._hint5 = this._hint5 || '\u21b2';
    this._command7 = this._command7 || 'deleteBackwardWB';

    this._el.classList.add('poke43-key-character');
    this._el.classList.add('poke43-key-delete');
    this._el.classList.add('poke43-key-important');

    this._renderHints();
  }
}

class EditorKeyCharSymSpaceMove extends EditorKey {
  constructor(editor, el, props = el.dataset) {
    super(editor, el, props);

    this._text1 = this._text1 || this._text0.toUpperCase();
    this._text8 = this._text8 || this._text1;
    this._command3 = this._command3 || 'moveForward';
    this._text5 = this._text5 || ' ';
    this._text6 = this._text6 || ' ';
    this._command7 = this._command7 || 'moveBackward';

    if (!props.dispatchSwipe) {
      this._dispatchSwipe = this._dispatchSwipe8;
    }
    if (!props.renderHints) {
      this._renderHints = this._renderHints4diag;
    }

    this._el.classList.add('poke43-key-character');
    this._el.classList.add('poke43-key-move');

    this._renderHints();
  }
}

class EditorKeyCharSymSpaceMoveWB extends EditorKey {
  constructor(editor, el, props = el.dataset) {
    super(editor, el, props);

    this._text1 = this._text1 || this._text0.toUpperCase();
    this._text8 = this._text8 || this._text1;
    this._command3 = this._command3 || 'moveForwardWB';
    this._text5 = this._text5 || ' ';
    this._text6 = this._text6 || ' ';
    this._command7 = this._command7 || 'moveBackwardWB';

    if (!props.dispatchSwipe) {
      this._dispatchSwipe = this._dispatchSwipe8;
    }
    if (!props.renderHints) {
      this._renderHints = this._renderHints4diag;
    }

    this._el.classList.add('poke43-key-character');
    this._el.classList.add('poke43-key-move');
    this._el.classList.add('poke43-key-important');

    this._renderHints();
  }
}

class EditorKeyCharSymEnterDelete extends EditorKey {
  constructor(editor, el, props = el.dataset) {
    super(editor, el, props);

    this._text1 = this._text1 || this._text0.toUpperCase();
    this._text8 = this._text8 || this._text1;
    this._command3 = this._command3 || 'deleteForward';
    this._text5 = this._text5 || '\n';
    this._text6 = this._text6 || '\n';
    this._command7 = this._command7 || 'deleteBackward';

    if (!props.dispatchSwipe) {
      this._dispatchSwipe = this._dispatchSwipe8;
    }
    if (!props.renderHints) {
      this._renderHints = this._renderHints4diag;
    }

    this._el.classList.add('poke43-key-character');
    this._el.classList.add('poke43-key-delete');

    this._renderHints();
  }
}

class EditorKeyCharSymEnterDeleteWB extends EditorKey {
  constructor(editor, el, props = el.dataset) {
    super(editor, el, props);

    this._text1 = this._text1 || this._text0.toUpperCase();
    this._text8 = this._text8 || this._text1;
    this._command3 = this._command3 || 'deleteForwardWB';
    this._text5 = this._text5 || '\n';
    this._text6 = this._text6 || '\n';
    this._command7 = this._command7 || 'deleteBackwardWB';

    if (!props.dispatchSwipe) {
      this._dispatchSwipe = this._dispatchSwipe8;
    }
    if (!props.renderHints) {
      this._renderHints = this._renderHints4diag;
    }

    this._el.classList.add('poke43-key-character');
    this._el.classList.add('poke43-key-delete');
    this._el.classList.add('poke43-key-important');

    this._renderHints();
  }
}

class EditorKeySymbol extends EditorKey {
  constructor(editor, el, props = el.dataset) {
    super(editor, el, props);
    
    if (!props.dispatchSwipe) {
      this._dispatchSwipe = this._dispatchSwipe4diag;
    }
    if (!props.renderHints) {
      this._renderHints = this._renderHints4diag;
    }

    this._el.classList.add('poke43-key-symbol');

    this._renderHints();
  }
}

class EditorKeyCustom extends EditorKey {
  constructor(editor, el, props = el.dataset) {
    super(editor, el, props);

    if (!props.dispatchSwipe) {
      this._dispatchSwipe = this._dispatchSwipe8;
    }
    if (!props.renderHints) {
      this._renderHints = this._renderHints8;
    }

    this._el.classList.add('poke43-key-custom');

    this._renderHints();
  }
}

export {
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
  EditorKeyCustom
};
export default EditorKey;
