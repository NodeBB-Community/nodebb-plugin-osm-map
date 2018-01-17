'use strict';

var meta = module.parent.require('./meta');
var async = module.parent.require('async');
var user = require.main.require('./src/user');
var mapbox = require('mapbox');

var osmMap = {
	_settings: {},
	_defaults: {
		mapboxAccessToken: '',
	},
};

function renderAdmin(req, res, next) {
	res.render('admin/plugins/osm-map', {});
}

function renderMap(req, res, next) {
	var set = 'users:joindate';

	async.waterfall([
		function (next) {
			user.getUidsFromSet(set, 0, -1, next);
		},
		function (uids, next) {
			user.getUsersWithFields(uids, [
				'username', 'userslug', 'picture', 'locationLon', 'locationLat', 'status',
			], req.uid, next);
		},
		function (users, next) {
			async.filter(users, function (user, callback) {
				return callback(null, user.locationLon && user.locationLat);
			}, function (err, results) {
				if (err) {
					return next(err);
				}
				next(null, results);
			});
		},
	], function (err, users) {
		if (err) {
			return next(err);
		}

		res.render('map', { settings: osmMap._settings, users: users });
	});
}


osmMap.init = function (params, callback) {
	var router = params.router;
	var middleware = params.middleware;

	router.get('/admin/plugins/osm-map', middleware.admin.buildHeader, renderAdmin);
	router.get('/api/admin/plugins/osm-map', renderAdmin);

	router.get('/map', middleware.buildHeader, renderMap);
	router.get('/api/map', renderMap);

	meta.settings.get('osm-map', function (err, settings) {
		if (err) {
			console.log('osm-map: failed to retrieve settings' + err.message);
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
	var lon = '';
	var lat = '';
	function setLonLat() {
		profile.data.locationLon = lon;
		profile.data.locationLat = lat;
		profile.fields.push('locationLon');
		profile.fields.push('locationLat');
	}

	if (profile.data.location && profile.data.location !== '') {
		var mapboxClient = new mapbox(osmMap._settings.mapboxAccessToken);
		mapboxClient.geocodeForward(profile.data.location, { limit: 1 })
			.then(function (res) {
				var data = res.entity;
				if (data.features) {
					lon = String(data.features[0].center[0]);
					lat = String(data.features[0].center[1]);
				}
				setLonLat();
				callback(null, profile);
			})
			.catch(function (err) {
				console.log('catch: ' + err);
				callback(null, profile);
			});
	} else {
		setLonLat();
		callback(null, profile);
	}
};

module.exports = osmMap;
