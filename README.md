This is the simplest possible implementation of an app using the ow-electron library. It listens for all events and info updates and logs them.

Logs appear in the console and are recorded in a text file. The name of the log file is in th first log line to the console.

## Setup

Before running for the first time, execute the following command:

```bash
npm install
```

## Run

To run the app, execute the following command.

```bash
npm start
```

The "start" script in packages.json includes the command line switch to use the qa/development build of the game events package (gep). If you would like to see the results from the production version, use the "start:noqa" script.
