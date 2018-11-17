EasyConv
========

![EasyConv](screencap1.png "preview")

Drag and drop flac-to-mp3 conversion app built using Electron and React.

In the project directory, run

`npm install`

then head over to node_modules/ffmpeg-static-electron-react.

Create a directory called build, then copy this index.sh script.
Grant permission to use the script, then in the previous directory, run
the build script.

`cd node_modules/ffmpeg-static-electron-react`
`mkdir build`
`vim index.sh`
`cd ..`
`npm run-script build`

to install the ffmpeg binaries.

`npm start`

There are two modes for conversion. 

## Default

The Default mode will place the files directly in the folder you specify. 

## Music
The Music mode will ask for the directory that you store music in. By providing the artist name and the album title, EasyConv will create folders (music/artist/album) if they do not exist and place the files there for storage. This is based on the assumption that you organize your music by Artist/Album.
