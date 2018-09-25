import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import Dropzone from 'react-dropzone';

const electron = window.require('electron');
//const fs = electron.remote.require('fs');
const ipcRenderer = electron.ipcRenderer;

//https://react-dropzone.netlify.com/

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

// Stateless functional component
// onClick should define removing the component from the MusicList
// MusicList would then handleClick and remove MusicFile from list.
function MusicFile (props){
  return (
    <div className="musicfile">
      <button onClick={props.removeItem}>X</button>
      {props.filepath}
    </div>
  )
}

/* onDrop(files){
  this.setState((state, files) =>
  this.state = state.files - files));
}*/
class MusicList extends Component {
  constructor() {
    super()
    this.state = { 
      accept: '',
      files: [],
      dropzoneActive: false 
    }
    this.removeItem = this.removeItem.bind(this);
  }

  componentDidMount() {
    console.log('MusicList has mounted.')
    ipcRenderer.on('async-reply', (event, arg) => {
      console.log(arg);
    });
    ipcRenderer.send('asynchronous-message', 'ping');
  }

  /*componentWillUnmount() {
    console.log('check');
  }*/

  // When a file drags onto application
  // Sets dropzoneActive to its corresponding action
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

  //TODO: How to filter files with the same path
  onDrop(files) {
    const combo = this.state.files.concat(files);
    const newFiles = combo.filter((v, i, a) => a.indexOf(v) === i);
    console.log(newFiles);
    this.setState({
      files: newFiles,
      dropzoneActive: false
    });
  }

  applyMimeTypes(event) {
    this.setState({
      accept: event.target.value
    });
  }

  removeItem(item) { 
    const newFiles = this.state.files.filter(el => el !== item)
    this.setState({
      files: newFiles
    })
  }

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
              files.map(file => <MusicFile 
                                key={file.path}
                                filepath={file.path}
                                removeItem={() => this.removeItem(file)} 
                              />)
            }
          </ul>
          <div className="convert">
            <button>Start Conversion</button>
          </div>
        </div>
      </Dropzone>
    );
  }
}

export default App;
