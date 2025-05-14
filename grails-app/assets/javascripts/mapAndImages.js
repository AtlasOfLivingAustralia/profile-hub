// requires that application.js is loaded beforehand

// maps
// dependsOn underscore, jquery, font-awesome, uri
//= require onImpressions/jquery.onimpression.js
//= require webjars/protonet/jquery.inview/jquery.inview.min.js
// Leaflet must be under the path 'leaflet' because leaflet-control-geocoder use require('leaflet') which gets
// interpreted by the asset pipeline as a sort of inline //= require, which means it will load the version from
// the image plugin unless overridden
//= require leaflet
//= require webjars/github-com-kbartas-Leaflet-draw/1.0.4/leaflet.draw-src.js
// TODO Add src.js to plugin
//= require webjars/Leaflet.Coordinates/0.1.5/dist/Leaflet.Coordinates-0.1.5.src.js
//= require webjars/leaflet-easybutton/2.4.0/src/easy-button.js
// The Geocoder control would go here but it doesn't play nicely with the asset-pipeline and we don't need it in this app.
//= require webjars/leaflet-control-geocoder/2.4.0/dist/Control.Geocoder.js
//= require webjars/leaflet.markercluster/1.5.3/dist/leaflet.markercluster-src.js
//= require webjars/leaflet-loading/0.1.24/src/Control.Loading.js
//= require webjars/leaflet-sleep/0.5.1/Leaflet.Sleep.js
//= require turf-2.0.2/turf.min.js
//= require webjars/handlebars/4.7.7/dist/handlebars
//= require plugins/ala-map/Map.js
//= require plugins/ala-map/OccurrenceMap.js
//= require plugins/ala-map/layers/SmartWmsLayer.js
//= require plugins/ala-map/controls/Checkbox.js
//= require plugins/ala-map/controls/Slider.js
//= require plugins/ala-map/controls/TwoStepSelector.js
//= require plugins/ala-map/controls/Select.js
//= require plugins/ala-map/controls/Legend.js
//= require plugins/ala-map/controls/Radio.js

// images
// prerequisites are jquery, leaflet, leaflet-draw, leafleft-loading, font-awesome
//= require ala-image-viewer.js
//= require slider-pro/js/jquery.sliderPro.custom.js
//= require img-gallery.js
