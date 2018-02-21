/*
  Poke43 - Touch based browser writing system experiments

  Copyright (c) 2018 Radoslav Peev <rpeev@ymail.com> (MIT License)
*/

(function () {

class Poke {
  constructor(el) {
    this._el = el;
    this._elEditor = document.createElement('div');
    this._editor = new poke43.Editor(this._elEditor);
    this._elKeyboard = document.createElement('div');
    this._keyboard = new poke43.EditorKeyboard(this._editor, this._elKeyboard);

    this._el.classList.add('poke43-poke');
    this._el.textContent = '';
    this._el.appendChild(this._elEditor);
    this._el.appendChild(this._elKeyboard);

    this._editor._hammer.on('tap', ev => {
      this._keyboard.show();
    });
  }
}

class EditorModel {
  constructor(text = '') {
    this._lines = text.split('\n');
    this._caret = {
      iLine: 0,
      iColumn: 0
    };
  }

  _checkLineIndex(iLine) {
    let lineUpper = this._lines.length - 1;

    if (iLine < 0 || iLine > lineUpper) {
      throw new RangeError(`Line index ${iLine} out of bounds [0, ${lineUpper}]`);
    }
  }

  _checkInsertLineBeforeIndex(iLine) {
    let lineUpper = this._lines.length;

    if (iLine < 0 || iLine > lineUpper) {
      throw new RangeError(`Line index ${iLine} out of bounds [0, ${lineUpper}]`);
    }
  }

  _checkInsertLineAfterIndex(iLine) {
    let lineUpper = this._lines.length - 1;

    if (iLine < -1 || iLine > lineUpper) {
      throw new RangeError(`Line index ${iLine} out of bounds [-1, ${lineUpper}]`);
    }
  }

  _checkColumnIndex(iLine, iColumn) {
    let columnUpper = this._lines[iLine].length;

    if (iColumn < 0 || iColumn > columnUpper) {
      throw new RangeError(`Column index ${iColumn} out of bounds [0, ${columnUpper}]`);
    }
  }

  get content() {
    return this._lines.join('\n');
  }

  set content(text) {
    this._lines = text.split('\n');
    this._caret.iLine = 0;
    this._caret.iColumn = 0;
  }

  get lines() {
    return this._lines;
  }

  line(iLine) {
    this._checkLineIndex(iLine);

    return this._lines[iLine];
  }

  lineParts(iLine, iColumn) {
    this._checkLineIndex(iLine);
    this._checkColumnIndex(iLine, iColumn);

    let line = this._lines[iLine];

    return [
      line.slice(0, iColumn),
      line.slice(iColumn)
    ];
  }

  insertLineBefore(iLine, line) {
    this._checkInsertLineBeforeIndex(iLine);

    this._lines.splice(iLine, 0, line);

    return this;
  }

  insertLineAfter(iLine, line) {
    this._checkInsertLineAfterIndex(iLine);

    this._lines.splice(iLine + 1, 0, line);

    return this;
  }

  removeLine(iLine) {
    this._checkLineIndex(iLine);

    this._lines.splice(iLine, 1);

    return this;
  }

  updateLine(iLine, line) {
    this._checkLineIndex(iLine);

    this._lines[iLine] = line;

    return this;
  }

  get caret() {
    return this._caret;
  }

  get caretIsAtFirstLine() {
    return this._caret.iLine === 0;
  }

  get caretIsAtLastLine() {
    return this._caret.iLine === this._lines.length - 1;
  }

  get caretIsAtSOL() {
    return this._caret.iColumn === 0;
  }

  get caretIsAtEOL() {
    let iLastColumn = this._lines[this._caret.iLine].length;

    return this._caret.iColumn === iLastColumn;
  }

  get caretIsAtSOB() {
    return this.caretIsAtFirstLine && this.caretIsAtSOL;
  }

  get caretIsAtEOB() {
    return this.caretIsAtLastLine && this.caretIsAtEOL;
  }

  moveCaret(iLine, iColumn = 0) {
    this._checkLineIndex(iLine);
    this._checkColumnIndex(iLine, iColumn);

    this._caret.iLine = iLine;
    this._caret.iColumn = iColumn;

    return this;
  }

  moveBackward(columnDelta = 1) {
    return this.moveCaret(this._caret.iLine, this._caret.iColumn - columnDelta);
  }

  moveForward(columnDelta = 1) {
    return this.moveCaret(this._caret.iLine, this._caret.iColumn + columnDelta);
  }

  moveToSOL() {
    return this.moveCaret(this._caret.iLine);
  }

  moveToEOL() {
    let iLastColumn = this._lines[this._caret.iLine].length;

    return this.moveCaret(this._caret.iLine, iLastColumn);
  }

  moveToPrevEOL() {
    let iPrevLine = this._caret.iLine - 1,
      iLastColumn = this._lines[iPrevLine].length;

    return this.moveCaret(iPrevLine, iLastColumn);
  }

  moveToNextSOL() {
    return this.moveCaret(this._caret.iLine + 1);
  }

  moveToSOB() {
    return this.moveCaret(0);
  }

  moveToEOB() {
    let iLastLine = this._lines.length - 1,
      iLastColumn = this._lines[iLastLine].length;

    return this.moveCaret(iLastLine, iLastColumn);
  }

  deleteBackward(columnDelta = 1) {
    let [part1, part2] = this.caretLineParts;

    this.updateCaretLine(`${part1.slice(0, this._caret.iColumn - columnDelta)}${part2}`);

    return this.moveBackward(columnDelta);
  }

  deleteForward(columnDelta = 1) {
    let [part1, part2] = this.caretLineParts;

    this.updateCaretLine(`${part1}${part2.slice(columnDelta)}`);

    return this;
  }

  get caretLine() {
    return this.line(this._caret.iLine);
  }

  get caretLineParts() {
    return this.lineParts(this._caret.iLine, this._caret.iColumn);
  }

  insertLineAfterCaretLine(line) {
    return this.insertLineAfter(this._caret.iLine, line);
  }

  updateCaretLine(line) {
    return this.updateLine(this._caret.iLine, line);
  }

  isIndentOnly(part1) {
    return part1.match(/^\s*$/);
  }

  getIndent(part1) {
    let match = part1.match(/^(\s+)/);

    return (match) ? match[1] : '';
  }

  endsWithWord(part1) {
    return part1.match(/\w$/);
  }

  startsWithWord(part2) {
    return part2.match(/^\w/);
  }
}

class EditorView {
  constructor(el, model) {
    this._el = el;
    this._model = model;

    this._el.classList.add('poke43-editor');
    this._el.classList.add('poke43-editor-editing');
  }

  get _renderedCaretLineIndex() {
    return Number(this._el.dataset.renderedCaretLineIndex);
  }

  set _renderedCaretLineIndex(iLine) {
    this._el.dataset.renderedCaretLineIndex = iLine;
  }

  get _lineHTML() {
    return `\
<span class="poke43-line-part"></span>`;
  }

  get _caretLineHTML() {
    return `\
<span class="poke43-line-part poke43-line-part1"></span>\
<span class="poke43-line-part poke43-line-caret poke43-blink-smooth">\u200b</span>\
<span class="poke43-line-part poke43-line-part2"></span>`;
  }

  insertLineBefore(iLine) {
    let elRefLine = this._el.children[iLine],
      elNewLine = document.createElement('div');

    elNewLine.classList.add('poke43-line');

    this._el.insertBefore(elNewLine, elRefLine);

    return this;
  }

  insertLineAfter(iLine) {
    let elRefLine = this._el.children[iLine].nextElementSibling,
      elNewLine = document.createElement('div');

    elNewLine.classList.add('poke43-line');

    this._el.insertBefore(elNewLine, elRefLine);

    return this;
  }

  removeLine(iLine) {
    let elLine = this._el.children[iLine];

    this._el.removeChild(elLine);

    return this;
  }

  renderLine(iLine) {
    let line = this._model.line(iLine),
      elLine = this._el.children[iLine];

    elLine.innerHTML = this._lineHTML;
    elLine.children[0].textContent = line;

    return this;
  }

  renderCaretLine() {
    let renderedCaretLineIndex = this._renderedCaretLineIndex,
      {iLine} = this._model.caret,
      [part1, part2] = this._model.caretLineParts,
      elLine = this._el.children[iLine];

    if (!Number.isNaN(renderedCaretLineIndex) && iLine != renderedCaretLineIndex) {
      try {
        // TODO: Line removal makes renderedCaretLineIndex invalid, recalc on remove?
        this.renderLine(renderedCaretLineIndex);
      } catch (err) {}
    }
    this._renderedCaretLineIndex = iLine;

    elLine.innerHTML = this._caretLineHTML;
    elLine.children[0].textContent = part1;
    elLine.children[2].textContent = part2;

    return this;
  }

  renderFully() {
    this._el.textContent = '';

    this._model.lines.forEach((line, i) => {
      this.insertLineBefore(i);
      this.renderLine(i);
    });

    return this.renderCaretLine();
  }

  updateLine(iLine) {
    let renderedCaretLineIndex = this._renderedCaretLineIndex,
      line = this._model.line(iLine),
      elLine = this._el.children[iLine];

    if (iLine === renderedCaretLineIndex) {
      throw RangeError(`Attempting to update rendered caret line at index ${iLine} like regular line`);
    }

    elLine.children[0].textContent = line;

    return this;
  }

  updateCaretLine() {
    let renderedCaretLineIndex = this._renderedCaretLineIndex,
      {iLine} = this._model.caret,
      [part1, part2] = this._model.caretLineParts,
      elLine = this._el.children[iLine];

    if (iLine != renderedCaretLineIndex) {
      throw RangeError(`Attempting to update rendered regular line at index ${iLine} like caret line (at index ${renderedCaretLineIndex})`);
    }

    elLine.children[0].textContent = part1;
    elLine.children[2].textContent = part2;

    return this;
  }

  hideCaret() {
    let {iLine} = this._model.caret,
      elLine = this._el.children[iLine];

    elLine.children[1].style.visibility = 'hidden';
  }

  showCaret() {
    let {iLine} = this._model.caret,
      elLine = this._el.children[iLine];

    elLine.children[1].style.visibility = 'visible';
  }
}

class Editor {
  constructor(el) {
    this._el = el;
    this._model = new poke43.EditorModel(this._el.textContent);
    this._view = new poke43.EditorView(this._el, this._model);
    this._hammer = new Hammer(this._el, {
      touchAction: 'auto'
    });

    this._view.renderFully();
  }

  get content() {
    return this._model.content;
  }

  set content(text) {
    this._model.content = text;
    this._view.renderFully();
  }

  _handleMoveBackwardAtSOL() {
    if (this._model.caretIsAtSOL) {
      if (!this._model.caretIsAtFirstLine) {
        this._model.moveToPrevEOL();
        this._view.renderCaretLine();
      }

      return true;
    }

    return false;
  }

  _handleMoveForwardAtEOL() {
    if (this._model.caretIsAtEOL) {
      if (!this._model.caretIsAtLastLine) {
        this._model.moveToNextSOL();
        this._view.renderCaretLine();
      }

      return true;
    }

    return false;
  }

  _joinCaretLineWithNext() {
    let iNextLine = this._model.caret.iLine + 1;

    this._model.updateCaretLine(`${this._model.caretLine}${this._model.line(iNextLine)}`);
    this._model.removeLine(iNextLine);
    this._view.removeLine(iNextLine);
    this._view.renderCaretLine();
  }

  _handleDeleteBackwardAtSOL() {
    if (this._model.caretIsAtSOL) {
      if (!this._model.caretIsAtFirstLine) {
        this._model.moveToPrevEOL();
        this._joinCaretLineWithNext();
      }

      return true;
    }

    return false;
  }

  _handleDeleteForwardAtEOL() {
    if (this._model.caretIsAtEOL) {
      if (!this._model.caretIsAtLastLine) {
        this._joinCaretLineWithNext();
      }

      return true;
    }

    return false;
  }

  _smartMoveBackward(editData) {
    if (editData.part1.length > 1 &&
      this._model.isIndentOnly(editData.part1)
    ) {
      editData.columnDelta += 1;
    }
  }

  moveBackward() {
    if (this._handleMoveBackwardAtSOL()) {
      return this;
    }

    let [part1, part2] = this._model.caretLineParts,
      editData = {
        part1: part1,
        part2: part2,
        columnDelta: 1
      };

    this._smartMoveBackward(editData);

    this._model.moveBackward(editData.columnDelta);
    this._view.updateCaretLine();

    return this;
  }

  moveForward() {
    if (this._handleMoveForwardAtEOL()) {
      return this;
    }

    this._model.moveForward();
    this._view.updateCaretLine();

    return this;
  }

  moveBackwardWB() {
    if (this._handleMoveBackwardAtSOL()) {
      return this;
    }

    let [part1, part2] = this._model.caretLineParts,
      match = part1.match(/(\w+)$/);

    if (match) {
      this._model.moveBackward(match[1].length);
      this._view.updateCaretLine();
    } else {
      let match = part1.match(/(\W+)$/);

      if (match) {
        this._model.moveBackward(match[1].length);
        this._view.updateCaretLine();
      }
    }

    return this;
  }

  moveForwardWB() {
    if (this._handleMoveForwardAtEOL()) {
      return this;
    }

    let [part1, part2] = this._model.caretLineParts,
      match = part2.match(/^(\w+)/);

    if (match) {
      this._model.moveForward(match[1].length);
      this._view.updateCaretLine();
    } else {
      let match = part2.match(/^(\W+)/);

      if (match) {
        this._model.moveForward(match[1].length);
        this._view.updateCaretLine();
      }
    }

    return this;
  }

  moveToSOL() {
    if (this._handleMoveBackwardAtSOL()) {
      return this;
    }

    this._model.moveToSOL();
    this._view.updateCaretLine();

    return this;
  }

  moveToEOL() {
    if (this._handleMoveForwardAtEOL()) {
      return this;
    }

    this._model.moveToEOL();
    this._view.updateCaretLine();

    return this;
  }

  moveToSOB() {
    this._model.moveToSOB();
    this._view.renderCaretLine();

    return this;
  }

  moveToEOB() {
    this._model.moveToEOB();
    this._view.renderCaretLine();

    return this;
  }

  deleteBackward() {
    if (this._handleDeleteBackwardAtSOL()) {
      return this;
    }

    let [part1, part2] = this._model.caretLineParts,
      editData = {
        part1: part1,
        part2: part2,
        columnDelta: 1
      };

    this._smartMoveBackward(editData);

    this._model.deleteBackward(editData.columnDelta);
    this._view.updateCaretLine();

    return this;
  }

  deleteForward() {
    if (this._handleDeleteForwardAtEOL()) {
      return this;
    }

    this._model.deleteForward();
    this._view.updateCaretLine();

    return this;
  }

  deleteBackwardWB() {
    if (this._handleDeleteBackwardAtSOL()) {
      return this;
    }

    let [part1, part2] = this._model.caretLineParts,
      match = part1.match(/(\w+)$/);

    if (match) {
      this._model.deleteBackward(match[1].length);
      this._view.updateCaretLine();
    } else {
      let match = part1.match(/(\W+)$/);

      if (match) {
        this._model.deleteBackward(match[1].length);
        this._view.updateCaretLine();
      }
    }

    return this;
  }

  deleteForwardWB() {
    if (this._handleDeleteForwardAtEOL()) {
      return this;
    }

    let [part1, part2] = this._model.caretLineParts,
      match = part2.match(/^(\w+)/);

    if (match) {
      this._model.deleteForward(match[1].length);
      this._view.updateCaretLine();
    } else {
      let match = part2.match(/(^\W+)/);

      if (match) {
        this._model.deleteForward(match[1].length);
        this._view.updateCaretLine();
      }
    }

    return this;
  }

  _smartLParen(editData) {
    if (this._model.startsWithWord(editData.part2)) {
      return;
    }

    editData.part += ')';
  }

  _smartLBracket(editData) {
    if (this._model.startsWithWord(editData.part2)) {
      return;
    }

    editData.part += ']';
  }

  _smartLBrace(editData) {
    if (this._model.startsWithWord(editData.part2)) {
      return;
    }

    editData.part += '}';
  }

  _smartApostrophe(editData) {
    if (this._model.endsWithWord(editData.part1) ||
      this._model.startsWithWord(editData.part2)
    ) {
      return;
    }

    editData.part += '\'';
  }

  _smartQuote(editData) {
    if (this._model.endsWithWord(editData.part1) ||
      this._model.startsWithWord(editData.part2)
    ) {
      return;
    }

    editData.part += '"';
  }

  _smartBacktick(editData) {
    if (this._model.endsWithWord(editData.part1) ||
      this._model.startsWithWord(editData.part2)
    ) {
      return;
    }

    editData.part += '`';
  }

  _smartSpace(editData) {
    if (this._model.isIndentOnly(editData.part1)) {
      editData.part += ' ';
      editData.columnDelta += 1;
    }
  }

  _smartNewline(editData) {
    let prevChar = editData.part1[editData.part1.length - 1],
      nextChar = editData.part2[0],
      indent = this._model.getIndent(editData.part1);

    if (
      (prevChar === '(' && nextChar === ')') ||
      (prevChar === '[' && nextChar === ']') ||
      (prevChar === '{' && nextChar === '}')
    ) {
      editData.part += `${indent}  \n${indent}`;
      editData.columnDelta += indent.length + 2;
    } else if(
      (prevChar === '(' && nextChar !== ')') ||
      (prevChar === '[' && nextChar !== ']') ||
      (prevChar === '{' && nextChar !== '}')
    ) {
      editData.part += `${indent}  `;
      editData.columnDelta += indent.length + 2;
    } else {
      editData.part += indent;
      editData.columnDelta += indent.length;
    }
  }

  // Assumes at least one newline in editData.part
  _modelEditData(editData) {
    let insertAfterCaretLine = editData.part.split('\n'),
      updateCaretLine = `${editData.part1}${insertAfterCaretLine.shift()}`,
      iLast = insertAfterCaretLine.length - 1;

    insertAfterCaretLine[iLast] = `${insertAfterCaretLine[iLast]}${editData.part2}`;

    let partBeforeNewCaret = editData.part.slice(0, editData.columnDelta),
      partBeforeNewCaretLines = partBeforeNewCaret.split('\n'),
      newlinesBeforeNewCaret = partBeforeNewCaretLines.length - 1;

    return {
      updateCaretLine: updateCaretLine,
      insertAfterCaretLine: insertAfterCaretLine,
      newCaret: {
        iLine: editData.caret.iLine + newlinesBeforeNewCaret,
        iColumn: partBeforeNewCaretLines[newlinesBeforeNewCaret].length
      }
    };
  }

  // TODO: Unify this and the various adhoc single line edits into one method
  _applyEdit(editData) {
    let modelEditData = this._modelEditData(editData);

    this._model.updateCaretLine(modelEditData.updateCaretLine);
    modelEditData.insertAfterCaretLine.forEach((line, i) => {
      this._model.insertLineAfter(editData.caret.iLine + i, line);
      this._view.insertLineAfter(editData.caret.iLine + i);
      this._view.renderLine(editData.caret.iLine + i + 1);
    });
    this._model.moveCaret(modelEditData.newCaret.iLine, modelEditData.newCaret.iColumn);
    this._view.renderCaretLine();
  }

  insert(part) {
    let [part1, part2] = this._model.caretLineParts,
      editData = {
        caret: this._model.caret,
        part1: part1,
        part2: part2,
        part: part,
        columnDelta: part.length
      };

    switch (part) {
    case '(': this._smartLParen(editData); break;
    case '[': this._smartLBracket(editData); break;
    case '{': this._smartLBrace(editData); break;
    case '\'': this._smartApostrophe(editData); break;
    case '"': this._smartQuote(editData); break;
    case '`': this._smartBacktick(editData); break;
    case ' ': this._smartSpace(editData); break;
    case '\n':
      this._smartNewline(editData);
      this._applyEdit(editData);

      return this;
    }

    this._model.updateCaretLine(`${part1}${editData.part}${part2}`);
    this._model.moveForward(editData.columnDelta);
    this._view.updateCaretLine();

    return this;
  }

  expandAbbreviation() {
    let line = this._model.caretLine,
      abbr = emmetExtractAbbreviation.extractAbbreviation(
        line,
        this._model.caret.iColumn,
        true
      );

    if (abbr) {
      let part1 = line.slice(0, abbr.location),
        part2 = line.slice(abbr.location + abbr.abbreviation.length),
        indent = this._model.getIndent(part1),
        expanded = emmet.expand(abbr.abbreviation, {
          field: emmetFieldParser.createToken,
          profile: {
            indent: '  ',
            selfClosingStyle: 'xhtml'
          }
        }),
        expanded1 = expanded.
          split('\n').
          map((l, i) => (i === 0) ? l : `${indent}${l}`).
          join('\n'),
        {string, fields} = emmetFieldParser.parse(expanded1);

      if (expanded1.match(/\n/)) {
        this._applyEdit({
          caret: this._model.caret,
          part1: part1,
          part2: part2,
          part: string,
          columnDelta: (fields.length > 0) ? fields[0].location : string.length
        });
      } else {
        this._model.updateCaretLine(`${part1}${string}${part2}`);
        this._model.moveCaret(this._model.caret.iLine,
          part1.length + ((fields.length > 0) ? fields[0].location : string.length));
        this._view.updateCaretLine();
      }
    }

    return this;
  }

  evalJS() {
    let res = eval(this.content),
      snip = (s, n) => {
        let s1 = s.replace(/\s+/g, ' ');

        return (s1.length > n) ? `${s1.slice(0, n)}...` : s1;
      };

    if (window.Peek42 && ['boolean', 'number', 'string'].includes(typeof res)) {
      p(res, snip(this.content, 101));
    }

    return this;
  }
}

class EditorKeyboard {
  constructor(editor, el) {
    this._editor = editor;
    this._el = el;
    this._rowEls = this._getRowEls();
    this._keys = this._getKeys();
    this._symBlockActive = true;
    this._symBlockLayout = 'Poke43';
    this._custBlockActive = false;
    this._langBlockLayout = 'EnUsQwerty';
    this._hammer = new Hammer(this._el);

    this._el.classList.add('poke43-keyboard');

    if (this._rowEls.length === 0) {
      this._renderDefaultLayout();

      this._rowEls = this._getRowEls();
      this._keys = this._getKeys();
    }

    this._hammer.
      get('swipe').
      set({direction: Hammer.DIRECTION_ALL});

    this._hammer.
      on('tap', ev => {
        ev.preventDefault(); // Prevent zoom on double-tap
      }).
      on('swipe', ev => {});

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
    this._hammer = new Hammer(this._el);

    this._el.classList.add('poke43-key');

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

// exports
window.poke43 = {
  Poke: Poke,
  EditorModel: EditorModel,
  EditorView: EditorView,
  Editor: Editor,
  EditorKeyboard: EditorKeyboard,
  Key: Key,
  KeyboardKey: KeyboardKey,
  EditorKey: EditorKey,
  EditorKeyCharacter: EditorKeyCharacter,
  EditorKeyCharacterSpaceMove: EditorKeyCharacterSpaceMove,
  EditorKeyCharacterSpaceMoveWB: EditorKeyCharacterSpaceMoveWB,
  EditorKeyCharacterEnterDelete: EditorKeyCharacterEnterDelete,
  EditorKeyCharacterEnterDeleteWB: EditorKeyCharacterEnterDeleteWB,
  EditorKeyCharSymSpaceMove: EditorKeyCharSymSpaceMove,
  EditorKeyCharSymSpaceMoveWB: EditorKeyCharSymSpaceMoveWB,
  EditorKeyCharSymEnterDelete: EditorKeyCharSymEnterDelete,
  EditorKeyCharSymEnterDeleteWB: EditorKeyCharSymEnterDeleteWB,
  EditorKeySymbol: EditorKeySymbol,
  EditorKeyCustom: EditorKeyCustom
};

})();
