const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const logFileName = `my_ow_electron_${uuidv4()}.log`;
const logFilePath = path.join(os.tmpdir(), logFileName);
const logFileStream = fs.createWriteStream(logFilePath, { flags: 'a' });
console.log(`Log file: ${logFilePath}`);

const formatLogMessage = (args) => args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ') + '\n';

const originalLog = console.log;
console.log = (...args) => {
  const message = formatLogMessage(args);
  originalLog.apply(console, args);
  logFileStream.write(message);
};

const originalError = console.error;
console.error = (...args) => {
  const message = formatLogMessage(args);
  originalError.apply(console, args);
  logFileStream.write(message);
};

let mainWindow;

app.on('ready', function () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

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

const setRequiredFeatures = async (id) => {
  console.log(`setRequiredFeatures(${id})`);
  
  const info = await app.overwolf.packages.gep.getInfo(id);
  console.log(`info: ${JSON.stringify(info)}`);

  const getFeaturesResult = await app.overwolf.packages.gep.getFeatures(id);
  console.log(`features: ${JSON.stringify(getFeaturesResult)}`);

  const features = null;
  const res = await app.overwolf.packages.gep.setRequiredFeatures(id, features);
  console.log(`app.overwolf.packages.gep.setRequiredFeatures(${id}, ${features}) done (${res})`);

};



const setupGEP = async () => {
  const supportedGames = await app.overwolf.packages.gep.getSupportedGames();
  console.log(`app.overwolf.packages.gep.getSupportedGames() returned: ${JSON.stringify(supportedGames)}`);

  app.overwolf.packages.gep.on('error', (event, gameId, error, ...args) => {
    console.error(
      `app.overwolf.packages.gep.on: 'error', error: ${error}, args: ${JSON.stringify(
        args
      )}`
    );
  });

  app.overwolf.packages.gep.on('game-info-updated', (event, ...args) => {
    console.error(
      `app.overwolf.packages.gep.on: 'game-info-updated': args: ${JSON.stringify(
        args
      )}`
    );
  });

  app.overwolf.packages.gep.on(
    'game-detected',
    (event, gameId, name, ...args) => {
      console.log(
        `app.overwolf.packages.gep.on: 'game-detected', gameId: ${gameId}, name: ${name}, args: ${JSON.stringify(
          args
        )}`
      );
      event.enable();
      setTimeout(() => {
        setRequiredFeatures(gameId);
      }, 3000);
    }
  );
  const deepParse =  (input) => {
    if (typeof input === "string") {
        try {
            input = JSON.parse(input);
        } catch (e) {
            return input;
        }
    }
    if (Array.isArray(input)) {
        return input.map(deepParse);
    }
    if (input !== null && typeof input === "object") {
        for (const key in input) {
            if (input.hasOwnProperty(key)) {
                input[key] = deepParse(input[key]);
            }
        }
    }
    return input;
  }

  const log_it = (in_category, in_key, in_value) => {
    const parsed = deepParse(in_value);
    const key = (in_category === in_key) ? in_key : `${in_category}.${in_key}`;
    const value = (typeof parsed === 'object' && parsed !== null) ? JSON.stringify(parsed) : (typeof parsed === 'string' ? `"${parsed}"` : parsed);
    const line = `{"key":"${key}", "value":${value}},`;
    console.log(line);
  }

  app.overwolf.packages.gep.on('new-info-update', (event, gameId, data) => {
    const { category, key, value } = data;
    log_it(category, key, value);
  });

  app.overwolf.packages.gep.on('new-game-event', (event, gameId, data) => {
    const { category, key, value } = data;
    log_it(category, key, value); 
  });
};

const setupCMP = async () => {
  const isCMPRequired = await app.overwolf.isCMPRequired();
  console.log(`isCMPRequired: ${isCMPRequired}`);
  if (isCMPRequired) {
    await app.overwolf.openCMPWindow();
  }
};

const setupOverwolf = async () => {
  await setupCMP();

  app.overwolf.packages.on('package-update-pending', (event, info) => {
    console.log(
      `app.overwolf.packages.on: 'package-update-pending', info: ${JSON.stringify(
        info
      )}`
    );
  });

  app.overwolf.packages.on('updated', (event, packageName, version) => {
    console.log(
      `app.overwolf.packages.on: 'updated', packageName: ${packageName}, version: ${version}`
    );
  });

  app.overwolf.packages.on('failed-to-initialize', (event, packageName) => {
    console.log(
      `app.overwolf.packages.on: 'failed-to-initialize', packageName: ${packageName}`
    );
  });

  app.overwolf.packages.on('ready', (event, packageName, version) => {
    console.log(
      `app.overwolf.packages.on: 'ready', packageName: ${packageName}, version: ${version}`
    );
    if (packageName === 'gep') {
      setupGEP();
    }
  });
  console.log('setupOverwolf done');
};

app.whenReady().then(() => {
  const appID = process.env.OVERWOLF_APP_UID;
  console.log(`AppID: ${appID}`);
  setupOverwolf();
});
