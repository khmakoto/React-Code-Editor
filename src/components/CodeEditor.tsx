import * as React from 'react';
import ContentEditable from 'react-contenteditable';
import { libraryWords, reservedWords, semiReservedWords } from '../common/constants';

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
      position: 'absolute'
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
      text = text.replace(/&nbsp;/g, '');
      text = text.replace(/<span>/g, '');
      text = text.replace(/<span style="color: #569CD6">/g, '');
      text = text.replace(/<span style='color: #569CD6'>/g, '');
      text = text.replace(/<span style="color: #C586C0">/g, '');
      text = text.replace(/<span style='color: #C586C0'>/g, '');
      text = text.replace(/<span style="color: #4EC9B0">/g, '');
      text = text.replace(/<span style='color: #4EC9B0'>/g, '');
      text = text.replace(/<\/span>/g, '');

      const wordArray = text.split(' ');

      let lineText = '';
      const len = wordArray.length;
      for (let j = 0; j < len - 1; j++) {
        let word = wordArray[j];
        let semicolon = false;
        console.log(word.substr(word.length - 4));
        if (word[word.length - 1] === ';' && word.substr(word.length - 4) !== '&lt;' && word.substr(word.length - 4) !== '&gt;') {
          word = word.substr(0, word.length - 1);
          semicolon = true;
        }

        switch (this._getCategory(word) || this._getCategory(word + ' ')) {
          case 'reserved': {
            lineText += '<span style="color: #569CD6">' + word;
            break;
          }
          case 'semiReserved': {
            lineText += '<span style="color: #C586C0">' + word;
            break;
          }
          case 'library': {
            lineText += '<span style="color: #4EC9B0">' + word;
            break;
          }
          default: {
            lineText += '<span>' + word;
          }
        }

        lineText += semicolon ? '</span><span>; </span>' : ' </span>';
      }

      let word = wordArray[len - 1];
      let semicolon = false;
      if (word[word.length - 1] === ';' && word.substr(word.length - 4) !== '&lt;' && word.substr(word.length - 4) !== '&gt;') {
        word = word.substr(0, word.length - 1);
        semicolon = true;
      }
      switch (this._getCategory(word) || this._getCategory(word + ' ')) {
        case 'reserved': {
          lineText += '<span style="color: #569CD6">' + word;
          break;
        }
        case 'semiReserved': {
          lineText += '<span style="color: #C586C0">' + word;
          break;
        }
        case 'library': {
          lineText += '<span style="color: #4EC9B0">' + word;
          break;
        }
        default: {
          lineText += '<span>' + word;
        }
      }
      lineText += semicolon ? '</span><span>;</span>' : '</span>';

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

  render() {
    return (
      <div>
        <ContentEditable style={this._editorStyles} innerRef={this._onEditorRef} html={this.state.innerHTML} onChange={this._onChange} />
        <div ref={this._onViewRef} style={this._viewStyles}>
          // Start writing code here...
        </div>
      </div>
    );
  }
}
