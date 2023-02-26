const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  // progress: ipcRenderer.invoke('ping'),
  
  on: (channel, callback) => ipcRenderer.on(channel, (event, argv)=>callback(event, argv))
});