const { contextBridge } = require('electron');

// Main process passes the server URL via additionalArguments:
//   webPreferences: { additionalArguments: ['--kiosk-server-url=http://192.168.1.10:5000'] }
const arg = process.argv.find((a) => a.startsWith('--kiosk-server-url='));
const serverUrl = arg ? arg.slice('--kiosk-server-url='.length) : 'http://localhost:5000';

contextBridge.exposeInMainWorld('kioskConfig', {
  serverUrl,
});
