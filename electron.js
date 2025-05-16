const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let mainWindow;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: path.join(__dirname, 'build/favicon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // 加载应用的index.html
  const startUrl = url.format({
    pathname: path.join(__dirname, 'build/index.html'),
    protocol: 'file:',
    slashes: true
  });
  
  mainWindow.loadURL(startUrl);

  // 当window被关闭时，触发下面的事件
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // 隐藏菜单栏
  mainWindow.setMenu(null);
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.on('ready', createWindow);

// 所有窗口关闭时退出应用
app.on('window-all-closed', function () {
  // 在macOS上，通常用户在显式地使用Cmd + Q关闭应用之前
  // 应用和它们的菜单栏会保持激活状态
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // 在macOS上，当点击dock图标并且没有其他窗口打开时，
  // 通常会在应用程序中重新创建一个窗口
  if (mainWindow === null) {
    createWindow();
  }
}); 