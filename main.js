//const { app, BrowserWindow } = require('@overwolf/ow-electron');

const { app, BrowserWindow } = require('electron');

console.log('hello world!');

let mainWindow;

app.on('ready', function () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Load index.html into the mainWindow
  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(() => {
  const appID = process.env.OVERWOLF_APP_UID;
  console.log(`AppID: ${appID}`);
});

console.log(`app.overwolf: ${app.overwolf}`);

app.overwolf.packages.on('ready', (event, packageName, version) => {
  console.log(
    `app.overwolf.packages.on: event: ${JSON.stringify(
      event
    )}, packageName: ${packageName}, version: ${version}`
  );
});
