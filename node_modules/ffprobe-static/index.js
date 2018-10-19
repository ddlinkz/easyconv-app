//
// With credits to https://github.com/eugeneware/ffmpeg-static
//

// Modified ffmpeg-static
// Returns correct OS and Architecture
// Removed process.exit(1)

// os now asks for window.require
var os = window.require('os');
var path = require('path');

// Platform and arch are strings now
var platform = os.platform + ''
if (platform !== 'darwin' && platform !=='linux' && platform !== 'win32') {
  console.error('Unsupported platform.');
}

var arch = os.arch + ''
if (platform === 'darwin' && arch !== 'x64') {
  console.error('Unsupported architecture.');
}

var ffprobePath = path.join(
  'node_modules',
  'ffprobe-static',
  'bin',
  platform,
  arch,
  platform === 'win32' ? 'ffprobe.exe' : 'ffprobe'
);

exports.path = ffprobePath;
