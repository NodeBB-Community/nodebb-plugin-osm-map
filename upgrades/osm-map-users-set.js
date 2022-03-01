'use strict';

const batch = require.main.require('./src/batch');
const db = require.main.require('./src/database');

module.exports = {
	name: '[OSM Map] Add users with location to their own set',
	timestamp: Date.UTC(2021, 6, 2),
	method: async function () {
		const user = require.main.require('./src/user');
		const { progress } = this;

		await batch.processSortedSet('users:joindate', async (uids) => {
			progress.incr(uids.length);

			const addUids = (await user.getUsersFields(uids, ['locationLon', 'locationLat']))
				.filter(user => !!user.locationLon && !!user.locationLat)
				.map(user => user.uid);

			await db.setAdd('osmMap.users', addUids);
		}, {
			batch: 500,
			progress: this.progress,
		});
	},
};
