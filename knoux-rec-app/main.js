const { app, BrowserWindow, Menu, dialog, shell } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
    },
    titleBarStyle: "default",
    show: false,
  });

  mainWindow.loadFile("index.html");

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    // عرض شاشة ترحيب
    mainWindow.webContents.executeJavaScript(`
            setTimeout(() => {
                showNotification('مرحباً بك في KNOUX REC Desktop! 🚀', 'success');
            }, 1000);
        `);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // منع التنقل إلى روابط خارجية
  mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== "file://") {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // إعداد القائمة
  const template = [
    {
      label: "ملف",
      submenu: [
        {
          label: "مشروع جديد",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            mainWindow.webContents.executeJavaScript("createProject()");
          },
        },
        {
          label: "فتح المشاريع",
          accelerator: "CmdOrCtrl+O",
          click: () => {
            mainWindow.webContents.executeJavaScript("openProjects()");
          },
        },
        { type: "separator" },
        {
          label: "خروج",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "تسجيل",
      submenu: [
        {
          label: "بدء التسجيل",
          accelerator: "F9",
          click: () => {
            mainWindow.webContents.executeJavaScript("startRecording()");
          },
        },
        {
          label: "إيقاف التسجيل",
          accelerator: "F10",
          click: () => {
            mainWindow.webContents.executeJavaScript("stopRecording()");
          },
        },
        {
          label: "لقطة شاشة",
          accelerator: "F12",
          click: () => {
            mainWindow.webContents.executeJavaScript("takeScreenshot()");
          },
        },
      ],
    },
    {
      label: "أدوات",
      submenu: [
        {
          label: "قوالب الفيديو",
          click: () => {
            mainWindow.webContents.executeJavaScript("openTemplates()");
          },
        },
        {
          label: "أدوات الصوت",
          click: () => {
            mainWindow.webContents.executeJavaScript("openAudioTools()");
          },
        },
        {
          label: "التأثيرات",
          click: () => {
            mainWindow.webContents.executeJavaScript("openEffects()");
          },
        },
        {
          label: "الذكاء الاصطناعي",
          click: () => {
            mainWindow.webContents.executeJavaScript("openAI()");
          },
        },
      ],
    },
    {
      label: "مساعدة",
      submenu: [
        {
          label: "حول KNOUX REC",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "حول KNOUX REC",
              message: "KNOUX REC - Professional Screen Recorder",
              detail:
                "مسجل الشاشة الاحترافي مع الذكاء الاصطناعي\\n\\nالإصدار: 1.0.0\\n��طور بواسطة: KNOUX Team\\n\\n© 2024 جميع الحقوق محفوظة",
            });
          },
        },
        {
          label: "اختصارات لوحة المفاتيح",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "اختصارات لوحة المفاتيح",
              message: "الاختصارات المتاحة:",
              detail:
                "F9 - بدء/إيقاف التسجيل\\nF10 - إيقاف التسجيل\\nF12 - لقطة شاشة\\nCtrl+N - مشروع جديد\\nCtrl+O - فتح المشاريع\\nCtrl+Q - خروج",
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// منع أخطاء الشهادات في التطوير
app.commandLine.appendSwitch("ignore-certificate-errors");
app.commandLine.appendSwitch("disable-web-security");
