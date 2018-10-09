import React, { Component } from 'react';
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

// SAMPLE COMMAND
/*command.input('/Users/austinbrown/documents/samples/chippichippi.flac')
  .audioCodec('libmp3lame')
  .on('error', function(err) {
    console.log('An error occurred: ' + err.message);
  })
  .on('end', function() {
    console.log('Processing finished !');
  })
  .save('/Users/austinbrown/documents/samples/chippichippiSUCCESS.mp3');*/

// TODO: //
//////////////////////////////
//
// Persistance Data for User Settings
// Destination directory
// Option for Straight to Music Folder import
// otherwise, regular directory history
//
//////////////////////////////

class App extends Component {  
  render() {
    return (
      <MusicList />
    );
  }
}

// Stateless functional component
// Takes in an array of choice options to appear
function RadioOption ({options, selected, onChange}){
  return (
    <div className="radiooption">
      {options.map((choice, index) => (
        <label key={index}>
          <input type="radio"
            name="vote"
            value={choice.value}
            key={index}
            checked={selected === choice.value}
            onChange={onChange} />
          {choice.text}
        </label>
      ))}
    </div>
  )
}


// Chooses which user preferences are shown for Regular Conversion
// and S2L (straight to library) Conversion
// TODO: View is changed dependent on 
// TODO: Data persistence
// TODO: Directory return
class RadioSelect extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedOption: ''
    }
    this.handleClick = this.handleClick.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleClick() {
    console.log('submitted value', this.state.selected)
  }

  handleChange(event) {
    console.log('selected option', event.target.value)
    this.setState({selectedOption: event.target.value})
  }

  render() {
    //depending on state, return one of the options
    //the select will handle the render themselves

    /*const formsubmission;
    if(this.state.value == 'music'){
      formsubmission = 'music';
    } else {
      formsubmission = 'default';
    }*/

   let choices = [{ text: 'Default', value: '1' },
                     { text: 'Music', value: '2' }
    ];

    return (
      <div className="radioselect">
        <RadioOption
          options={choices}
          onChange={(e) => this.handleChange(e)}
          selected={this.state.selectedOption} />
      </div>
    )
  };
}

// Stateless functional component
// onClick begins process of conversion of files in list
function StartButton (props){
  return (
    <div className="convert">
      <button onClick={props.serializeFiles}>Start Conversion</button>
    </div>
  )
}

// Stateless functional component
// onClick causes MusicList to clear it's state of files
function ClearList (props){
  return (
    <div className="clearlist">
      <button onClick={props.clearList}>Clear List</button>
    </div>
  )
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
    this.clearList = this.clearList.bind(this);
  }

  // O
  componentDidMount() {
    ipcRenderer.on('async-reply', (event, arg) => {
      console.log(arg);
    });
    ipcRenderer.send('asynchronous-message', 'ping');
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

  // File drag enter React function
  onDragEnter() {
    this.setState({
      dropzoneActive: true
    });
  }

  // File drag leave React Function
  onDragLeave() {
    this.setState({
      dropzoneActive: false
    });
  }

  // On file drop onto window
  // Modified to remove duplicates
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

  // Defines what are acceptable Mime file types
  applyMimeTypes(event) {
    this.setState({
      accept: event.target.value
    });
  }

  // Remove an item from the list
  removeItem(item) { 
    const newFiles = this.state.files.filter(el => el !== item)
    this.setState({
      files: newFiles
    })
  }

  // Sets state of files to an empty array
  clearList() {
    this.setState({
      files: []
    })
  }

  // Takes list of files, takes filetype string, replaces with .mp3
  // TODO: Make applible to any filetype??
  serializeFiles() {
    const serialFiles = this.state.files.map((f) => {
      f = f.path
      const newFile = f.split('.').slice(0, -1).join('.')
      //this.conversionProcess(f, newFile + '.mp3');
    });
    console.log(this.state.files);
    //ipcRenderer.send('file-list-test', serialFiles);  
    //console.log(serialFiles);
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
          <RadioSelect />
          <StartButton serializeFiles={() => this.serializeFiles()} />
          <ClearList clearList={() => this.clearList()}/>
          <h2>Dropped files</h2>
          <div className="scroll">
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