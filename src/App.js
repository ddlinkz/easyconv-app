import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import Dropzone from 'react-dropzone'; //https://react-dropzone.netlify.com/
import ffmpegpath from 'ffmpeg-static';

const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer = electron.ipcRenderer;

const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegpath.path);

const debug = false;
const outputDir = '/Users/austinbrown/documents/samples/test';

if(debug) {
  fs.access(ffmpegpath.path, fs.constants.F_OK, (err) => {
    console.log(`${ffmpegpath.path} ${err ? 'does not exist' : 'exists'}`);
  });
  
  ffmpeg.getAvailableCodecs(function(err, codecs) {
    console.log('Available codecs:');
    console.dir(codecs);
  });
}

// Sample command
/*command.input('/Users/austinbrown/documents/samples/chippichippi.flac')
  .audioCodec('libmp3lame')
  .on('error', function(err) {
    console.log('An error occurred: ' + err.message);
  })
  .on('end', function() {
    console.log('Processing finished !');
  })
  .save('/Users/austinbrown/documents/samples/chippichippiSUCCESS.mp3');*/

//TODO:
// Clear List
// Sticky Dropped Files List
// Persistance Data for User Settings
// Destination directory
// Option for Straight to Music Folder import
// otherwise, regular directory history

class App extends Component {  
  render() {
    return (
      <MusicList />
    );
  }
}

class DirRadioSelect extends Component {
  constructor() {
    super()
    this.state = {
      value: 'default'
    }

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event) {
    this.setState({value: event.target.value})
  }

  render() {
    //depending on state, return one of the options

    return (
      <div>
        <form>
          <input type="radio" value="default"/>Default
          <input type="radio" value="music"/>Music
        </form>
      </div>
    )
  };
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
    this.serializeFiles = this.serializeFiles.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('async-reply', (event, arg) => {
      console.log(arg);
    });
    ipcRenderer.send('asynchronous-message', 'ping');
  }

  serializeFiles() {
    const serialFiles = this.state.files.map((f) => {
      f = f.path
      const newFile = f.split('.').slice(0, -1).join('.')
      this.conversionProcess(f, newFile + '.mp3');
    });
    //ipcRenderer.send('file-list-test', serialFiles);  
    //console.log(serialFiles);
  }

  conversionProcess(file, output) {
    const command = new ffmpeg();
    const newFile = file.split('.').slice(0, -1).join('.')

    command.input(file)
    .audioCodec('libmp3lame')
    .on('error', function(err) {
      console.log('An error occurred: ' + err.message);
    })
    .on('end', function() {
      console.log('Processing finished !');
    })
    .save(output);
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

  onDrop(files) {
    // Contributed by Jacob Katzeff
    const currPaths = this.state.files.map((file) => file.path);
    let f = files.slice()
    let arr=[];
    for(let i=0;i<f.length;i++){
      let file = f[i];
      if(currPaths.indexOf(file.path) >= 0){
        continue;
      } else {
        arr = arr.concat(file);
      }
    }
    const combo = this.state.files.concat(arr);
    const newFiles = combo.filter((v, i, a) => a.indexOf(v) === i);
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
    const divStyle = {
      position: 'relative',
      textAlign: 'left',
      left: '10px',
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
        <div className="App" style={divStyle} >
          <h1><i>EasyConv</i></h1>
          <p>Drop files onto the app to prepare them for conversion.</p>
          <h2>Directory Selection</h2>
          <input type="file" webkitdirectory="true" />
          <DirRadioSelect />
          <div className="convert">
            <button onClick={this.serializeFiles}>Start Conversion</button>
          </div>
          <h2>Dropped files</h2>
          <ul>
            {
              files.map((file,i) => <MusicFile 
                                key={file.path+i}
                                filepath={file.path.split("/").pop()}
                                removeItem={() => this.removeItem(file)} 
                              />)
            }
          </ul>
        </div>
      </Dropzone>
    );
  }
}

export default App;

/*
Two different choices

Music: Take in Artist, Album, Music Directory
Converts straight to music library.

Regular folder:
Converts straight to folder

Folder can be passed down from app communication from memory as prop

DirRadioSelect
state: setState based on selected value

if Music: call MusicDir, pass props of stored music directory
and handleChange
MusicDir:
<form></form>

*/