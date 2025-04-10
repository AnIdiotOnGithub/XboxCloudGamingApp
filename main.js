const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

const COOKIE_STORE = path.join(app.getPath('userData'), 'cookies.json');

async function saveCookies(sess) {
  const cookies = await sess.cookies.get({});
  fs.writeFileSync(COOKIE_STORE, JSON.stringify(cookies, null, 2));
}

async function loadCookies(sess) {
  if (!fs.existsSync(COOKIE_STORE)) return;

  const cookies = JSON.parse(fs.readFileSync(COOKIE_STORE));
  for (const cookie of cookies) {
 
    if (cookie.expirationDate && cookie.expirationDate < Date.now() / 1000) continue;
    try {
      await sess.cookies.set(cookie);
    } catch (err) {
      console.error('Failed to set cookie:', err);
    }
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const sess = win.webContents.session;

  loadCookies(sess).then(() => {
    win.loadURL('https://www.xbox.com/en-US/play');
  });

  win.on('close', async () => {
    await saveCookies(sess);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
