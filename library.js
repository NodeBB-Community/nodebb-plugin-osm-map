'use strict';

const db = require.main.require('./src/database');
const meta = require.main.require('./src/meta');
const async = module.parent.require('async');
const user = require.main.require('./src/user');
const mapbox = require('mapbox');

const osmMap = {
	_settings: {},
	_defaults: {
		mapboxAccessToken: '',
	},
};

function renderAdmin(req, res) {
	res.render('admin/plugins/osm-map', {});
}

async function renderMap(req, res) {
	const uids = await db.getSetMembers('osmMap.users');
	let users = await user.getUsersWithFields(uids, [
		'username', 'userslug', 'picture', 'locationLon', 'locationLat', 'status',
	], req.uid);

	users = users.filter(user => user.locationLon && user.locationLat);
	res.render('map', { settings: osmMap._settings, users, title: '[[osm-map:map]]' });
}


osmMap.init = function (params, callback) {
	const { router } = params;
	const { middleware } = params;

	router.get('/admin/plugins/osm-map', middleware.admin.buildHeader, renderAdmin);
	router.get('/api/admin/plugins/osm-map', renderAdmin);

	router.get('/map', middleware.buildHeader, renderMap);
	router.get('/api/map', renderMap);

	meta.settings.get('osm-map', (err, settings) => {
		if (err) {
			console.log(`osm-map: failed to retrieve settings${err.message}`);
		}
		Object.assign(osmMap._settings, osmMap._defaults, settings);
	});
	callback();
};

osmMap.addAdminNavigation = function (header, callback) {
	header.plugins.push({
		route: '/plugins/osm-map',
		icon: 'fa-map',
		name: '[[osm-map:osm-map]]',
	});

	callback(null, header);
};

osmMap.getNavigation = function (core, callback) {
	core.push({
		route: '/map',
		title: '\\[\\[osm-map:map\\]\\]',
		enabled: false,
		iconClass: 'fa-map',
		textClass: 'visible-xs-inline',
		text: '\\[\\[osm-map:map\\]\\]',
		properties: { },
		core: false,
	});
	callback(null, core);
};

osmMap.whitelistFields = function (hookData, callback) {
	hookData.whitelist.push('locationLon');
	hookData.whitelist.push('locationLat');
	callback(null, hookData);
};

osmMap.addCoordinates = function (profile, callback) {
	let lon = '';
	let lat = '';
	async function setLonLat() {
		profile.data.locationLon = lon;
		profile.data.locationLat = lat;
		profile.fields.push('locationLon');
		profile.fields.push('locationLat');

		await (!!lat && !!lon ? db.setAdd : db.setRemove)('osmMap.users', profile.uid);
	}

	if (profile.data.location && profile.data.location !== '') {
		const mapboxClient = new mapbox(osmMap._settings.mapboxAccessToken);
		mapboxClient.geocodeForward(profile.data.location, { limit: 1 })
			.then((res) => {
				const data = res.entity;
				if (data.features) {
					lon = String(data.features[0].center[0]);
					lat = String(data.features[0].center[1]);
				}
				setLonLat();
				callback(null, profile);
			})
			.catch((err) => {
				console.log(`catch: ${err}`);
				callback(null, profile);
			});
	} else {
		setLonLat();
		callback(null, profile);
	}
};

module.exports = osmMap;
