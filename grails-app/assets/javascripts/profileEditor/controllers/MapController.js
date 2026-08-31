/**
 * Map controller
 */
profileEditor.controller('MapController', function ($scope, profileService, util, config, messageService, $http, $timeout) {
    var self = this;

    var biocacheWMSUrl = config.biocacheServiceUrl + "/ws/mapping/wms/reflect?";
    var biocacheInfoUrl = config.biocacheServiceUrl + "/ws/occurrences/info?";
    var biocacheBoundsUrl = config.biocacheServiceUrl + "/ws/mapping/bounds.json?";

    var dirtyFormOnMapChangeSubscription = null;

    self.autoZoom = false;
    self.showingEditorView = true;
    self.showStaticImage = true;
    self.readonly = config.readonly;

    self.init = function () {

        self.loading = true;
        self.editingMap = false;

        self.opusId = util.getEntityId("opus");
        self.profileId = util.getEntityId("profile");

        var future = profileService.getProfile(self.opusId, self.profileId);

        self.wmsLayer = null;

        future.then(function (data) {
                self.profile = data.profile;
                self.opus = data.opus;
                self.autoZoom = self.opus.mapConfig.autoZoom;

                self.map = new ALA.Map("occurrenceMap", {
                    zoomToObject: self.autoZoom,
                    maxAutoZoom: self.opus.mapConfig.maxAutoZoom,
                    drawControl: false,
                    singleMarker: false,
                    useMyLocation: false,
                    showFitBoundsToggle: true,
                    allowSearchLocationByAddress: false,
                    allowSearchRegionByAddress: false,
                    draggableMarkers: false,
                    showReset: false,
                    zoom: self.opus.mapConfig.mapZoom,
                    center: [self.opus.mapConfig.mapDefaultLatitude, self.opus.mapConfig.mapDefaultLongitude]
                });

                if (_.isUndefined(self.profile.mapSnapshot) || _.isEmpty(self.profile.mapSnapshot)) {
                    self.showStaticImage = false;
                }

                var colourBy = URI.parseQuery(self.profile.occurrenceQuery).colourBy;

                if (!_.isUndefined(colourBy) && !_.isEmpty(colourBy)) {
                    var label = util.getFacetLabel(colourBy);
                    self.legend = new L.Control.Legend({
                        id: "legend",
                        position: "bottomright",
                        items: [],
                        collapse: true,
                        legendListClass: "legend-container-short",
                        label: label
                    });
                    self.map.addControl(self.legend);
                }

                self.updateWMSLayer(self.profile.occurrenceQuery);
                self.updateLegend(self.profile.occurrenceQuery);

                self.map.registerListener("click", self.showOccurrenceDetails);

                self.loading = false;
            },
            function () {
                messageService.alert("An error occurred while retrieving the map information.");
                self.loading = false;
            }
        );
    };

    self.updateWMSLayer = function (occurrenceQuery) {
        if (self.wmsLayer != null) {
            self.map.removeLayer(self.wmsLayer);
        }

        var wmsUrl = biocacheWMSUrl + occurrenceQuery;

        var queryParams = URI.parseQuery(occurrenceQuery);
        var env = "color:" + self.opus.mapConfig.mapPointColour + ";name:circle;size:4;opacity:1";
        if (!_.isUndefined(queryParams.colourBy) && !_.isEmpty(queryParams.colourBy)) {
            env += ";colormode:" + queryParams.colourBy
        }

        self.map.addWmsLayer(undefined, {
            wmsLayerUrl: wmsUrl,
            layers: 'ALA:occurrences',
            format: 'image/png',
            attribution: self.opus.mapConfig.mapAttribution,
            outline: "true",
            transparent: false,
            opacity: 1,
            ENV: env,
            boundsUrl: biocacheBoundsUrl + occurrenceQuery,
            callback: self.setBounds
        });
    };

    self.updateLegend = function(occurrenceQuery) {
        var colourBy = URI.parseQuery(occurrenceQuery).colourBy;

        if (!_.isUndefined(colourBy) && !_.isEmpty(colourBy)) {
            var promise = profileService.getBiocacheLegend(occurrenceQuery, colourBy);
            promise.then(function(legendItems) {
                if (!_.isUndefined(legendItems)) {
                    legendItems.forEach (function (item) {
                        item.name = ALA.OccurrenceMapUtils.formatFacetName(item.name);
                    });
                    self.legend.setItems(legendItems);
                } else {
                    self.legend.clearItems();
                    self.legend.hide();
                }
            });
        }
    };

    self.setBounds = function () {
        self.map.fitBounds();
    };

    self.showOccurrenceDetails = function (clickEvent) {
        var url = biocacheInfoUrl
            + self.profile.occurrenceQuery
            + "&zoom=6"
            + "&lat=" + clickEvent.latlng.lat
            + "&lon=" + clickEvent.latlng.lng
            + "&radius=20&format=json"
            + "&callback=JSON_CALLBACK";

        var future = $http.jsonp(url);
        future.success(function (response) {
            L.popup()
                .setLatLng(clickEvent.latlng)
                .setContent("Occurrences at this point: " + response.count)
                .openOn(self.map.getMapImpl());
        });
        future.error(function () {
            messageService.alert("Unable to find occurrences for the specified location.");
        });
    };

    self.hasEditorCustomisations = function() {
        var hasCustomisations = false;
        if (!_.isUndefined(self.profile)) {
            var baseQuery = extractBaseQuery(self.profile.occurrenceQuery);

            hasCustomisations = baseQuery != self.profile.occurrenceQuery;
        }
        return hasCustomisations;
    };

    self.toggleEditorCustomisations = function() {
        if (self.showingEditorView) {
            self.updateWMSLayer(extractBaseQuery(self.profile.occurrenceQuery));
            self.showingEditorView = false;
        } else {
            self.updateWMSLayer(self.profile.occurrenceQuery);
            self.showingEditorView = true;
        }
    };

    self.saveMapConfiguration = function () {
        self.profile.occurrenceQuery = self.editableMap.getQueryString();
        // set a flag if user has made custom map configuration. This flag will determine whether to return user configured
        // occurrenceQuery or default occurrenceQuery for the profile.
        if(self.profile.occurrenceQuery == extractBaseQuery(self.profile.occurrenceQuery)){
            self.profile.isCustomMapConfig = false;
        } else {
            self.profile.isCustomMapConfig = true;
        }

        var promise = profileService.updateProfile(self.opusId, self.profileId, self.profile);
        promise.then(function () {
            messageService.info("Map configuration has been successfully updated.");

            self.updateWMSLayer(self.profile.occurrenceQuery);
            self.toggleEditingMap();
            setTimeout(self.map.redraw, 500);
        }, function () {
            messageService.alert("An error occurred while updating the map configuration.");
        });
    };

    self.resetToDefaultMapConfig = function () {
        var confirm = util.confirm("This will remove all customisations from the map and return the configuration to the default for this collection. Are you sure you wish to proceed?");
        confirm.then(function () {
            // the default map config is just the q= portion of the url
            self.editableMap.setQueryString(extractBaseQuery(self.profile.occurrenceQuery));
        });
    };

    self.undoAllMapChanges = function () {
        var confirm = util.confirm("This will remove all customisations you have made since beginning to edit the map configuration. Are you sure you wish to proceed?");
        confirm.then(function () {
            self.editableMap.setQueryString(self.profile.occurrenceQuery);
        });
        self.MapForm.$setPristine();
    };

    self.toggleEditingMap = function () {
        if (self.editingMap) {
            self.editableMap.setQueryString(self.profile.occurrenceQuery);
            self.editingMap = false;
            if (dirtyFormOnMapChangeSubscription != null) {
              dirtyFormOnMapChangeSubscription.cancel();
            }
            self.MapForm.$setPristine();
        } else {
            self.editingMap = true;
            if (_.isUndefined(self.editableMap)) {
                createEditableMap();
            }
            dirtyFormOnMapChangeSubscription = self.editableMap.map.subscribe(function () {
                self.MapForm.$setDirty();
            });
        }
    };

    self.deleteMapSnapshot = function() {
        var confirm = util.confirm("This will remove the map snapshot, so that only the live map data will be displayed. Are you sure you wish to proceed?");
        confirm.then(function () {
            profileService.deleteMapSnapshot(self.opusId, self.profileId).then(function() {
                messageService.success("Map snapshot successfully deleted");
                self.profile.mapSnapshot = null;
            });
        });
    };

    self.createMapSnapshot = function() {
        var confirm = util.confirm("This will create a static image of the map using the currently selected configuration (except 'colour by') and zoom level. This image will be displayed instead of the live map, and the user will need to click a link to toggle the view to the live map. Are you sure you wish to proceed?");
        confirm.then(function () {
            var bounds = self.editableMap.map.getMapImpl().getBounds();
            var extents = bounds._southWest.lng + "," + bounds._southWest.lat + "," + bounds._northEast.lng + "," + bounds._northEast.lat;
            profileService.createMapSnapshot(self.opusId, self.profileId, self.editableMap.getQueryString(), extents).then(function(data) {
                self.profile.mapSnapshot = data.mapSnapshotUrl;

                messageService.success("Map snapshot successfully created");
            });
        });
    };

    self.toggleStaticImage = function() {
        self.showStaticImage = !self.showStaticImage;
        if (!self.showStaticImage) {
            $timeout(self.map.redraw, 100);
        }
    };

    // When the collection is using private data the Data Resource Ids are 'temporary' (not really, but that's what
    // they're called in the Collectory) and don't exist in the real Biocache, so we need to remove everything from the
    // query string except the q parameter so it will work in the Biocache.
    self.getQueryToExploreInALA = function() {
        var query = self.profile.occurrenceQuery;

        if (self.opus.usePrivateRecordData) {
            if (angular.isDefined(self.profile.guid) && self.profile.guid != null) {
                query = URI.encodeReserved("q=lsid:" + self.profile.guid);
            } else {
                query = null;
            }
        }

        return query;
    };

    // Removes everything other than the q= portion of the biocache query
    function extractBaseQuery(queryString) {
        if (_.isUndefined(queryString)) {
            return null;
        }

        var queryParams = URI.parseQuery(queryString);

        return URI.encodeReserved("q=" + queryParams.q);
    }

    function createEditableMap() {
        if (!config.readonly) {
            var occurrenceQuery = self.profile.occurrenceQuery;

            self.editableMap = new ALA.OccurrenceMap("editOccurrenceMap",
                config.biocacheServiceUrl,
                occurrenceQuery,
                {
                    mapOptions: {
                        zoomToObject: false,
                        showFitBoundsToggle: true,
                        zoom: self.opus.mapConfig.mapZoom + 1, // the edit map panel is bigger than the view, so increase the zoom
                        center: [self.opus.mapConfig.mapDefaultLatitude, self.opus.mapConfig.mapDefaultLongitude]
                    },
                    point: {
                        colour: self.opus.mapConfig.mapPointColour,
                        mapAttribution: self.opus.mapConfig.mapAttribution
                    },
                    facetGroupUrl: config.facetGroupUrl
                }
            );

            $timeout(self.editableMap.map.redraw, 500);
        }
    }
});