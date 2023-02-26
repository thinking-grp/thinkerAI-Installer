import https from 'https';
import fs from 'node:fs';
import path from 'path';
import { exec } from 'child_process';

class Installer {
  owner: string;
  repo: string;

  constructor(owner: string, repo: string) {
    this.owner = owner;
    this.repo = repo;
  }

  async downloadLatest(updateDir: string = path.join(__dirname, 'app-update'), downloadAsset: number) {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/releases/latest`;

    https.get(url, {
      headers: { 'User-Agent': 'Node.js' },
    }, (res) => {
      let body: string = "";
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        const data = JSON.parse(body);
        const version = data.tag_name;

        console.log(`Updating to version ${version}...`);

        // アップデートファイルをダウンロードして適用
        const downloadUrl = data.assets[downloadAsset].browser_download_url;
        const downloadDir = path.join(__dirname, 'update');
        const downloadFile = path.join(downloadDir, 'update.zip');
        if (!fs.existsSync(downloadDir)) {
          fs.mkdirSync(downloadDir);
        }
        const file = fs.createWriteStream(downloadFile);
        https.request(downloadUrl, {
          method: 'GET',
          rejectUnauthorized: false,
          headers: { 'User-Agent': 'Node.js' },
          agent: new https.Agent({
            keepAlive: false
          }),
          timeout: 120000
        }, (res) => {
          res.pipe(file);

          file.on("error", (err) => {
            console.error(err);
          });

          res.on('end', () => {
            console.log('Download complete');
            const unzipCommand = process.platform === 'win32' ? 'powershell Expand-Archive' : 'unzip';

            const updateFile = path.join(downloadDir, 'update.zip');
            exec(`${unzipCommand} "${updateFile}" ${process.platform === 'win32' ? "-DestinationPath" : "-d"} "${updateDir}"`, (err) => {
              if (err) throw err;
              console.log(data.assets[downloadAsset]);
              console.log('Update applied');
            });
          });
        });
      });
    }).on('error', (err) => {
      console.error(err);
    });
  }

  async downloadWithTag (updateDir: string = path.join(__dirname, 'app-update'), tagName: string, downloadAsset: number) {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/releases/tags/${tagName}`;

    https.get(url, {
      headers: { 'User-Agent': 'Node.js' },
    }, (res) => {
      let body: string = "";
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        const data = JSON.parse(body);
        const version = data.tag_name;

        console.log(`Updating to version ${version}...`);

        // アップデートファイルをダウンロードして適用
        const downloadUrl = data.assets[downloadAsset].browser_download_url;
        const downloadDir = path.join(__dirname, 'update');
        const downloadFile = path.join(downloadDir, 'update.zip');
        if (!fs.existsSync(downloadDir)) {
          fs.mkdirSync(downloadDir);
        }
        const file = fs.createWriteStream(downloadFile);
        https.get(downloadUrl, {
          method: 'GET',
          rejectUnauthorized: false,
          headers: { 'User-Agent': 'Node.js' },
          agent: new https.Agent({
            keepAlive: false
          }),
          timeout: 120000
        }, (res) => {
          res.pipe(file);

          file.on("error", (err) => {
            console.error(err);
          });

          res.on('end', () => {
            console.log('Download complete');
            const unzipCommand = process.platform === 'win32' ? 'powershell Expand-Archive' : 'unzip';

            const updateFile = path.join(downloadDir, 'update.zip');
            exec(`${unzipCommand} "${updateFile}" ${process.platform === "win32" ? "-DestinationPath" : "-d"} "${updateDir}"`, (err) => {
              if (err) throw err;
              console.log('Update applied');
            });
          });
        });
      });
    }).on('error', (err) => {
      console.error(err);
    });
  }

  async setupEnvironment (scriptDir: string) {
    const scriptPath = path.join(scriptDir, `setup-${process.platform}.${process.platform === "win32" ? "bat" : "sh"}`);
    if (fs.existsSync(scriptPath)) {
      const setupCommand = `cd ${scriptDir} ${process.platform === "win32" ? "&" : "&&"} ${process.platform === "win32" ? scriptPath : `sh ${scriptPath}`}`;

      exec(setupCommand, (err) => {
        if (err) throw err;

        console.log("Environment setup is complete.");
        console.info("Setup Script Path:", scriptPath);
      });
    }
  }
}

export default Installer;