import React, { Component } from 'react';
import './App.css';
import Dropzone from 'react-dropzone'; //https://react-dropzone.netlify.com/
import ffmpegpath from 'ffmpeg-static';
import ffprobepath from 'ffprobe-static';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";

const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer = electron.ipcRenderer;

const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegpath.path);
ffmpeg.setFfprobePath(ffprobepath.path);

const debug = true;

if(debug) {
  fs.access(ffmpegpath.path, fs.constants.F_OK, (err) => {
    console.log(`${ffmpegpath.path} ${err ? 'does not exist' : 'exists'}`);
  });

  fs.access(ffprobepath.path, fs.constants.F_OK, (err) => {
    console.log(`${ffprobepath.path} ${err ? 'does not exist' : 'exists'}`);
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
// Styling
// Better window while on OSX
// Conversion Complete
// Only whole numbers
//
//////////////////////////////

class App extends Component {  
  render() {
    return (
      <MusicList />
    );
  }
}

// ========================
// User Settings Components
// ========================

class SelectMusic extends Component {
  render() {
    return(
      <div className="selectmusic">
        <br/>
        <form>
          <label>
            <div className="selectmusicitem">
              Directory:
              <input
                className="submissionfield"
                name="musicDir"
                type="text"
                value={this.props.musicDir}
                onChange={this.props.onChange} />
            </div>
            <div className="selectmusicitem">
              Artist:
              <input
                className="submissionfield"
                name="artistForm"
                type="text" 
                value={this.props.artistForm} 
                onChange={this.props.onChange} />
            </div>
            <div className="selectmusicitem">
              Album:
              <input
                className="submissionfield"
                name="albumForm"
                type="text" 
                value={this.props.albumForm} 
                onChange={this.props.onChange} />
            </div>
          </label>
        </form>
      </div>
      )
  }
}

class SelectDefault extends Component {
  render() {
    return(
      <div className="selectdefault">
        <br/>
        <br/>
        <form>
          <label>
          Directory:
            <input
              className="submissionfield"
              name="defaultDir"
              type="text"
              value={this.props.defaultDir}
              onChange={this.props.onChange} />
            <br/>
          </label>
        </form>
      </div>
    )
  }
}

class RadioSelect extends Component {
  render() {
    return(
      <div className="radioselect">
        <h2>Directory Selection</h2>
        <RadioOption
          name="formselect"
          options={this.props.choices}
          onChange={this.props.onChange}
          selected={this.props.selectedOption} />
        <br/>
      </div>
    )
  }
}

function RadioOption ({options, selected, onChange}){
  return (
    <div className="radiooption">
      {options.map((choice, index) => (
        <label key={index}>
          <input type="radio"
            name="selectedOption"
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

// =================
// Button Components
// =================

function StartConversion (props){
  return(
    <button onClick={props.conversion}>Start Conversion</button>
  )
}

function ClearList (props){
  return (
    <button onClick={props.clearList}>Clear List</button>
  )
}

// ============================
// Input elements requiring Ref
// ============================

const MusicDirInput = React.forwardRef((props, ref) => (
  <input
    name="music-dir-file-input" 
    type="file" 
    ref={ref}
    webkitdirectory="true" 
    onChange={props.onChange} />
))

const DefaultDirInput = React.forwardRef((props, ref) => (
  <input
    name="default-dir-file-input" 
    type="file" 
    ref={ref}
    webkitdirectory="true" 
    onChange={props.onChange} />
))

// ===============
// File Components
// ===============

function MusicFile (props){
  return (
    <div className="musicfile">
      <button onClick={props.removeItem}>X</button>
      {props.filepath}
    </div>
  )
}

class MusicFileList extends Component{  
  render() {
  return(
    <div className="scroll">
      <ul>
        {
          this.props.files.map((file,i) => <MusicFile 
                            key={file.path+i}
                            file={file}
                            filepath={file.path.split("/").pop()}
                            removeItem={() => this.props.removeItem(file)} 
                          />)
        }
      </ul>
    </div>
  )}
}

function ChooseList (props){
  if(props.active){
    return(<ProgressBarList files={props.files} progress={props.progress}/>)
  } else {
    return(<MusicFileList files={props.files} removeItem={props.removeItem}/>)
  }
}

class ProgressBarList extends Component{
  render() {
    return(
      <div className="scroll">
        <ul>
          {
            this.props.files.map((file, i) => <Progress
                                            className="progress"
                                            key={file.path}
                                            percent={this.props.progress[i]}
                                            status="active"/>
              )
          }
        </ul>
      </div>
    )
  }
}

// ==============
// Main Component
// ==============

class MusicList extends Component {
  constructor() {
    super()
    this.state = { 
      accept: '',
      files: [],
      dropzoneActive: false,
      selectedOption: '',
      defaultDir: '',
      musicDir: '',
      artistForm: '',
      albumForm: '',
      conversionActive: false,
      progress: []
    }
    this.musicDirInput = React.createRef();
    this.defaultDirInput = React.createRef();

    this.handleChange = this.handleChange.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.clearList = this.clearList.bind(this);
    this.stopConversion = this.stopConversion.bind(this);
  }

  // ======================
  // Load up saved settings
  // ======================

  componentDidMount() {
    // Load up last selected radio optoin
    ipcRenderer.once('radio-select-launch-resp', (event, arg) => {
      this.setState({
        selectedOption: arg
      })
    })
    ipcRenderer.send('radio-select-launch', 'radio mount msg sent')

    // Load music direcotry
    ipcRenderer.once('music-dir-launch-resp', (event, arg) => {
      this.setState({
        musicDir: arg
      })
    })
    ipcRenderer.send('music-dir-launch', 'music dir msg sent')

    // Load default directory
    ipcRenderer.once('default-dir-launch-resp', (event, arg) => {
      this.setState({
        defaultDir: arg
      })
    })
    ipcRenderer.send('default-dir-launch', 'default dir msg sent')

    ipcRenderer.on('progress-resp', (event, arg) => {
      let newProgress = []
      if(this.state.progress === []){
        newProgress = new Array(this.state.files.length)
      } else {
        newProgress = this.state.progress
      }
      newProgress[arg.file] = arg.progress
      this.setState({
        progress: newProgress
      })
      console.log('Progress received: ' + newProgress)
    })

    ipcRenderer.on('progress-done-resp', (event, arg) => {
      this.setState({
        conversionActive: false,
        progress: []
      })
    })
  }
  
  // ====================
  // React File Functions
  // ====================

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

  // TODO: filetype management
  // Defines what are acceptable Mime file types
  applyMimeTypes(event) {
    this.setState({
      accept: event.target.value
    });
  }

  // ================
  // Modifying State Functions
  // ================

  // Sets state of files to an empty array
  clearList() {
    this.setState({
      files: []
    })
  }

  // Remove an item from the list
  removeItem(item) {
    const newFiles = this.state.files.filter(el => el !== item)
    this.setState({
      files: newFiles
    })
  }

  // Handles changes for forms and directory changes
  handleChange(event) {    
    let name = event.target.name
    let value = event.target.value

    if(name === 'default-dir-file-input'){
      value = this.defaultDirInput.current.files[0].path
      ipcRenderer.send('default-dir-save', value)
      name = 'defaultDir'
    } else if(name === 'music-dir-file-input'){
      value = this.musicDirInput.current.files[0].path
      ipcRenderer.send('music-dir-save', value)
      name = 'musicDir'
    } else if(name === 'defaultDir'){
      ipcRenderer.send('default-dir-save', value)
    } else if(name === 'musicDir'){
      ipcRenderer.send('music-dir-save', value)
    } else if(name === 'selectedOption'){
      ipcRenderer.send('radio-select-save', value)
    }

    this.setState({
      [name]: value
    })
  }
  
  // ==========================
  // Render Component Functions
  // ==========================

  renderSelect() {
    let choices = [{ text: 'Default', value: '1' },
                   { text: 'Music', value: '2' }]
    return (
      <RadioSelect 
        onChange={(e) => this.handleChange(e)}
        selectedOption={this.state.selectedOption}
        choices={choices}
        />
    )
  }

  // Depending on selectedOption, returns selected Div
  renderSettings() {
    if(this.state.selectedOption === '1'){
      return (<div className="user-settings">
                <h3>Default</h3>
                <p>This option will render your files and place them
                    in a directory of your choice</p>
                <br/>
                <DefaultDirInput 
                  ref={this.defaultDirInput}
                  onChange={(e) => this.handleChange(e)}
                  />
                <SelectDefault
                  defaultDirInput={this.defaultDirInput}
                  defaultDir={this.state.defaultDir}
                  onChange={(e) => this.handleChange(e)}
                  />
              </div>
              )
    } else {
      return (<div className="user-settings">
                <h3>Choose your music directory</h3>
                <p>This option will render your
                  files and place them into your music library</p>
                <br/>
                <MusicDirInput
                  ref={this.musicDirInput}
                  onChange={(e) => this.handleChange(e)}
                  />
                <SelectMusic 
                  musicDirInput={this.musicDirInput}
                  musicDir={this.state.musicDir}
                  artistForm={this.state.artistForm}
                  albumForm={this.state.albumForm}
                  onChange={(e) => this.handleChange(e)}
                  />
              </div>)
    }
  }

  // ====================
  // Conversion functions
  // ====================

  createFolders(artistDir, albumDir) {
    // if Artist directory DNE, make it
    if(!fs.existsSync(artistDir)){
      fs.mkdir(artistDir, err => {
        if (err && err.code !== 'EEXIST') throw 'up'
      })
    }
    // if Album directory DNE, make it
    if(!fs.existsSync(albumDir)){
      fs.mkdir(albumDir, err => {
        if (err && err.code !== 'EEXIST') throw 'up'
      })
    }
  }

  setConversion(){
    this.setState({
      conversionActive: true
    })
  }

  stopConversion(){
    this.setState({
      conversionActive: false
    })
  }
  
  conversion(){
    console.log('Starting conversion !')
    this.setConversion()

    const option = this.state.selectedOption
    let output = ''
    if(option === '1'){
      output = this.state.defaultDir
    } else {
      output = this.state.musicDir + '/' +
               this.state.artistForm + '/' +
               this.state.albumForm
      this.createFolders(this.state.musicDir + '/' +
                         this.state.artistForm,
                         output)
    }

    const oldFiles = this.state.files.map((file) => file.path)
    let finished = []
    //let times = []
    //times[0] = performance.now()
    for(let i = 0; i<oldFiles.length; i++){
      const command = new ffmpeg();
      command.input(oldFiles[i])
      command.audioCodec('libmp3lame')
        .audioBitrate(320)
        .format('mp3')
        .on('error', function(err) {
          console.log('An error occurred: ' + err.message);
        })
        .on('progress', function(progress) {
          let rounded = Math.round(progress.percent)
          ipcRenderer.send('progress', {file: i, progress: rounded})
        })
        .on('end', function() {
          //times[i+1] = performance.now()
          console.log('Processing finished !');
          finished.push('Done');
          if(finished.length === oldFiles.length){
            console.log('All processing finished.')
            ipcRenderer.send('progress-done', 'Progress done')
          }
          //console.log('This took ' + (times[i+1] - times[0]) + ' milliseconds')
        })
        .save(
          output + '/' + oldFiles[i].split("/").pop().split('.').slice(0, -1).join('.').concat('.mp3')
          )
    }
    if(finished.length === oldFiles.length){
      console.log('All processing finished.')
      this.stopConversion()
    }
  }

  // ===============
  // Render Function
  // ===============

  render() { 
    const { accept, files, dropzoneActive , progress} = this.state;
    const overlayStyle = {
      position: 'absolute', 
      top: 0,
      right: 0,
      bottom: 0,
      left:0,
      background: 'rgba(0,0,0,0.5)',
      //textAlign: 'center',
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
        <div className="App">
          <div className="header">
            <h1 className="main-header"><i>EasyConv</i></h1>
          </div>
          <div className="sub-header">
            <p className="sub-header">Drop files onto the app to prepare them for conversion.</p>
          </div>
          <div className="user-settings">
            {this.renderSelect()}
            {this.renderSettings()}
          </div>
          <div>
            <h2>Dropped files</h2>
            <ChooseList 
              active={this.state.conversionActive} 
              files={files} 
              progress={progress}
              removeItem={this.removeItem}/>
          </div>
          <StartConversion conversion={() => this.conversion()}/>
          <ClearList clearList={() => this.clearList()}/>
        </div>
      </Dropzone>
    );
  }
}

export default App;

// state will keep track of progress for each file
// when conversion starts, file list turns into progress bars for each file
// on each progress update, the app will call a function that sets the state for the new percent
// updateProgress function
// updateProgress(file, progress){
//
// this.setState({
//   fileProgress[file]: progress
// });
//

// new class