import { attendanceRecord } from "@/types";
import { ipcRenderer, contextBridge } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  // You can expose other APTs you need here.
  // Accept a data string and optional callback; send it to main and call callback with the data.
});

contextBridge.exposeInMainWorld("electronAPI", {
  createHotspotSession: (data: attendanceRecord) =>
    ipcRenderer.invoke("createSession", data),
  updateHotspotSession: (callback: (data: attendanceRecord) => void) =>
    ipcRenderer.invoke("updateSession", (data: attendanceRecord) =>
      callback(data)
    ),
  // Dedicated listener for hotspot credentials pushed from main process
  onHotspotCredentials: (
    callback: (creds: { ssid: string; password: string }) => void
  ) => {
    const channel = "hotspot-credentials";
    const listener = (
      _event: Electron.IpcRendererEvent,
      data: { ssid: string; password: string }
    ) => callback(data);

    ipcRenderer.on(channel, listener);

    // Return an unsubscribe function
    return () => ipcRenderer.off(channel, listener);
  },
});
