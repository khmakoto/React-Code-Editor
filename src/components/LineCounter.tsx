import * as React from 'react';

export interface LineCounterProps {
  lineCount: number;
}

export class LineCounter extends React.Component<LineCounterProps, {}> {
  constructor(props: LineCounterProps) {
    super(props);
  }

  private _styles: React.CSSProperties = {
    boxSizing: 'border-box',
    color: '#858585',
    float: 'left',
    height: '100%',
    padding: '5px',
    textAlign: 'right',
    width: '40px'
  };

  render() {
    const { lineCount } = this.props;

    let lineNumbers: JSX.Element[] = [];
    for (let i = 1; i <= lineCount; i++) {
      lineNumbers.push(<div key={'lineNumber' + i}>{i}</div>);
    }

    return <div style={this._styles}>{lineNumbers}</div>;
  }
}
