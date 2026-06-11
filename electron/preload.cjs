const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  setAlwaysOnTop: (enabled) => ipcRenderer.invoke('window:set-always-on-top', enabled),
  setTodoCompact: (enabled) => ipcRenderer.invoke('window:set-todo-compact', enabled),
  setCalendarCollapsed: (enabled) => ipcRenderer.invoke('window:set-calendar-collapsed', enabled),
})
