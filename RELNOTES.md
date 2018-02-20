# Release Notes

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
