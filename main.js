/*
	main.js
	-------

	Sets up code for our methods to set/clear intervals and set/clear timeouts,
	seamlessly with electron doing the timing on the node side.
*/

// electron
const { ipcMain } = require('electron');

// store our intervals and timeouts keys here so we can clear them later
const intervalRegistry = new Map();
const timeOutRegistry = new Map();

/**
 * Sets up the electron intervals and timeouts
 */
function useElectronIntervals() {

	// set up handler for setting intervals	
	ipcMain.handle('eis:set-interval', (event, { rate, uuid }) => {

		// use regular JS setInterval to set the interval
		const webContents = event.sender;
		const interval = setInterval(() => {
			webContents.send('eis:tick', uuid);
		}, rate);

		// save the interval in the registry with the specified uuid so we can clear via uuid, later
		intervalRegistry.set(uuid, interval);
	});

	// set up handler for clearing intervals
	ipcMain.handle('eis:clear-interval', (_, uuid) => {

		// check for an interval with our specified uuid
		const interval = intervalRegistry.get(uuid);
		if (interval !== undefined) {

			// if we have an interval, clear it & remove it from the registry
			clearInterval(interval);
			intervalRegistry.delete(uuid);
		}
	});

	// set up handler for setting timeouts	
	ipcMain.handle('eis:set-timeout', (event, { rate: length, uuid }) => {

		// use regular JS setTimeout to set the the out
		const webContents = event.sender;
		const timeOut = setTimeout(() => {

			// set the timeout to send a message to the renderer process
			webContents.send('eis:timeout', uuid);

			// clear the timeout and remove it from the registry
			timeOutRegistry.delete(uuid);
			clearTimeout(timeOut);

		}, length);

		// save the timeOut in the registry with the specified uuid so we can clear via uuid, later
		timeOutRegistry.set(uuid, timeOut);
	});

	// set up handler for clearing timeouts
	ipcMain.handle('eis:clear-timeout', (_, uuid) => {

		// check for an interval with our specified uuid
		const timeOut = timeOutRegistry.get(uuid);
		if (timeOut !== undefined) {

			// if we have an interval, clear it & remove it from the registry
			clearTimeout(timeOut);
			timeOutRegistry.delete(uuid);
		}
	});
}

// call immediately upon loading & export for good measure
useElectronIntervals();
module.exports = { useElectronIntervals };
