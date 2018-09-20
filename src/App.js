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
      <MusicList />
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

  // Dropzone will work if it knows the dimensions of the page
  render() { 
    const { accept, files, dropzoneActive } = this.state;
    const overlayStyle = {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left:0,
      background: 'rgba(0,0,0,0.5)',
      textAlign: 'center',
      color: '#fff'
    };
    return(
      <Dropzone 
        disableClick
        style={{position: "relative"}}
        accept={accept}
        onDrop={this.onDrop.bind(this)}
        onDragEnter={this.onDragEnter.bind(this)}
        onDragLeave={this.onDragLeave.bind(this)}
      >
        { dropzoneActive && <div style={overlayStyle}>Drop files...</div> }
        <div className="App" >
          <h1> my awesome app </h1>
          <p>Drop files onto the app to prepare them for conversion.</p>
          <h2>Dropped files</h2>
          <ul>
            {
              files.map(f => <MusicFile filepath={f.path} />)
            }
          </ul>
        </div>
      </Dropzone>
    );
  }
}

export default App;
