export {};

declare global {
  interface HotspotCreds {
    ssid: string;
    password: string;
  }

  interface ElectronAPI {
    createHotspotSession: (data: unknown) => Promise<unknown>;
    updateHotspotSession?: (cb: (data: unknown) => void) => Promise<unknown>;
    onHotspotCredentials: (cb: (creds: HotspotCreds) => void) => () => void;
  }

  interface Window {
    electronAPI?: ElectronAPI;
  }

  // allow importing as module
  namespace NodeJS {
    interface Global {}
  }
}
