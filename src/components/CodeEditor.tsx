import * as React from 'react';
import ContentEditable from 'react-contenteditable';
import $ from 'jquery';
import { libraryWords, reservedWords, semiReservedWords } from '../common/constants';
import './CodeEditor.css';

export interface CodeEditorProps {
  onChange?: (ev: React.KeyboardEvent<HTMLDivElement>, childCount: number) => void;
}

export interface CodeEditorState {
  innerHTML: string;
}

export class CodeEditor extends React.Component<CodeEditorProps, CodeEditorState> {
  constructor(props: CodeEditorProps) {
    super(props);

    this.state = {
      innerHTML: '<div>// Start writing code here...</div>'
    };
  }

  private _editor?: HTMLDivElement;
  private _view?: HTMLDivElement;

  private _onEditorRef = (div: HTMLDivElement) => {
    this._editor = div;
  };

  private _onViewRef = (div: HTMLDivElement) => {
    this._view = div;
  };

  private _viewStyles: React.CSSProperties = {
    boxSizing: 'border-box',
    color: '#9CDCFE',
    float: 'left',
    height: '100%',
    outline: 'none',
    width: 'calc(100% - 40px)',
    padding: '5px 5px 5px 15px'
  };

  private _editorStyles: React.CSSProperties = {
    ...this._viewStyles,
    ...{
      backgroundColor: 'transparent',
      caretColor: '#9CDCFE',
      color: 'transparent',
      height: 'calc(100% - 10px)',
      left: '40px',
      position: 'absolute',
      whiteSpace: 'pre'
    }
  };

  private _getCategory(target: string): string {
    for (let word of reservedWords) {
      if (word === target) {
        return 'reserved';
      }
    }

    for (let word of semiReservedWords) {
      if (word === target) {
        return 'semiReserved';
      }
    }

    for (let word of libraryWords) {
      if (word === target) {
        return 'library';
      }
    }

    return 'none';
  }

  private _colorWords(divArray: HTMLCollection) {
    const length = divArray.length;
    let innerText = '';

    for (let i = 0; i < length; i++) {
      let text = divArray[i].innerHTML;
      text = text.replace(/&nbsp;/g, ' ');
      text = text.replace(/<span class="statement">/g, '');
      text = text.replace(/<span class='statement'>/g, '');
      text = text.replace(/<span class="statement reserved">/g, '');
      text = text.replace(/<span class='statement reserved'>/g, '');
      text = text.replace(/<span class="statement semiReserved">/g, '');
      text = text.replace(/<span class='statement semiReserved'>/g, '');
      text = text.replace(/<span class="statement library">/g, '');
      text = text.replace(/<span class='statement library'>/g, '');
      text = text.replace(/<\/span>/g, '');

      let lineText = '';

      let len = text.length;
      let spaces = '<pre style="display: inline">';
      for (let j = 0; j < len; j++) {
        if (text[j] === ' ') {
          spaces += ' ';
        } else {
          text = text.substr(j);
          break;
        }
      }
      spaces += '</pre>';
      lineText += spaces;

      const wordArray = text.split(' ');
      len = wordArray.length;
      for (let j = 0; j < len - 1; j++) {
        let word = wordArray[j];

        let semicolon = false;
        if (word[word.length - 1] === ';' && word.substr(word.length - 4) !== '&lt;' && word.substr(word.length - 4) !== '&gt;') {
          word = word.substr(0, word.length - 1);
          semicolon = true;
        }

        switch (this._getCategory(word) || this._getCategory(word + ' ')) {
          case 'reserved': {
            lineText += '<span class="statement reserved">' + word;
            break;
          }
          case 'semiReserved': {
            lineText += '<span class="statement semiReserved">' + word;
            break;
          }
          case 'library': {
            lineText += '<span class="statement library">' + word;
            break;
          }
          default: {
            lineText += '<span class="statement">' + word;
          }
        }

        lineText += semicolon ? '</span><span class="statement">; </span>' : ' </span>';
      }

      let word = wordArray[len - 1];
      let semicolon = false;
      if (word[word.length - 1] === ';' && word.substr(word.length - 4) !== '&lt;' && word.substr(word.length - 4) !== '&gt;') {
        word = word.substr(0, word.length - 1);
        semicolon = true;
      }
      switch (this._getCategory(word) || this._getCategory(word + ' ')) {
        case 'reserved': {
          lineText += '<span class="statement reserved">' + word;
          break;
        }
        case 'semiReserved': {
          lineText += '<span class="statement semiReserved">' + word;
          break;
        }
        case 'library': {
          lineText += '<span class="statement library">' + word;
          break;
        }
        default: {
          lineText += '<span class="statement">' + word;
        }
      }
      lineText += semicolon ? '</span><span class="statement">;</span>' : '</span>';

      // console.log(lineText);
      innerText += '<div>' + lineText + '</div>';
    }

    if (this._editor) {
      this.setState({ innerHTML: this._editor.innerHTML });
    }
    if (this._view) {
      this._view.innerHTML = innerText;
    }
  }

  private _onChange = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    const { onChange } = this.props;

    if (onChange && this._editor) {
      this._colorWords(this._editor.children);
      onChange(ev, this._editor.children.length);
    }
  };

  private _onKeyDown = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    // If a tab was pressed
    if (ev.keyCode === 9) {
      ev.preventDefault();

      // Insert spaces at caret position.
      if (window.getSelection) {
        const selection = window.getSelection();
        if (selection && selection.getRangeAt && selection.rangeCount) {
          let range = selection.getRangeAt(0);
          range.deleteContents();

          let element = document.createElement('span');
          element.className = 'statement';
          element.innerHTML = '  ';

          let frag = document.createDocumentFragment();
          let node;
          let lastNode;

          while ((node = element.firstChild)) {
            lastNode = frag.appendChild(node);
          }
          range.insertNode(frag);

          // Preserve the selection
          if (lastNode) {
            range = range.cloneRange();
            range.setStartAfter(lastNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }

      if (this._editor) {
        this._colorWords(this._editor.children);
      }
    }
  };

  render() {
    return (
      <div>
        <ContentEditable
          style={this._editorStyles}
          innerRef={this._onEditorRef}
          html={this.state.innerHTML}
          onChange={this._onChange}
          onKeyDown={this._onKeyDown}
        />
        <div ref={this._onViewRef} style={this._viewStyles}>
          // Start writing code here...
        </div>
      </div>
    );
  }
}
