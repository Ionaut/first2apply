import { Tray, Menu, nativeImage } from "electron";
import path from "path";
import { Logger } from "pino";

export class TrayMenu {
  private _logger: Logger;
  private _tray: Tray;
  private _iconPathMacOs = "/images/trayIconTemplate.png";
  private _iconPathWin = "/images/trayIcon.ico";

  constructor({
    logger,
    onQuit,
    onNavigate,
  }: {
    logger: Logger;
    onQuit: () => void;
    onNavigate: (_: { path: string }) => void;
  }) {
    this._logger = logger;
    const iconName =
      process.platform === "win32" ? this._iconPathWin : this._iconPathMacOs;
    const iconPath = path.join(__dirname, iconName);
    const image = nativeImage.createFromPath(iconPath);
    if (process.platform === "darwin") {
      image.setTemplateImage(true);
    }

    this._tray = new Tray(image);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Jobs",
        type: "normal",
        click: () => {
          onNavigate({ path: "/?status=new" });
        },
      },
      {
        label: "Sites",
        type: "normal",
        click: () => {
          onNavigate({ path: "/links" });
        },
      },
      {
        label: "Settings",
        type: "normal",
        click: () => {
          onNavigate({ path: "/settings" });
        },
      },
      { type: "separator" },
      {
        label: "Quit",
        type: "normal",
        click: () => onQuit(),
      },
    ]);

    this._tray.setContextMenu(contextMenu);
    this._tray.setToolTip("First2Apply");
    if (process.platform === "win32") {
      this._tray.on("click", () => {
        this._tray.popUpContextMenu();
      });
    }
    this._logger.info("Tray menu initialized");
  }

  /**
   * Destroy the tray menu.
   */
  close() {
    this._tray.destroy();
  }
}
