/*
	preload.js
	----------

	This file is to be included in the preload bridge in Electron,
	which will automatically set up the public methods in the renderer
	for setting/clearing intervals and timeouts.
*/

// vue
const { contextBridge, ipcRenderer } = require('electron');

// so we can give our intervals and timeouts unique ids
const { randomUUID } = require('crypto');

// register of callbacks for intervals and timeouts
const callbackRegistry = new Map();

// set up handler for setting timeouts
function useElectronIntervalsPreload() {

	// provide method for setting intervals via the electron node backend
	contextBridge.exposeInMainWorld('setElectronInterval', (callback, rate) => {

		// get a unique ID so this interval could potentially be cleared later
		const uuid = randomUUID();

		// use IPC to register the interval with the main process
		ipcRenderer.invoke('eis:set-interval', { rate, uuid });
		callbackRegistry.set(uuid, callback);
		return uuid;
	});

	
	// provide method for clearing intervals via the electron node backend
	contextBridge.exposeInMainWorld('clearElectronInterval', (uuid) => {

		// simply clear the interval with the main process
		ipcRenderer.invoke('eis:clear-interval', uuid);
		callbackRegistry.delete(uuid);
	});


	// forwards the tick of a interval to the assigned callback.
	ipcRenderer.on('eis:tick', (_, uuid) => {
		const callbackFn = callbackRegistry.get(uuid);
		if (callbackFn)
			callbackFn();
	});


	// provide method for setting timeout via the electron node backend
	contextBridge.exposeInMainWorld('setElectronTimeout', (callback, length) => {

		// get a unique ID so this timeout could potentially be cleared later
		const uuid = randomUUID();

		// use IPC to register the timeout with the main process
		ipcRenderer.invoke('eis:set-timeout', { rate: length, uuid });
		callbackRegistry.set(uuid, callback);
		return uuid;
	});

	
	// provide method for clearing timeouts via the electron node backend
	contextBridge.exposeInMainWorld('clearElectronTimeout', (uuid) => {

		// simply clear the timeout with the main process
		ipcRenderer.invoke('eis:clear-timeout', uuid);
		callbackRegistry.delete(uuid);
	});


	// forwards the firing of a eis:timeout to the assigned callback.
	ipcRenderer.on('eis:timeout', (_, uuid) => {
		const callbackFn = callbackRegistry.get(uuid);
		if (callbackFn)
			callbackFn();

		// if it exists, delete the callback from the registry
		callbackRegistry.delete(uuid);
	});
}

// call immediately to set up the electron intervals and timeouts & export for good measure
useElectronIntervalsPreload();
module.exports = { useElectronIntervalsPreload };
