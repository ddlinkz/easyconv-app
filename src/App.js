import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Dropzone from 'react-dropzone';

//TODO: 
// Destination director
// Actual conversion
// Option for Straight to Music Folder import (also saved in history
//      along with music directory)
// otherwise, regular directory history

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">How's it going to React</h1>
        </header>
        <MusicList />
      </div>
    );
  }
}

function MusicFile (props) {
  return (
    <div className="musicfile">
      <button onClick={props.onClick}>X</button>
      {props.filepath}
    </div>
  );
}

class MusicList extends Component {
  constructor() {
    super()
    this.state = { 
      accept: '',
      files: [],
      dropzoneActive: false 
    }
  }

  onDragEnter() {
    this.setState({
      dropzoneActive: true
    });
  }

  onDragLeave() {
    this.setState({
      dropzoneActive: false
    });
  }

  //TODO: Remember files that have already been dropped
  onDrop(files) {
    this.setState({
      files,
      dropzoneActive: false
    });
  }

  applyMimeTypes(event) {
    this.setState({
      accept: event.target.value
    });
  }

  /*handleClick(i) {
    const history = 
  }*/

  render() {
    return(
      <Dropzone 
        disableClick
        style={{position: "relative"}}
        accept={this.state.accept}
        onDrop={this.onDrop.bind(this)}
        onDragEnter={this.onDragEnter.bind(this)}
        onDragLeave={this.onDragLeave.bind(this)}
      >
        { this.state.dropzoneActive && <div class="overlayStyle">Drop files...</div> }
        <p>Try dropping some files here, or click to select files to upload.</p>
        <h2>Dropped files</h2>
        <ul>
          {
            this.state.files.map(f => <MusicFile filepath={f.path} />)
          }
        </ul>
      </Dropzone>
    );
  }
}

export default App;
