// ElectronIntervalSystem/preload.js
const { contextBridge, ipcRenderer } = require('electron');
const { randomUUID } = require('crypto');

const callbackRegistry = new Map();

function useElectronIntervalsPreload() {
	contextBridge.exposeInMainWorld('setElectronInterval', (callback, rate) => {
		const uuid = randomUUID();
		ipcRenderer.invoke('eis:set-interval', { rate, uuid });
		callbackRegistry.set(uuid, callback);
		return uuid;
	});

	contextBridge.exposeInMainWorld('clearElectronInterval', (uuid) => {
		ipcRenderer.invoke('eis:clear-interval', uuid);
		callbackRegistry.delete(uuid);
	});

	ipcRenderer.on('eis:tick', (_, uuid) => {
		const cb = callbackRegistry.get(uuid);
		if (cb) cb();
	});
}

useElectronIntervalsPreload();

module.exports = { useElectronIntervalsPreload };
