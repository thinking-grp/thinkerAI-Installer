"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const https_1 = __importDefault(require("https"));
const node_fs_1 = __importDefault(require("node:fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
class Installer {
    constructor(owner, repo) {
        this.owner = owner;
        this.repo = repo;
    }
    downloadLatest(updateDir = path_1.default.join(__dirname, 'app-update'), downloadAsset) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `https://api.github.com/repos/${this.owner}/${this.repo}/releases/latest`;
            https_1.default.get(url, {
                headers: { 'User-Agent': 'Node.js' },
            }, (res) => {
                let body = "";
                res.on('data', (chunk) => {
                    body += chunk;
                });
                res.on('end', () => {
                    const data = JSON.parse(body);
                    const version = data.tag_name;
                    console.log(`Updating to version ${version}...`);
                    // アップデートファイルをダウンロードして適用
                    const downloadUrl = data.assets[downloadAsset].browser_download_url;
                    const downloadDir = path_1.default.join(__dirname, 'update');
                    const downloadFile = path_1.default.join(downloadDir, 'update.zip');
                    if (!node_fs_1.default.existsSync(downloadDir)) {
                        node_fs_1.default.mkdirSync(downloadDir);
                    }
                    const file = node_fs_1.default.createWriteStream(downloadFile);
                    https_1.default.request(downloadUrl, {
                        method: 'GET',
                        rejectUnauthorized: false,
                        headers: { 'User-Agent': 'Node.js' },
                        agent: new https_1.default.Agent({
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
                            const updateFile = path_1.default.join(downloadDir, 'update.zip');
                            (0, child_process_1.exec)(`${unzipCommand} "${updateFile}" ${process.platform === 'win32' ? "-DestinationPath" : "-d"} "${updateDir}"`, (err) => {
                                if (err)
                                    throw err;
                                console.log(data.assets[downloadAsset]);
                                console.log('Update applied');
                            });
                        });
                    });
                });
            }).on('error', (err) => {
                console.error(err);
            });
        });
    }
    downloadWithTag(updateDir = path_1.default.join(__dirname, 'app-update'), tagName, downloadAsset) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `https://api.github.com/repos/${this.owner}/${this.repo}/releases/tags/${tagName}`;
            https_1.default.get(url, {
                headers: { 'User-Agent': 'Node.js' },
            }, (res) => {
                let body = "";
                res.on('data', (chunk) => {
                    body += chunk;
                });
                res.on('end', () => {
                    const data = JSON.parse(body);
                    const version = data.tag_name;
                    console.log(`Updating to version ${version}...`);
                    // アップデートファイルをダウンロードして適用
                    const downloadUrl = data.assets[downloadAsset].browser_download_url;
                    const downloadDir = path_1.default.join(__dirname, 'update');
                    const downloadFile = path_1.default.join(downloadDir, 'update.zip');
                    if (!node_fs_1.default.existsSync(downloadDir)) {
                        node_fs_1.default.mkdirSync(downloadDir);
                    }
                    const file = node_fs_1.default.createWriteStream(downloadFile);
                    https_1.default.get(downloadUrl, {
                        method: 'GET',
                        rejectUnauthorized: false,
                        headers: { 'User-Agent': 'Node.js' },
                        agent: new https_1.default.Agent({
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
                            const updateFile = path_1.default.join(downloadDir, 'update.zip');
                            (0, child_process_1.exec)(`${unzipCommand} "${updateFile}" ${process.platform === "win32" ? "-DestinationPath" : "-d"} "${updateDir}"`, (err) => {
                                if (err)
                                    throw err;
                                console.log('Update applied');
                            });
                        });
                    });
                });
            }).on('error', (err) => {
                console.error(err);
            });
        });
    }
    setupEnvironment(scriptDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const scriptPath = path_1.default.join(scriptDir, `setup-${process.platform}.${process.platform === "win32" ? "bat" : "sh"}`);
            if (node_fs_1.default.existsSync(scriptPath)) {
                const setupCommand = `cd ${scriptDir} ${process.platform === "win32" ? "&" : "&&"} ${process.platform === "win32" ? scriptPath : `sh ${scriptPath}`}`;
                (0, child_process_1.exec)(setupCommand, (err) => {
                    if (err)
                        throw err;
                    console.log("Environment setup is complete.");
                    console.info("Setup Script Path:", scriptPath);
                });
            }
        });
    }
}
module.exports = Installer;
