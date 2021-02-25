const { ipcMain } = require("electron");
const electron = require("electron");
const { app, BrowserWindow, Tray, Menu, Notification, BrowserView } = electron;

let win;
let tray;
let notification;
let WIDTH = 400;
let HEIGHT = 600;
let visible = true;

app.on("ready", () => {
  if (process.platform == "darwin") {
    app.dock.hide();
  }
  win = new BrowserWindow({
    height: HEIGHT,
    width: WIDTH,
    webPreferences: {
      nodeIntegration: true,
    },
    resizable: false,
    frame: false,
    skipTaskbar: true,
  });
  win.removeMenu();
  win.loadFile("index.html");
  win.hide();
  win.webContents.openDevTools();

  tray = new Tray("icon5.png");
  tray.setToolTip("Musix");

  // tray.on("click", (event, bounds) => {
  //   let { x, y } = bounds;
  //   let { width, height } = win.getBounds();
  //   if (win.isVisible()) {
  //     win.hide();
  //   } else {
  //     if (process.platform != "darwin") {
  //       y = y - height;
  //     }
  //     win.setBounds({
  //       x: x - width / 2,
  //       y,
  //       width,
  //       height,
  //     });
  //     win.show();
  //   }
  // });
  // const view = new BrowserView();
  // win.setBrowserView(view);
  tray.on("click", (event, bounds) => {
    // console.log(visible);
    // let { width, height } = win.getBounds();
    // let { width, height } = win.workAreaSize;

    // win.on("blur", () => {
    //   visible = false;
    //   console.log("blur");
    // });
    // if (!win.isVisible()) visible = false;
    if (win.isVisible()) {
      win.hide();
    } else {
      visible = true;
      let { x, y } = bounds;
      if (process.platform != "darwin") {
        y = y - HEIGHT;
      }
      // console.log(WIDTH + " " + HEIGHT);
      win.setBounds({
        x: x - WIDTH / 2,
        y: y,
        width: WIDTH,
        height: HEIGHT,
      });
      // console.log(electron.screen.getPrimaryDisplay().workAreaSize);
      win.show();
    }
  });

  tray.on("right-click", () => {
    let template = [{ role: "quit" }];
    const menu = Menu.buildFromTemplate(template);
    tray.popUpContextMenu(menu);
  });

  win.on("blur", () => {
    win.hide();
    // console.log("blur");
    visible = false;
  });
  //   win.webContents.openDevTools();
});

ipcMain.on("playing", (event, song) => {
  if (Notification.isSupported()) {
    notification = new Notification({
      title: "Now Playing",
      body: song,
      silent: true,
    });
    // console.log("noti");
    notification.show();
  }
});

ipcMain.on("selecting music", (event, data) => {
  // console.log("selecting msic");
  win.show();
});
