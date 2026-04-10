import { Tray, BrowserWindow, screen, nativeImage, Menu, app, ipcMain } from "electron";
import path from "node:path";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

const TRIGGER_WIDTH = 200; // largeur ~notch
const TRIGGER_HEIGHT = 38; // couvre toute la hauteur du notch
const PILL_WIDTH = 400;
const PILL_HEIGHT = 700;

export class TrayManager {
  private tray: Tray;
  private triggerWindow: BrowserWindow | null = null; // zone hover invisible
  private pillWindow: BrowserWindow | null = null;    // popup avec les infos
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const icon = nativeImage.createEmpty();
    this.tray = new Tray(icon);
    this.tray.setTitle("");
    this.tray.on("right-click", () => this.showContextMenu());

    this.createTriggerWindow();
    this.createPillWindow();
    this.setupIpc();
  }

  updateTitle(_title: string): void {}

  sendToRenderer(channel: string, data: unknown): void {
    this.pillWindow?.webContents.send(channel, data);
  }

  /** Zone invisible DANS le notch qui reagit au survol */
  private createTriggerWindow(): void {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth } = primaryDisplay.size;
    const triggerX = Math.round(screenWidth / 2 - TRIGGER_WIDTH / 2);

    this.triggerWindow = new BrowserWindow({
      width: TRIGGER_WIDTH,
      height: TRIGGER_HEIGHT,
      show: false,
      frame: false,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      skipTaskbar: true,
      transparent: true,
      hasShadow: false,
      focusable: false,
      webPreferences: { contextIsolation: true, nodeIntegration: false },
    });

    // Niveau screen-saver = au-dessus de TOUT, y compris la menu bar
    this.triggerWindow.setAlwaysOnTop(true, "screen-saver");
    this.triggerWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
    });
    this.triggerWindow.setIgnoreMouseEvents(false);

    // Charge un HTML minimal qui detecte le hover
    this.triggerWindow.loadURL(
      `data:text/html,<style>*{margin:0;padding:0}body{background:transparent;-webkit-app-region:no-drag}</style>
       <body onmouseenter="document.title='hover'" onmouseleave="document.title='leave'"></body>`
    );

    this.triggerWindow.on("page-title-updated", (_e, title) => {
      if (title === "hover") this.showPill();
      if (title === "leave") this.scheduleHide();
    });

    this.triggerWindow.once("ready-to-show", () => {
      // Forcer la position APRES le setAlwaysOnTop pour bypasser le clamp macOS
      this.triggerWindow?.setBounds({
        x: triggerX,
        y: 0,
        width: TRIGGER_WIDTH,
        height: TRIGGER_HEIGHT,
      });
      this.triggerWindow?.show();
      // Re-forcer apres show au cas ou macOS recale
      this.triggerWindow?.setPosition(triggerX, 0);
    });
  }

  /** Fenetre popup avec les infos du train */
  private createPillWindow(): void {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth } = primaryDisplay.size;
    const menuBarHeight = primaryDisplay.workArea.y;

    this.pillWindow = new BrowserWindow({
      width: PILL_WIDTH,
      height: PILL_HEIGHT,
      x: Math.round(screenWidth / 2 - PILL_WIDTH / 2),
      y: menuBarHeight,
      show: false,
      frame: false,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      skipTaskbar: true,
      transparent: true,
      hasShadow: true,
      focusable: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    this.pillWindow.setAlwaysOnTop(true, "pop-up-menu");
    this.pillWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
    });

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      this.pillWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      this.pillWindow.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
      );
    }
  }

  private setupIpc(): void {
    // Le renderer signale que la souris est dans la pill
    ipcMain.on("pill:mouseenter", () => this.cancelHide());
    ipcMain.on("pill:mouseleave", () => this.scheduleHide());
  }

  private showPill(): void {
    this.cancelHide();
    if (!this.pillWindow) return;

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth } = primaryDisplay.size;
    const menuBarHeight = primaryDisplay.workArea.y;

    this.pillWindow.setBounds({
      x: Math.round(screenWidth / 2 - PILL_WIDTH / 2),
      y: menuBarHeight,
      width: PILL_WIDTH,
      height: PILL_HEIGHT,
    });
    this.pillWindow.showInactive();
  }

  private scheduleHide(): void {
    this.cancelHide();
    this.hideTimeout = setTimeout(() => {
      this.pillWindow?.hide();
    }, 300); // petit delai pour permettre de bouger vers la pill
  }

  private cancelHide(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  private getNotchPosition() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth } = primaryDisplay.size;
    const menuBarHeight = primaryDisplay.workArea.y;
    return {
      x: Math.round(screenWidth / 2 - TRIGGER_WIDTH / 2),
      y: 0, // dans la menu bar / notch
    };
  }

  private showContextMenu(): void {
    const menu = Menu.buildFromTemplate([
      {
        label: "Rafraîchir",
        click: () => {
          this.pillWindow?.webContents.send("train:refresh");
        },
      },
      { type: "separator" },
      { label: "Quitter", click: () => app.quit() },
    ]);
    this.tray.popUpContextMenu(menu);
  }

  hideMenu(): void {
    this.pillWindow?.hide();
  }
}
