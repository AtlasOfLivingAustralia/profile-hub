<div class="card" ng-form="MapForm" ng-cloak>
    <div class="card-header">
        <a name="map">
            <h4 class="section-panel-heading">Map configuration</h4>
            <p:help help-id="opus.edit.map"/>
        </a>
    </div>

    <div class="card-body">
        <div class="row">
            <div class="col-sm-12">
                <div class="form-group">
                    <label for="attribution">Attribution</label>
                    <input id="attribution" type="text" class="form-control" name="mapAttribution"
                           ng-model="opusCtrl.opus.mapConfig.mapAttribution">
                </div>

                <div class="form-group">
                    <label for="biocacheUrl">Biocache instance to link to</label>
                    <input id="biocacheUrl" type="text" class="form-control" name="biocacheUrl"
                           ng-model="opusCtrl.opus.mapConfig.biocacheUrl">
                </div>

                <div class="form-group">
                    <label for="biocacheName">Biocache instance name</label>
                    <input id="biocacheName" type="text" class="form-control" name="biocacheName"
                           ng-model="opusCtrl.opus.mapConfig.biocacheName">
                </div>

                <div class="form-group">
                    <label for="pointColour">Point color</label>

                    <div class="input-group">
                        <input id="pointColour" type="text" class="form-control" colorpicker colorpicker-close-on-select
                               ng-model="opusCtrl.opus.mapConfig.mapPointColour">
                        <span class="input-group-addon" ng-style="{background: opusCtrl.opus.mapConfig.mapPointColour}"></span>
                    </div>
                </div>

                <h4 class="heading-underlined">Map centre &amp; zoom options</h4>

                <div class="form-inline padding-bottom-1">
                    <div class="form-group">
                        <label class="control-label" for="mapDefaultLatitude">Default latitude</label>
                        <input id="mapDefaultLatitude" type="text" class="form-control" maxlength="7" size="5"
                               name="mapDefaultLatitude" ng-model="opusCtrl.opus.mapConfig.mapDefaultLatitude">
                    </div>

                    <div class="form-group">
                        <label class="control-label" for="mapDefaultLongitude">Default longitude</label>
                        <input id="mapDefaultLongitude" type="text" class="form-control" maxlength="7" size="5"
                               name="mapDefaultLongitude" ng-model="opusCtrl.opus.mapConfig.mapDefaultLongitude">
                    </div>

                    <div class="form-group">
                        <label class="control-label" for="mapZoom">Zoom level</label>
                        <input id="mapZoom" type="number" class="form-control input-xs" min="1" max="25" name="mapZoom"
                               ng-model="opusCtrl.opus.mapConfig.mapZoom">
                    </div>

                    <div class="form-group">
                        <label class="control-label" for="maxAutoZoom">Maximum auto zoom</label>
                        <input id="maxAutoZoom" type="number" class="form-control input-xs"
                               name="maxAutoZoom" min="1" max="25" ng-disabled="!opusCtrl.opus.mapConfig.autoZoom"
                               ng-model="opusCtrl.opus.mapConfig.maxAutoZoom">
                    </div>
                </div>

                <div class="small padding-bottom-1">
                    The default latitude and longitude indicate the centre for all maps in this collection.
                    The zoom level is the initial zoom for the map. Use these controls to centre the map on the area of interest for your collection.
                    The maximum auto zoom controls how far the map will be automatically zoomed in if the "Automatically zoom..." option below is selected.
                </div>

                <div class="form-inline">
                    <div class="checkbox padding-bottom-1">
                        <label for="autoZoom" class="inline-label">
                            <input id="autoZoom" type="checkbox" name="autoZoom"
                                   ng-model="opusCtrl.opus.mapConfig.autoZoom" ng-false-value="false">
                            Automatically zoom distribution maps to fit the data. This may override the default zoom level specified above, but will not exceed the maximum auto zoom level.
                        </label>
                    </div>
                </div>

                <h4 class="heading-underlined">Snapshot images</h4>
                <div class="form-inline">
                    <div class="checkbox padding-bottom-1">
                        <label for="allowSnapshots" class="inline-label">
                            <input id="allowSnapshots" type="checkbox" name="allowSnapshots"
                                   ng-model="opusCtrl.opus.mapConfig.allowSnapshots" ng-false-value="false">
                            Allow editors to create static snapshot images of distribution maps.
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="card-footer">
        <div class="row">
            <div class="col-md-12">
                <save-button ng-click="opusCtrl.saveOpus(MapForm)" form="MapForm"></save-button>
            </div>
        </div>
    </div>
</div>
