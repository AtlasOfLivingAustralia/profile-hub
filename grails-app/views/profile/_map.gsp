<g:set var="allowStaticImage" value="${allowStaticImage ?: false}"/>
<g:if test="${displayMap}">
    <div ng-controller="MapController as mapCtrl"
         ng-cloak ng-form="mapCtrl.MapForm" ng-class="mapCtrl.editingMap || ${fullWidth ?: false} ? 'col-md-12' : 'col-md-6 col-sm-12'">
        <navigation-anchor anchor-name="map" title="Map" on-display="mapCtrl.init()"></navigation-anchor>

        <div class="row">
            <g:if test="${edit}">
                <div class="col-md-12">
                    <div ng-show="!mapCtrl.editingMap">
                        <div class="float-start">
                            <div ng-show="mapCtrl.showStaticImage && mapCtrl.profile.mapSnapshot && ${allowStaticImage} && mapCtrl.opus.mapConfig.allowSnapshots">
                                <g:render template="mapSnapshot" model="[size: 'small']"/>
                            </div>
                            <div ng-hide="mapCtrl.showStaticImage && mapCtrl.profile.mapSnapshot && ${allowStaticImage} && mapCtrl.opus.mapConfig.allowSnapshots" class="thumbnail">
                                <m:map id="occurrenceMap" height="${height ?: '300px'}" width="${width ?: '450px'}"/>
                            </div>
                            <a class="small float-end" ng-show="mapCtrl.profile.mapSnapshot && ${allowStaticImage} && mapCtrl.opus.mapConfig.allowSnapshots" ng-click="mapCtrl.toggleStaticImage()">Show {{ mapCtrl.showStaticImage ? 'live map' : 'static map' }}</a>
                            <div class="clearfix"></div>
                        </div>
                    </div>

                    <div ng-show="mapCtrl.editingMap">
                        <p:help help-id="profile.edit.map" float="false" collection-override="${opus?.help?.mapsLink}"/>
                        <m:occurrenceMap id="editOccurrenceMap"/>

                        <div class="row">
                            <div class="col-md-12 padding-top-1">
                                <div class="float-end">
                                    <button class="btn btn-outline-secondary" ng-show="mapCtrl.opus.mapConfig.allowSnapshots"
                                            ng-click="mapCtrl.createMapSnapshot()">{{ mapCtrl.profile.mapSnapshot ? 'Update': 'Create' }} snapshot image</button>
                                    <button class="btn btn-danger" ng-show="mapCtrl.profile.mapSnapshot && mapCtrl.opus.mapConfig.allowSnapshots"
                                            ng-click="mapCtrl.deleteMapSnapshot()">Delete snapshot image</button>
                                    <save-button ng-click="mapCtrl.saveMapConfiguration(MapForm)"
                                                 disabled="!mapCtrl.MapForm.$dirty"
                                                 dirty="mapCtrl.MapForm.$dirty"
                                                 btn-class="btn btn-outline-secondary"
                                                 form="mapCtrl.MapForm">
                                    </save-button>
                                </div>

                                <button class="btn btn-outline-secondary"
                                        ng-click="mapCtrl.toggleEditingMap()">Cancel edit</button>
                                <button class="btn btn-danger"
                                        ng-click="mapCtrl.resetToDefaultMapConfig()">Reset to default</button>
                                <button class="btn btn-warning"
                                        ng-click="mapCtrl.undoAllMapChanges()">Undo unsaved changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </g:if>
            <g:else>
                <div class="col-md-12">
                    <div class="float-start ${fullWidth ? 'full-width' : ''}">
                        <div ng-show="mapCtrl.showStaticImage && mapCtrl.profile.mapSnapshot && ${allowStaticImage} && mapCtrl.opus.mapConfig.allowSnapshots">
                            <g:render template="mapSnapshot" model="[size: 'small']"/>
                        </div>
                        <div ng-hide="mapCtrl.showStaticImage && mapCtrl.profile.mapSnapshot && ${allowStaticImage} && mapCtrl.opus.mapConfig.allowSnapshots" class="${fullWidth ? 'full-width' : ''}">
                            <div class="thumbnail">
                                <m:map id="occurrenceMap" height="${height ?: '300px'}" width="${width ?: '450px'}"/>
                            </div>
                        </div>
                        <a class="small float-end" ng-show="mapCtrl.profile.mapSnapshot && ${allowStaticImage} && mapCtrl.opus.mapConfig.allowSnapshots" ng-click="mapCtrl.toggleStaticImage()">Show {{ mapCtrl.showStaticImage ? 'live map' : 'static map' }}</a>
                        <div class="clearfix"></div>
                    </div>
                </div>
            </g:else>
        </div>

        <div class="row" ng-show="!mapCtrl.editingMap && mapCtrl.profile">
            <div class="col-md-12">
                <div ng-hide="mapCtrl.showStaticImage && mapCtrl.profile.mapSnapshot && ${allowStaticImage} && mapCtrl.opus.mapConfig.allowSnapshots">
                    <a href="" ng-show="mapCtrl.hasEditorCustomisations()" ng-click="mapCtrl.toggleEditorCustomisations()" target="_blank"
                       class="margin-top-1 inline-block">{{ mapCtrl.showingEditorView ? 'Show' : 'Hide' }} non-vouchered occurrences</a>
                    <span class="padding-right-1 padding-left-1" ng-show="mapCtrl.hasEditorCustomisations()">|</span>
                    <a href="${grailsApplication.config.biocache.base.url}/occurrences/search?{{ mapCtrl.getQueryToExploreInALA() }}#tab_mapView"
                       ng-if="mapCtrl.opus.mapConfig.biocacheUrl && mapCtrl.getQueryToExploreInALA()" target="_blank"
                       class="margin-top-1 inline-block">Explore in the Atlas of Living Australia</a>
                </div>
                <g:if test="${edit}">
                    <button class="btn btn-outline-secondary btn-sm margin-top-1"
                            ng-click="mapCtrl.toggleEditingMap()">Edit map configuration</button>
                </g:if>
            </div>
        </div>

        <div class="padding-bottom-2" ng-show="mapCtrl.editingMap"></div>
    </div>
</g:if>


