'use strict';

const hooks = require('hooks');

hooks.on('action:ajaxify.end', onLoad);

function onLoad() {
	if (ajaxify.data.template.map) {
		require(['leaflet', 'helpers', 'leaflet.markercluster'], function (L, helpers) {
			const map = new L.map('map')
				.setView([46.49, 1.64], 6);
			L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
				tileSize: 512,
				maxZoom: 18,
				zoomOffset: -1,
				id: 'mapbox/streets-v11',
				accessToken: ajaxify.data.settings.mapboxAccessToken,
			}).addTo(map);

			const users = ajaxify.data.users;
			const bounds = L.latLngBounds([]);
			const markers = L.markerClusterGroup({
				maxClusterRadius: 60,
				showCoverageOnHover: false,
				iconCreateFunction: function (cluster) {
					const n = cluster.getChildCount();
					let size;
					let className;
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
				const html = helpers.buildAvatar(user, '40px', true);
				const userUrl = config.relative_path + '/user/' + user.userslug;
				const icon = L.divIcon({
					iconSize: [40, 40],
					iconAnchor: [20, 20],
					html: '<a href="' + userUrl + '">' + html + '</a>',
				});
				const pos = [user.locationLat, user.locationLon];
				bounds.extend(pos);
				markers.addLayer(L.marker(pos, {
					icon: icon,
					riseOnHover: true,
				}).on('click', function () {
					window.location = userUrl;
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
