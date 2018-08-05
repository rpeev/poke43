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

  get caretIsAtStart() {
    return this.caretIsAtFirstLine && this.caretIsAtSOL;
  }

  get caretIsAtEnd() {
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
    let iPrevLine = this._caret.iLine - 1;
    let iLastColumn = this._lines[iPrevLine].length;

    return this.moveCaret(iPrevLine, iLastColumn);
  }

  moveToNextSOL() {
    return this.moveCaret(this._caret.iLine + 1);
  }

  moveToStart() {
    return this.moveCaret(0);
  }

  moveToEnd() {
    let iLastLine = this._lines.length - 1;
    let iLastColumn = this._lines[iLastLine].length;

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

export default EditorModel;
