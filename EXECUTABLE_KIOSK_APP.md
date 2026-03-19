# Attendance Kiosk - Executable Application

## ✅ What's Ready

Your **Attendance System UI** is now packaged as a standalone **Windows executable** for kiosk deployment:

- **Installer File**: `release/Attendance Kiosk Setup 0.0.1.exe`
- **App Name**: Attendance Kiosk
- **Platform**: Windows 64-bit
- **Size**: ~350 MB (includes bundled Electron runtime)

---

## 📦 Installation

1. **Run the installer**:
   - Double-click `release/Attendance Kiosk Setup 0.0.1.exe`
   - Follow the setup wizard to install

2. **Launch the app**:
   - Desktop shortcut will be created automatically
   - Or find "Attendance Kiosk" in Start Menu

---

## 🎨 UI Improvements Made

✓ **Compressed Layout** - Reduced excess padding/spacing:
  - Header: Smaller logo (h-16 instead of h-20) and tighter layout
  - Padding: px-6 & py-4 instead of px-8 & py-6 throughout
  - Buttons: py-4 text-xl instead of py-6 text-2xl (more efficient)
  
✓ **Better Visual Design**:
  - Gradient background (white to slate-50) for subtle depth
  - Modern color scheme maintained (green #32AD32)
  - Responsive layout (flex-col on mobile, grid on desktop for onsite form)
  - Cleaner reminder banner (smaller text, tighter spacing)

✓ **Optimized for Kiosk**:
  - Fixed window size (1100x760) for consistent kiosk displays
  - No menu bar visible
  - Auto-hide on startup for full-screen kiosk mode

---

## 🔧 Build & Development

### Run in Development Mode
```bash
npm run electron:dev
```
This starts a local dev server and opens the Electron window with hot reload.

### Build for Production
```bash
npm run electron:build
```
This creates the Windows installer in the `release/` folder.

### Build Web Version Only
```bash
npm run build
```
Generates the web files in `dist/` folder (for web deployment).

---

## 📝 Features Implemented

1. **Clock In / Clock Out**
   - Tap employee ID → automatic clock in
   - Tap same ID again → automatic clock out

2. **Time Format Validation**
   - Onsite service times must be in `HH:MM AM/PM` format
   - System rejects invalid formats with an alert

3. **Responsive & Kiosk-Optimized**
   - Compressed UI to maximize usable space
   - Large touch-friendly buttons
   - Clear visual feedback on interactions

---

## 📂 Project Structure

```
├── electron/
│   └── main.js              # Electron app entry point
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── KioskHome.tsx  # Main kiosk UI
│   │   ├── data/
│   │   │   └── mockData.ts    # Attendance logic & storage
│   │   └── routes.tsx
│   ├── assets/
│   │   └── logo.png
│   ├── styles/
│   │   └── index.css
│   └── main.tsx
├── scripts/
│   └── generate-icon.js     # Icon generation script
├── package.json             # Electron & build config
└── release/
    └── Attendance Kiosk Setup 0.0.1.exe  # ✅ Final installer
```

---

## 🖥️ Kiosk Deployment Tips

1. **Fullscreen Mode**: Edit `electron/main.js` to add:
   ```javascript
   mainWindow.webContents.enterFullScreenHtml5Video = true;
   // Or use mainWindow.maximize() or mainWindow.setFullScreen(true)
   ```

2. **Auto-Start on Boot**: Add shortcut to Windows Startup folder
   ```
   C:\Users\[Username]\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
   ```

3. **No Exit on Close**: Add to `electron/main.js` if you want to prevent closing:
   ```javascript
   mainWindow.webContents.on('before-quit', (e) => e.preventDefault());
   ```

---

## 📝 Notes

- **Storage**: Attendance records are stored in browser's `localStorage`
- **Demo Data**: 5 sample employees (EMP001-EMP005) are pre-loaded
- **Customizable**: All colors, sizes, and features can be modified in the source code

---

## ✨ Next Steps

1. **Deploy to Kiosk**: Copy the installer to the kiosk device and run it
2. **Configure fullscreen** if needed (see tips above)
3. **Test QR/RFID scanner** - it sends keyboard input as you scan
4. **Backup data**: Periodic exports of localStorage would be recommended for production

---

**Ready to deploy!** 🚀
