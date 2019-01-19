# Release Notes

## 2.5.1

* Fix undefined function call bug when addon is not loaded

## 2.5.0

* Wire CodeMirror auto close brackets and tags addons to poke43 keyboard (the required dependencies have to be managed separately)

## 2.4.0

* Add `codemirror` option (either boolean or CodeMirror options object) to `Poke` constructor to use CodeMirror as editor (the required dependencies have to be managed separately)
* Add dark CodeMirror theme (ir_black variant) to dark css file

## 2.3.0

* Add support for using CodeMirror as editor

## 2.2.0

* Always show some output when eval'ing JS

## 2.1.0

* Better support for error source traces when evaluating editor content as JS

## 2.0.1

* Fix implementation quirk that required `poke43` to be global when using the ES module bundle

## 2.0.0

* Significantly restructure source and use rollup to build browser and ES module bundles

## 1.15.0

* Fix line height and touched line index calculations yielding incorrect values when editor is taller than the lines contained
* Prevent editor zoom on double tap
* Fix dark theme css rule

## 1.14.0

* Add dark theme
* Make sure the caret stays within visible editor area when editing
* Make swipe over the keys a bit more sensitive

## 1.13.0

* Fix caret line rendering issue (the part after the caret was slightly displaced and blurry)

## 1.12.0

* Move caret to corresponding line/column on tap

## 1.11.0

Changes to aid larger files editing

* Enable editor scrolling and set relevant styles
* Only render affected lines on edit instead of full re-render

## 1.10.0

* Implement editor buffer as array of lines instead of single string
* Tweak smart delimiters heuristic a bit

## 1.9.0

Simplistic smart delimiters/space/newline/move/delete implementation:

* Apostrophe, quote and backtick are doubled on insert and the caret positioned in between
* Open parenthesis, bracket and brace are matched with closing on insert and the caret positioned in between
* Indentation level of next line is maintained on newline insert
* Indentation level of next line is increased on newline insert between parentheses, brackets and braces
* Abbreviation expansion takes indentation level of current line into account
* Single space before nonspace on line indents (removing the need for tab key) (currently two spaces, no config option), backspace unindents, backward move skips indent levels
* Forward delete and move are always dumb serving as escape hatch for when the rules get in the way

## 1.8.0

* Tweak space/enter move/delete areas placement
* Show symbols on language block keys when symbol block is hidden
* Tweak symbol keys layout
* Flash distinctly no op key commands

## 1.7.0

* Improve emmet abbreviation detection by using emmet extract-abbreviation instead of dumb regexp

## 1.6.0

* Add the ability to execute JS
* Add the ability to show/hide keyboard
* Add the ability to move to start/end and move/delete at word boundaries (initially implemented using \w)
* Ignore out of bounds move/delete attempts instead of throwing exceptions
* Tweak keyboard z-index and opacity
* Minor symbol key layout tweak

## 1.5.0

* Add partial support for handling emmet tabstops (position caret to the first tabstop if present)

## 1.4.0

* Add the ability to toggle symbol row and switch layouts
* Add the ability to switch languages
* Add the ability to expand emmet abbreviations

## 1.3.0

* Package default layout inside implementation to make client code much simpler

## 1.2.0

* Basic common layout ready

## 1.1.0

* Show key secondary value hints
* Animate keys on tap/swipe

## 1.0.0

Initial release
