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
// If folders DNE, create them
// Progress bars?
//
//////////////////////////////

class App extends Component {  
  render() {
    return (
      <MusicList />
    );
  }
}

// Forms to show when Music is selected
class SelectMusic extends Component {
  constructor(props) {
    super(props)
    this.state = {
      artist: '',
      album: '',
      dir: '',
      files: props.files
    }

    this.handleClick = this.handleClick.bind(this)
    this.musicDirInput = React.createRef();
    this.handleChange = this.handleChange.bind(this)
  }

  // Update props on newly passed props
  static getDerivedStateFromProps(nextProps) {
    return{
      files: nextProps.files
    }
  }

  // Setting state using data from async request
  componentDidMount() {
    ipcRenderer.once('music-dir-launch-resp', (event, arg) => {
      this.setState({
        dir: arg
      })
    });
    ipcRenderer.send('music-dir-launch', 'music dir msg sent');
  }

  handleChange(event) {
    let name = event.target.name
    let value = event.target.value

    if(name === 'dir-file-input'){
      value = this.musicDirInput.current.files[0].path
      ipcRenderer.send('music-dir-save', value)
      name = 'dir'
    } else if(name === 'dir'){
      ipcRenderer.send('music-dir-save', value)
    }

    this.setState({
        [name]: value
    })
  }

  handleClick() {
    const {files, dir, artist, album} = this.state
    this.conversion(files,dir+'/'+artist+'/'+album)
  }

  conversion(oldFiles, output){
    console.log('Starting conversion!')
    const command = new ffmpeg();

    oldFiles.map((file) =>
      command.input(file)
      .audioCodec('libmp3lame')
      .on('error', function(err) {
        console.log('An error occurred: ' + err.message);
      })
      .on('end', function() {
        console.log('Processing finished !');
      })
      .save(
        output + '/' + file.split("/").pop().split('.').slice(0, -1).join('.').concat('.mp3')
        )
    )
  }

  render () {
    return(
      <div className="selectmusic">
        <h3>Choose your music directory</h3>
        <p>This option will render your
           files and place them into your music library</p>
        <input
          name="dir-file-input" 
          type="file" 
          ref={this.musicDirInput}
          webkitdirectory="true" 
          onChange={this.handleChange} />
        <br/>
        <br/>
        <form>
          <label>
            Directory:
            <input
              name="dir"
              type="text"
              value={this.state.dir}
              onChange={this.handleChange} />
            <br/>
            Artist:
            <input 
              name="artist"
              type="text" 
              value={this.state.artist} 
              onChange={this.handleChange} />
            Album:
            <input
              name="album"
              type="text" 
              value={this.state.album} 
              onChange={this.handleChange} />
          </label>
        </form>
        <button onClick={this.handleClick}>
          Start Conversion
        </button>
      </div>
    )
  };
}

// Forms to show when Default is selected
class SelectDefault extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dir: '',
      files: props.files
    }
    
    this.defaultDirInput = React.createRef();
    this.handleChange = this.handleChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  // Update props on newly passed props
  static getDerivedStateFromProps(nextProps) {
    return{
      files: nextProps.files
    }
  }

  // Setting state using data from async request
  componentDidMount(){
    ipcRenderer.once('default-dir-launch-resp', (event, arg) => {
      this.setState({
        dir: arg
      })
    })
    ipcRenderer.send('default-dir-launch', 'default dir msg sent')
  }

  handleChange(event) {
    let name = event.target.name
    let value = event.target.value

    // Handling for two seperate input forms
    if(name === 'dir-file-input'){
      value = this.defaultDirInput.current.files[0].path
      ipcRenderer.send('default-dir-save', value)
      name = 'dir'
    } else if(name === 'dir'){
      ipcRenderer.send('default-dir-save', value)
    }
    this.setState({
      [name]: value
    })
  }

  handleClick() {
    const {files, dir} = this.state
    this.conversion(files,dir)
  }

  conversion(oldFiles, output){
    console.log('Starting conversion!')
    const command = new ffmpeg();

    oldFiles.map((file) =>
      command.input(file)
      .audioCodec('libmp3lame')
      .on('error', function(err) {
        console.log('An error occurred: ' + err.message);
      })
      .on('end', function() {
        console.log('Processing finished !');
      })
      .save(
        output + '/' + file.split("/").pop().split('.').slice(0, -1).join('.').concat('.mp3')
        )
    )
  }

  render () {
    return(
      <div className="selectdefault">
        <h3>Default</h3>
        <p>This option will render your files and place them
            in a directory of your choice</p>
        <input
          name="dir-file-input" 
          type="file" 
          ref={this.defaultDirInput}
          webkitdirectory="true" 
          onChange={this.handleChange} />
        <br/>
        <form>
          <label>
          Directory:
            <input
              name="dir"
              type="text"
              value={this.state.dir}
              onChange={this.handleChange} />
            <br/>
          </label>
        </form>
        <button onClick={this.handleClick}>
          Start Conversion
        </button>
      </div>
    )
  };
}

// Returns the proper component based on RadioSelect
function SelectForm(props) {
  const selection = props.selection
  if(selection === '1'){
    return <SelectDefault files={props.files}/>
  } else {
    return <SelectMusic files={props.files}/>
  } 
}

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
// Music - S2L
// Default - Regular
class RadioSelect extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedOption: '',
      files: props.files
    }

    this.handleChange = this.handleChange.bind(this)
  }

  // Update props on newly passed props
  static getDerivedStateFromProps(nextProps) {
    return{
      files: nextProps.files
    }
  }

  // On mount, set selectedOption to previously used
  componentDidMount() {
    ipcRenderer.once('radio-select-launch-resp', (event, arg) => {
      this.setState({
        selectedOption: arg
      })
    });
    ipcRenderer.send('radio-select-launch', 'radio mount msg sent');
  }

  // When the select is changed, save and store option
  handleChange(event) {
    ipcRenderer.send('radio-select-save', event.target.value);
    this.setState({selectedOption: event.target.value})
  }

  render() {
    let choices = [{ text: 'Default', value: '1' },
                     { text: 'Music', value: '2' }]

    return (
      <div className="radioselect">
        <RadioOption
          name="formselect"
          options={choices}
          onChange={(e) => this.handleChange(e)}
          selected={this.state.selectedOption} />
        <SelectForm 
          selection={this.state.selectedOption}
          files={this.state.files} />
        <br/>
      </div>
    )
  };
}

// onClick begins process of conversion of files in list
function StartButton (props){
  return (
    <div className="convert">
      <button onClick={props.conversion}>Start Conversion</button>
    </div>
  )
}

// onClick causes MusicList to clear it's state of files
function ClearList (props){
  return (
    <div className="clearlist">
      <button onClick={props.clearList}>Clear List</button>
    </div>
  )
}

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

// Main Music component
// Contains dropzone for files
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
          <RadioSelect files={files.map((file) => file.path)}/>
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