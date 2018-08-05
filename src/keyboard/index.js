import Hammer from 'hammerjs';

import './styles/keyboard.scss';
import Key from './key';
import EditorKey, {
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
} from './editor-key';
import KeyboardKey from './keyboard-key';

class Keyboard {
  constructor(editor, el) {
    this._editor = editor;
    this._el = el;
    this._rowEls = this._getRowEls();
    this._keys = this._getKeys();
    this._symBlockActive = true;
    this._symBlockLayout = 'Poke43';
    this._custBlockActive = false;
    this._langBlockLayout = 'EnUsQwerty';
    this._hammer = new Hammer.Manager(this._el);

    this._el.classList.add('poke43-keyboard');

    if (this._rowEls.length === 0) {
      this._renderDefaultLayout();

      this._rowEls = this._getRowEls();
      this._keys = this._getKeys();
    }

    this._hammer.add(new Hammer.Tap());
    this._hammer.add(new Hammer.Swipe({
      direction: Hammer.DIRECTION_ALL,
      treshold: 2,
      velocity: 0.05
    }));

    this._hammer.on('tap', ev => {
      ev.preventDefault(); // Prevent zoom on double-tap
    });
    this._hammer.on('swipe', ev => {

    });

    this._symBlockActive && this[`_symBlock${this._symBlockLayout}Show`]();
    this._custBlockActive && this._custBlockShow();
    this[`_langBlock${this._langBlockLayout}Show`]();
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

  _hideRowEls(indices) {
    indices.forEach(i => this._rowEls[i].style.display = 'none');
  }

  _showRowEls(indices) {
    indices.forEach(i => this._rowEls[i].style.display = 'block');
  }

  get _symBlockPoke43Indices() { return [0]; }
  _symBlockPoke43Hide() { this._hideRowEls(this._symBlockPoke43Indices); }
  _symBlockPoke43Show() { this._showRowEls(this._symBlockPoke43Indices); }
  get _symBlockPoke43Layout() {
    return `<div class="poke43-keyboard-row" style="display: none;">
<span data-type="EditorKeySymbol"
  data-text="0"
  data-text2="2"
  data-text4="4"
  data-text6="3"
  data-text8="1"></span>
<span data-type="EditorKeySymbol"
  data-text="5"
  data-text2="7"
  data-text4="9"
  data-text6="8"
  data-text8="6"></span>
<span data-type="EditorKeySymbol"
  data-text="+"
  data-text2="*"
  data-text4="%"
  data-text6="_"
  data-text8="-"></span>
<span data-type="EditorKeySymbol"
  data-text="="
  data-text2="/"
  data-text4=">"
  data-text6="<"
  data-text8="\\"></span>
<span data-type="EditorKeySymbol"
  data-text="&"
  data-text2="|"
  data-text4=")"
  data-text6="("
  data-text8="~"></span>
<span data-type="EditorKeySymbol"
  data-text="#"
  data-text2="$"
  data-text4="]"
  data-text6="["
  data-text8="^"></span>
<span data-type="EditorKeySymbol"
  data-text="@"
  data-text2="'"
  data-text4="}"
  data-text6="{"
  data-text8="\`"></span>
<span data-type="EditorKeySymbol"
  data-text='"'
  data-text2="?"
  data-text4="."
  data-text6=","
  data-text8="!"></span>
<span data-type="EditorKeySymbol"
  data-text=";"
  data-text2=":"></span>
    </div>`;
  }

  get _symBlockTextasticIndices() { return [1]; }
  _symBlockTextasticHide() { this._hideRowEls(this._symBlockTextasticIndices); }
  _symBlockTextasticShow() { this._showRowEls(this._symBlockTextasticIndices); }
  get _symBlockTextasticLayout() {
    return `<div class="poke43-keyboard-row" style="display: none;">
<span data-type="EditorKeySymbol"
  data-text="0"
  data-text2="2"
  data-text4="4"
  data-text6="3"
  data-text8="1"></span>
<span data-type="EditorKeySymbol"
  data-text="5"
  data-text2="7"
  data-text4="9"
  data-text6="8"
  data-text8="6"></span>
<span data-type="EditorKeySymbol"
  data-text='"'
  data-text2=")"
  data-text4="]"
  data-text6="["
  data-text8="("></span>
<span data-type="EditorKeySymbol"
  data-text="'"
  data-text2="}"
  data-text4=">"
  data-text6="<"
  data-text8="{"></span>
<span data-type="EditorKeySymbol"
  data-text="$"
  data-text2="/"
  data-text4="\`"
  data-text6="´"
  data-text8="\\"></span>
<span data-type="EditorKeySymbol"
  data-text="|"
  data-text2="^"
  data-text4="£"
  data-text6="€"
  data-text8="~"></span>
<span data-type="EditorKeySymbol"
  data-text="="
  data-text2="+"
  data-text4="*"
  data-text6="%"
  data-text8="-"></span>
<span data-type="EditorKeySymbol"
  data-text="#"
  data-text2="?"
  data-text4="&"
  data-text6="@"
  data-text8="!"></span>
<span data-type="EditorKeySymbol"
  data-text=";"
  data-text2=":"
  data-text4="."
  data-text6=","
  data-text8="_"></span>
    </div>`;
  }

  get _custBlockIndices() { return [2]; }
  _custBlockHide() { this._hideRowEls(this._custBlockIndices); }
  _custBlockShow() { this._showRowEls(this._custBlockIndices); }
  get _custBlockLayout() {
    return `<div class="poke43-keyboard-row" style="display: none;">
<span data-type="EditorKeyCustom"></span>
<span data-type="EditorKeyCustom"></span>
<span data-type="EditorKeyCustom"></span>
<span data-type="EditorKeyCustom"></span>
<span data-type="EditorKeyCustom"></span>
<span data-type="EditorKeyCustom"></span>
    </div>`;
  }

  get _langBlockEnUsQwertyIndices() { return [3, 4, 5]; }
  _langBlockEnUsQwertyHide() {
    this._hideRowEls(this._langBlockEnUsQwertyIndices);
    this._hideRowEls(this._langBlockEnUsQwertySymIndices);
  }
  _langBlockEnUsQwertyShow() {
    this._showRowEls((this._symBlockActive) ?
      this._langBlockEnUsQwertyIndices :
      this._langBlockEnUsQwertySymIndices);
  }
  get _langBlockEnUsQwertyLayout() {
    return `<div class="poke43-keyboard-row" style="display: none;">
<span data-type="EditorKeyCharacterSpaceMove" data-text="q"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="w"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="e"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="r"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="t"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="y"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="u"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="i"></span>
<span data-type="EditorKeyCharacterEnterDelete" data-text="o"></span>
<span data-type="EditorKeyCharacterEnterDelete" data-text="p"></span>
    </div>
    <div class="poke43-keyboard-row" style="display: none;">
<span class="poke43-key-move1" data-type="EditorKeyCharacterSpaceMove"
  data-text="a"
  data-command3="moveToEOL"
  data-command7="moveToSOL"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="s"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="d"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="f"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="g"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="h"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="j"></span>
<span data-type="EditorKeyCharacterEnterDelete" data-text="k"></span>
<span data-type="EditorKeyCharacterEnterDelete" data-text="l"></span>
    </div>
    <div class="poke43-keyboard-row" style="display: none;">
<span data-type="KeyboardKey"
  data-command="cycleLangBlockLayouts" data-hint="\u{1f310}"
  data-command1="toggleSymBlock"
  data-command3="cycleSymBlockLayouts"
  data-command5="toggleCustBlock"></span>
<span data-type="EditorKeyCharacterSpaceMoveWB" data-text="z"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="x"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="c"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="v"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="b"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="n"></span>
<span data-type="EditorKeyCharacterEnterDeleteWB" data-text="m"></span>
<span data-type="KeyboardKey"
  data-hint="\u2728"
  data-command1="hide"
  data-command3="expandAbbreviation"
  data-command5="evalJS"></span>
    </div>`;
  }

  get _langBlockEnUsQwertySymIndices() { return [6, 7, 8]; }
  _langBlockEnUsQwertySymHide() { this._hideRowEls(this._langBlockEnUsQwertySymIndices); }
  _langBlockEnUsQwertySymShow() { this._showRowEls(this._langBlockEnUsQwertySymIndices); }
  get _langBlockEnUsQwertySymLayout() {
    return `<div class="poke43-keyboard-row" style="display: none;">
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="q" data-text2="!" data-text4="1"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="w" data-text2="@" data-text4="2"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="e" data-text2="#" data-text4="3"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="r" data-text2="$" data-text4="4"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="t" data-text2="%" data-text4="5"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="y" data-text2="^" data-text4="6"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="u" data-text2="&" data-text4="7"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="i" data-text2="*" data-text4="8"></span>
<span data-type="EditorKeyCharSymEnterDelete"
  data-text="o" data-text2="(" data-text4="9"></span>
<span data-type="EditorKeyCharSymEnterDelete"
  data-text="p" data-text2=")" data-text4="0"></span>
    </div>
    <div class="poke43-keyboard-row" style="display: none;">
<span class="poke43-key-move1" data-type="EditorKeyCharSymSpaceMove"
  data-text="a"
  data-command3="moveToEOL"
  data-command7="moveToSOL"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="s" data-text2="_" data-text4="-"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="d" data-text2="+" data-text4="="></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="f" data-text2="{" data-text4="["></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="g" data-text2="}" data-text4="]"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="h" data-text2=":" data-text4=";"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="j" data-text2='"' data-text4="'"></span>
<span data-type="EditorKeyCharSymEnterDelete"
  data-text="k" data-text2="|" data-text4="\\"></span>
<span data-type="EditorKeyCharSymEnterDelete" data-text="l"></span>
    </div>
    <div class="poke43-keyboard-row" style="display: none;">
<span data-type="KeyboardKey"
  data-command="cycleLangBlockLayouts" data-hint="\u{1f310}"
  data-command1="toggleSymBlock"
  data-command3="cycleSymBlockLayouts"
  data-command5="toggleCustBlock"></span>
<span data-type="EditorKeyCharSymSpaceMoveWB" data-text="z"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="x" data-text2="~" data-text4="\`"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="c" data-text2="<" data-text4=","></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="v" data-text2=">" data-text4="."></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="b" data-text2="?" data-text4="/"></span>
<span data-type="EditorKeyCharSymSpaceMove" data-text="n"></span>
<span data-type="EditorKeyCharSymEnterDeleteWB" data-text="m"></span>
<span data-type="KeyboardKey"
  data-hint="\u2728"
  data-command1="hide"
  data-command3="expandAbbreviation"
  data-command5="evalJS"></span>
    </div>`;
  }

  get _langBlockBgBgPhoneticIndices() { return [9, 10, 11]; }
  _langBlockBgBgPhoneticHide() {
    this._hideRowEls(this._langBlockBgBgPhoneticIndices);
    this._hideRowEls(this._langBlockBgBgPhoneticSymIndices);
  }
  _langBlockBgBgPhoneticShow() {
    this._showRowEls((this._symBlockActive) ?
      this._langBlockBgBgPhoneticIndices :
      this._langBlockBgBgPhoneticSymIndices);
  }
  get _langBlockBgBgPhoneticLayout() {
    return `<div class="poke43-keyboard-row" style="display: none;">
<span data-type="EditorKeyCharacterSpaceMove" data-text="я"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="в"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="е"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="р"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="т"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="ъ"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="у"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="и"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="о"></span>
<span data-type="EditorKeyCharacterEnterDelete" data-text="п"></span>
<span data-type="EditorKeyCharacterEnterDelete" data-text="ю"></span>
    </div>
    <div class="poke43-keyboard-row" style="display: none;">
<span class="poke43-key-move1" data-type="EditorKeyCharacterSpaceMove"
  data-text="а"
  data-command3="moveToEOL"
  data-command7="moveToSOL"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="с"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="д"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="ф"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="г"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="х"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="й"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="к"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="л"></span>
<span data-type="EditorKeyCharacterEnterDelete" data-text="ш"></span>
<span data-type="EditorKeyCharacterEnterDelete" data-text="щ"></span>
    </div>
    <div class="poke43-keyboard-row" style="display: none;">
<span data-type="KeyboardKey"
  data-command="cycleLangBlockLayouts" data-hint="\u{1f310}"
  data-command1="toggleSymBlock"
  data-command3="cycleSymBlockLayouts"
  data-command5="toggleCustBlock"></span>
<span data-type="EditorKeyCharacterSpaceMoveWB" data-text="з"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="ь"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="ц"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="ж"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="б"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="н" data-text2="\u2116"></span>
<span data-type="EditorKeyCharacterSpaceMove" data-text="м"></span>
<span data-type="EditorKeyCharacterEnterDeleteWB" data-text="ч"></span>
<span data-type="KeyboardKey"
  data-hint="\u2728"
  data-command1="hide"
  data-command3="expandAbbreviation"
  data-command5="evalJS"></span>
    </div>`;
  }

  get _langBlockBgBgPhoneticSymIndices() { return [12, 13, 14]; }
  _langBlockBgBgPhoneticSymHide() { this._hideRowEls(this._langBlockBgBgPhoneticSymIndices); }
  _langBlockBgBgPhoneticSymShow() { this._showRowEls(this._langBlockBgBgPhoneticSymIndices); }
  get _langBlockBgBgPhoneticSymLayout() {
    return `<div class="poke43-keyboard-row" style="display: none;">
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="я" data-text2="!" data-text4="1"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="в" data-text2="@" data-text4="2"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="е" data-text2="#" data-text4="3"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="р" data-text2="$" data-text4="4"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="т" data-text2="%" data-text4="5"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="ъ" data-text2="^" data-text4="6"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="у" data-text2="&" data-text4="7"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="и" data-text2="*" data-text4="8"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="о" data-text2="(" data-text4="9"></span>
<span data-type="EditorKeyCharSymEnterDelete"
  data-text="п" data-text2=")" data-text4="0"></span>
<span data-type="EditorKeyCharSymEnterDelete" data-text="ю"></span>
    </div>
    <div class="poke43-keyboard-row" style="display: none;">
<span class="poke43-key-move1" data-type="EditorKeyCharSymSpaceMove"
  data-text="а"
  data-command3="moveToEOL"
  data-command7="moveToSOL"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="с" data-text2="_" data-text4="-"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="д" data-text2="+" data-text4="="></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="ф" data-text2="{" data-text4="["></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="г" data-text2="}" data-text4="]"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="х" data-text2=":" data-text4=";"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="й" data-text2='"' data-text4="'"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="к" data-text2="|" data-text4="\\"></span>
<span data-type="EditorKeyCharSymSpaceMove" data-text="л"></span>
<span data-type="EditorKeyCharSymEnterDelete" data-text="ш"></span>
<span data-type="EditorKeyCharSymEnterDelete" data-text="щ"></span>
    </div>
    <div class="poke43-keyboard-row" style="display: none;">
<span data-type="KeyboardKey"
  data-command="cycleLangBlockLayouts" data-hint="\u{1f310}"
  data-command1="toggleSymBlock"
  data-command3="cycleSymBlockLayouts"
  data-command5="toggleCustBlock"></span>
<span data-type="EditorKeyCharSymSpaceMoveWB" data-text="з"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="ь" data-text2="~" data-text4="\`"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="ц" data-text2="<" data-text4=","></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="ж" data-text2=">" data-text4="."></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="б" data-text2="?" data-text4="/"></span>
<span data-type="EditorKeyCharSymSpaceMove"
  data-text="н" data-text2="\u2116"></span>
<span data-type="EditorKeyCharSymSpaceMove" data-text="м"></span>
<span data-type="EditorKeyCharSymEnterDeleteWB" data-text="ч"></span>
<span data-type="KeyboardKey"
  data-hint="\u2728"
  data-command1="hide"
  data-command3="expandAbbreviation"
  data-command5="evalJS"></span>
    </div>`;
  }

  _renderDefaultLayout() {
    this._el.innerHTML = `
${this._symBlockPoke43Layout}
${this._symBlockTextasticLayout}
${this._custBlockLayout}
${this._langBlockEnUsQwertyLayout}
${this._langBlockEnUsQwertySymLayout}
${this._langBlockBgBgPhoneticLayout}
${this._langBlockBgBgPhoneticSymLayout}
    `;
  }

  toggleSymBlock() {
    if (this._symBlockActive) {
      this._symBlockPoke43Hide();
      this._symBlockTextasticHide();

      this._symBlockActive = false;
    } else {
      switch (this._symBlockLayout) {
      case 'Poke43':
        this._symBlockTextasticHide();
        this._symBlockPoke43Show();

        break;
      case 'Textastic':
        this._symBlockPoke43Hide();
        this._symBlockTextasticShow();

        break;
      }

      this._symBlockActive = true;
    }

    this[`_langBlock${this._langBlockLayout}Hide`]();
    this[`_langBlock${this._langBlockLayout}Show`]();
  }

  cycleSymBlockLayouts() {
    if (!this._symBlockActive) {
      return;
    }

    switch (this._symBlockLayout) {
    case 'Poke43':
      this._symBlockPoke43Hide();
      this._symBlockTextasticShow();

      this._symBlockLayout = 'Textastic';

      break;
    case 'Textastic':
      this._symBlockTextasticHide();
      this._symBlockPoke43Show();

      this._symBlockLayout = 'Poke43';

      break;
    }
  }

  toggleCustBlock() {
    /*if (this._custBlockActive) {
      this._custBlockHide();

      this._custBlockActive = false;
    } else {
      this._custBlockShow();

      this._custBlockActive = true;
    }*/
  }

  cycleLangBlockLayouts() {
    switch (this._langBlockLayout) {
    case 'EnUsQwerty':
      this._langBlockEnUsQwertyHide();
      this._langBlockBgBgPhoneticShow();

      this._langBlockLayout = 'BgBgPhonetic';

      break;
    case 'BgBgPhonetic':
      this._langBlockBgBgPhoneticHide();
      this._langBlockEnUsQwertyShow();

      this._langBlockLayout = 'EnUsQwerty';

      break;
    }
  }

  hide() {
    this._el.style.display = 'none';
    this._editor._el.classList.remove('poke43-editor-editing');
    this._editor._view.hideCaret();
  }

  show() {
    this._el.style.display = '';
    this._editor._el.classList.add('poke43-editor-editing');
    this._editor._view.showCaret();
  }

  expandAbbreviation() {
    this._editor.expandAbbreviation();
  }

  evalJS() {
    this._editor.evalJS();
  }
}

export {
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
export default Keyboard;
