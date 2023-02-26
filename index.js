const { app, BrowserWindow, globalShortcut } = require("electron");
const Installer = require("./lib/install");

const installer = new Installer("Mf-3d", "Flune-Browser");


function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 250,
    resizable: false,
    closable: false,
    webPreferences: {
      nodeIntegration: true,
      preload: `${__dirname}/preload/preload.js`
    }
  });

  win.setMenuBarVisibility(false);

  win.loadFile(`${__dirname}/renderer/index.html`);

  installer.downloadLatest(null, 2);
}

app.whenReady().then(createWindow);

app.on('browser-window-focus', function () {
  globalShortcut.register("CommandOrControl+R", () => {
    console.log("CommandOrControl+R is pressed: Shortcut Disabled");
  });
  globalShortcut.register("F5", () => {
    console.log("F5 is pressed: Shortcut Disabled");
  });
});

app.on('browser-window-blur', function () {
  globalShortcut.unregister('CommandOrControl+R');
  globalShortcut.unregister('F5');
});