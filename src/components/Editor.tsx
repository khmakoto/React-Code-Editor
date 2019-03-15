import * as React from 'react';
import { CodeEditor } from './CodeEditor';
import { LineCounter } from './LineCounter';

export interface EditorProps {}

export interface EditorState {
  lineCount: number;
}

export class Editor extends React.Component<{}, EditorState> {
  constructor(props: EditorProps) {
    super(props);

    this.state = {
      lineCount: 1
    };
  }

  private _styles: React.CSSProperties = {
    backgroundColor: '#1E1E1E',
    boxSizing: 'border-box',
    flex: 1,
    fontFamily: 'Consolas',
    fontSize: '14px',
    padding: '10px 0',
    width: '100%'
  };

  render() {
    const onCodeEditorChange = (ev: React.FormEvent<HTMLDivElement>, childCount: number): void => {
      this.setState({ lineCount: childCount });
    };

    return (
      <div style={this._styles} spellCheck={false}>
        <LineCounter lineCount={this.state.lineCount} />
        <CodeEditor onChange={onCodeEditorChange} />
      </div>
    );
  }
}
