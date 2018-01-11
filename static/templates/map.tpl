<link rel="stylesheet" href="https://unpkg.com/leaflet@1.2.0/dist/leaflet.css" integrity="sha512-M2wvCLH6DSRazYeZRIm1JnYyh22purTM+FDB5CsyxtQJYeKq83arPe5wgbNmcFXGqiSH2XR8dT/fJISVA1r/zQ=="
  crossorigin="" />

<input type="hidden" template-variable="mapboxAccessToken" value="{settings.mapboxAccessToken}" />
<input type="hidden" template-variable="users" value="{users}" />

<style>
  .leaflet-container {
    font: inherit;
  }

  .leaflet-marker-icon {
    border-radius: 20px;
    border: none;
    background: none;
  }

  .leaflet-marker-icon .user-icon {
    border-radius: 20px;
    width: 40px;
    height: 40px;
    line-height: 40px;
    font-size: 2em;
  }
</style>
<div class="panel panel-default">
  <div class="panel-body">
    <div id="map" style="height: 75vh;"></div>
  </div>
</div>
