const electron = require('electron')
const Store = require('electron-store')
const path = require('path')
const url = require('url')
const {ipcMain} = require('electron')

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const store = new Store();

// Select Form Launch and Save
// On launch, respond with stored select
ipcMain.on('radio-select-launch', (event, arg) => {
  console.log('Radio Select launched')
  event.sender.send('radio-select-launch-resp', store.get('radioselect'))
})

// On save, store the selection
ipcMain.on('radio-select-save', (event, arg) => {
  console.log('Select saved!')
  store.set('radioselect', arg)
})

// Music Dir Launch and Save
ipcMain.on('music-dir-launch', (event, arg) => {
  console.log('Music Select launched')
  event.sender.send('music-dir-launch-resp', store.get('musicdirselect'))
})

ipcMain.on('music-dir-save', (event, arg) => {
  console.log('Music Select saved')
  store.set('musicdirselect', arg)
})

// Select Dir Launch and Save
ipcMain.on('default-dir-launch', (event, arg) => {
  console.log('Default Select launched!')
  event.sender.send('default-dir-launch-resp', store.get('defaultdirselect'))
})

ipcMain.on('default-dir-save', (event, arg) => {
  console.log('Defualt Select saved')
  store.set('defaultdirselect', arg)
})

// Checking for progress
ipcMain.on('progress', (event, arg) => {
  console.log(arg)
  event.sender.send('progress-resp', arg)
})

ipcMain.on('progress-done', (event, arg) => {
  console.log(arg)
  event.sender.send('progress-done-resp', 'Process done received')
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // Create the browser window.
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '/../build/index.html'),
    protocol: 'file:',
    slashes: true
  });
  mainWindow.loadURL(startUrl)

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
