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
    saveExcelFile: (
      fileBuffer: ArrayBuffer,
      fileName: string,
      folderPath: string
    ) => Promise<{
      success: boolean;
      path?: string;
      error?: string;
    }>;
  }

  interface Window {
    electronAPI?: ElectronAPI;
  }

  // allow importing as module
  namespace NodeJS {
    interface Global {}
  }
}
