var app = require('app')
var BrowserWindow = require('browser-window')

app.on('ready', function(){
    var mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        center: true,
        fullscreen: true,
        title: 'Borderguns 0.0.1',
        frame: false

    })
    mainWindow.loadUrl('file://' + __dirname + './index.html')
    // mainWindow.openDevTools()
})

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit()
})
