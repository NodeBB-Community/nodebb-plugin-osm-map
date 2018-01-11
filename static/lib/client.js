'use strict';

/* globals $, document, window, ajaxify */

function onLoad() {
	if (ajaxify.data.template.map) {
		require(['leaflet'], function (L) {
			var map = new L.map('map')
				.setView([46.49, 1.64], 6);
			L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
				maxZoom: 18,
				id: 'mapbox.light',
				accessToken: ajaxify.data.settings.mapboxAccessToken,
			}).addTo(map);

			var users = ajaxify.data.users;

			users.forEach(function (user) {
				var html;
				if (user.picture) {
					html = `<img class="user-icon" src="${user.picture}"/>`;
				} else {
					html = `<div class="user-icon" style="background-color: ${user['icon:bgColor']};">${user['icon:text']}</div>`;
				}
				var icon = L.divIcon({
					iconSize: [40, 40],
					iconAnchor: [20, 20],
					html: `<a href="/user/${user.userslug}">${html}</a>`,
				});
				L.marker([user.locationLat, user.locationLon], {
					icon: icon,
					riseOnHover: true,
				}).on('click', function () {
					window.location = '/user/' + user.userslug;
				}).addTo(map).bindTooltip(user.username, {
					offset: [20, 0],
					direction: 'right',
				});
			});
		});
	}
}

$(document).ready(onLoad);
$(window).on('action:ajaxify.end', onLoad);
