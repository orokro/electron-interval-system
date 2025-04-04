// ElectronIntervalSystem/main.js
const { ipcMain } = require('electron');

const intervalRegistry = new Map();

function useElectronIntervals() {
	ipcMain.handle('eis:set-interval', (event, { rate, uuid }) => {
		const wc = event.sender;
		const interval = setInterval(() => {
			wc.send('eis:tick', uuid);
		}, rate);
		intervalRegistry.set(uuid, interval);
	});

	ipcMain.handle('eis:clear-interval', (_, uuid) => {
		const interval = intervalRegistry.get(uuid);
		if (interval !== undefined) {
			clearInterval(interval);
			intervalRegistry.delete(uuid);
		}
	});
}

useElectronIntervals();

module.exports = { useElectronIntervals };
