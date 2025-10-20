"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(
      channel,
      (event, ...args2) => listener(event, ...args2)
    );
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // Accept a data string and optional callback; send it to main and call callback with the data.
});
electron.contextBridge.exposeInMainWorld("electronAPI", {
  createHotspotSession: (data) => electron.ipcRenderer.invoke("createSession", data),
  updateHotspotSession: (callback) => electron.ipcRenderer.invoke(
    "updateSession",
    (data) => callback(data)
  ),
  // Dedicated listener for hotspot credentials pushed from main process
  onHotspotCredentials: (callback) => {
    const channel = "hotspot-credentials";
    const listener = (_event, data) => callback(data);
    electron.ipcRenderer.on(channel, listener);
    return () => electron.ipcRenderer.off(channel, listener);
  }
});
