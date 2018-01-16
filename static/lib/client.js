'use strict';

/* globals $, document, window, ajaxify */

require.config({
	shim: {
		'markercluster.js': {
			deps: ['leaflet.js'],
		},
	},
});

function onLoad() {
	if (ajaxify.data.template.map) {
		require(['leaflet', 'markercluster'], function (L) {
			var map = new L.map('map')
				.setView([46.49, 1.64], 6);
			L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
				maxZoom: 18,
				id: 'mapbox.light',
				accessToken: ajaxify.data.settings.mapboxAccessToken,
			}).addTo(map);

			var users = ajaxify.data.users;
			var bounds = L.latLngBounds([]);
			var markers = L.markerClusterGroup({
				maxClusterRadius: 60,
				showCoverageOnHover: false,
				iconCreateFunction: function (cluster) {
					var n = cluster.getChildCount();
					var size;
					var className;
					if (n < 10) {
						size = 50;
						className = 'small';
					} else if (n < 100) {
						size = 60;
						className = 'medium';
					} else {
						size = 70;
						className = 'large';
					}
					return L.divIcon({
						iconSize: [size, size],
						iconAnchor: [size / 2, size / 2],
						className: 'leaflet-cluster-icon',
						html: '<div class="user-icon cluster-' + className + '">' + n + '</div>',
					});
				},
			});
			users.forEach(function (user) {
				var html;
				if (user.picture) {
					html = '<img class="user-icon" src="' + user.picture + '"/>';
				} else {
					html = '<div class="user-icon" style="background-color: ' + user['icon:bgColor'] + ';">' + user['icon:text'] + '</div>';
				}
				var icon = L.divIcon({
					iconSize: [40, 40],
					iconAnchor: [20, 20],
					html: '<a href="/user/' + user.userslug + '">' + html + '</a>',
				});
				var pos = [user.locationLat, user.locationLon];
				bounds.extend(pos);
				markers.addLayer(L.marker(pos, {
					icon: icon,
					riseOnHover: true,
				}).on('click', function () {
					window.location = '/user/' + user.userslug;
				}).bindTooltip(user.username, {
					offset: [20, 0],
					direction: 'right',
				}));
			});
			map.addLayer(markers);
			if (bounds.isValid()) {
				map.fitBounds(bounds, {
					padding: [25, 25],
					maxZoom: 8,
				});
			}
		});
	}
}

$(document).ready(onLoad);
$(window).on('action:ajaxify.end', onLoad);
