const { app, BrowserWindow, globalShortcut } = require("electron");
const readline = require('readline');
const unzipper = require('unzipper');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 250,
    resizable: false,
    closable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.setMenuBarVisibility(false);

  win.loadFile("index.html");

  
  // 解凍するファイル
  const zipFile = 'assets/thinkerAI.zip';
  // 解凍先のディレクトリ
  const destDir = './unzipped';
  // 解凍するファイルのサイズを取得
  const fileSize = fs.statSync(zipFile).size;

  // 解凍開始時刻を取得
  const startTime = Date.now();

  // 解凍処理の進捗状況を取得するためのストリーム
  const readStream = fs.createReadStream(zipFile);
  const unzipStream = readStream.pipe(unzipper.Extract({
    path: destDir
  }));

  // 解凍処理の進捗状況を計算し、表示する関数
  const displayTime = (progress) => {
    // 現在の時間を取得
    const currentTime = Date.now();

    // 経過時間を計算
    const elapsedTime = (currentTime - startTime) / 1000;

    // 残り時間を計算
    const remainingTime = (elapsedTime / (progress / 100)) * (100 - progress);

    // 残り時間を分と秒に変換
    const remainingMinutes = Math.floor(remainingTime / 60);
    const remainingSeconds = Math.floor(remainingTime % 60);

    // 残り時間を表示
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`進捗：${progress}% 残り時間：${remainingMinutes}分${remainingSeconds}秒`);
    win.webContents.send('progress', {
      progress,
      remainingMinutes,
      remainingSeconds
    });
  };

  // 解凍処理の進捗状況が更新されたときに呼び出されるコールバック関数
  unzipStream.on('entry', (entry) => {
    const progress = (entry.vars.offset / fileSize) * 100;
    displayTime(progress);
    win.webContents.send('changeProcessStatus', 'Downloading...')
  });

  // 解凍完了時に呼び出されるコールバック関数
  unzipStream.on('close', () => {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    console.log('解凍が完了しました。');

    win.webContents.send('progress', {
      progress: 100,
      remainingMinutes: 0,
      remainingSeconds: 0
    });
  });

  // 解凍処理中にエラーが発生したときに呼び出されるコールバック関数
  unzipStream.on('error', (error) => {
    console.error(error);
  });
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