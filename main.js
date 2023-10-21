const { app, BrowserWindow } = require('electron');

let mainWindow;

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Load index.html into the mainWindow
    mainWindow.loadFile('index.html');

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
