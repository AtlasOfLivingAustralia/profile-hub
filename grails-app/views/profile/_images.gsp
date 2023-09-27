<div class="panel panel-default ${edit?'':'panel-override'}" ng-controller="ImagesController as imageCtrl" ng-init="imageCtrl.init('${edit}')">
    <div ng-if="imageCtrl.images.length >= 0 && imageCtrl.readonly" ng-cloak>
        <navigation-anchor anchor-name="view_images" title="Images"
                           condition="imageCtrl.images.length > 0"></navigation-anchor>

        <div class="panel-heading">
            <div class="row">
                <div class="col-sm-12">
                    <h4 class="section-panel-heading">Images <span class="caption">({{imageCtrl.availableImagesCount}})</span>
                    </h4>
                </div>
            </div>
        </div>

        <div class="panel-body">
            <div class="row">
                <div class="col-sm-12">
                    <div ng-repeat-start="image in imageCtrl.images" class="col-md-6 col-sm-6 margin-bottom-2"
                         ng-show="!image.excluded">
                        <div class="imgCon ">
                            <a href="" ng-click="imageCtrl.showMetadata(image)" target="_blank"
                               ng-if="image.thumbnailUrl" title="View details">
                                <img ng-src="{{image.thumbnailUrl}}"
                                     ng-if="image.thumbnailUrl && image.type.name == 'OPEN'"
                                     class="thumbnail"/>
                                <img ng-src="${request.contextPath}{{image.thumbnailUrl}}"
                                     ng-if="image.thumbnailUrl && image.type.name != 'OPEN'" class="thumbnail"/>
                            </a>

                            <p class="caption">{{ image.dataResourceName }}</p>

                            <p class="caption"
                               ng-if="imageCtrl.imageCaption(image)">"<span ng-bind-html="imageCtrl.imageCaption(image) | sanitizeHtml"></span>"
                                <span class="caption"
                                      ng-if="image.metadata.creator">by {{ image.metadata.creator }}<span
                                        ng-if="image.metadata.created">, {{ image.metadata.created | date: 'dd/MM/yyyy' }}</span>
                                </span>
                                <span ng-if="image.metadata.rightsHolder">(&copy; {{ image.metadata.rightsHolder }})</span>
                            </p>

                            <a class="caption"
                               href="" ng-click="imageCtrl.showMetadata(image)">View image details</a>

                        </div>
                    </div>

                    <div ng-repeat-end ng-if="$index % 2 == 1" class="clearfix"></div>
                </div>
            </div>
            %{--End of image repeat div--}%
            %{--Start of pagination div in VIEW mode--}%
            <div>
                %{-- The pagination tag is how you instantiate ui-bootstrap-tpls PaginationController (third party angular javascript 'module')
                    ng-model can contain any name you like and the tag will populate it with the current or selected page number,
                    which can then be used in ng-change; I mention this here because it is not in the module's documentation --}%
                <pagination ng-show="imageCtrl.paginate" total-items="imageCtrl.totalItems"
                            items-per-page="imageCtrl.itemsPerPage"
                            ng-model="imageCtrl.page" max-size="10" boundary-links="true" class="pagination-sm"
                            previous-text="Prev" rotate="true"
                            ng-change="imageCtrl.loadImages((imageCtrl.page - 1) * imageCtrl.itemsPerPage, imageCtrl.itemsPerPage)"></pagination>
            </div>
        </div>
    </div>
    %{-- End of image display  --}%
    <div ng-form="ImageForm" ng-if="!imageCtrl.readonly" ng-cloak>
        <navigation-anchor anchor-name="edit_images" title="Images"></navigation-anchor>

        <div class="panel-heading">
            <div class="row">
                <div class="col-sm-12">
                    <h4 class="section-panel-heading">Images <span class="caption">({{imageCtrl.availableImagesCount}})</span>
                    </h4>
                    <p:help help-id="profile.edit.images" show="${edit}" collection-override="${opus?.help?.imagesLink}"/>
                </div>
            </div>
        </div>

        <div class="panel-body">
            <div class="col-sm-12">
                <div class="row section-no-para" ng-if="imageCtrl.images.length > 0">
                    <div class="row">
                        <div class="col-sm-4">
                            <h5>Image</h5>
                        </div>

                        <div class="col-sm-2">
                            <h5>Display on public view</h5>
                        </div>

                        <div class="col-sm-2">
                            <h5>Use as the main image</h5>
                        </div>

                        <div class="col-sm-4">
                            <h5>Options</h5>
                        </div>
                    </div>

                    <div ng-repeat="image in imageCtrl.images" class="row border-bottom margin-bottom-1">
                        <div class="col-sm-4">
                            <div class="imgCon">
                                <a href="" ng-click="imageCtrl.showMetadata(image)" target="_blank"
                                   ng-if="image.largeImageUrl" title="View details">
                                    <img ng-src="{{image.largeImageUrl}}"
                                         ng-if="image.largeImageUrl && image.type.name == 'OPEN'"
                                         class="thumbnail"/>
                                    <img ng-src="${request.contextPath}{{image.thumbnailUrl}}"
                                         ng-if="image.thumbnailUrl && image.type.name != 'OPEN'" class="thumbnail"/>
                                </a>
                                <span class="pill"
                                      ng-class="image.type.name == 'OPEN' ? 'pill-blue' : image.type.name == 'PRIVATE' ? 'pill-green' : 'pill-yellow'"
                                      title="This image is {{image.type.name == 'OPEN' ? 'available in the Atlas of Living Australia image library' : image.type.name == 'PRIVATE' ? 'only visible within this collection' : 'only visible in draft mode'}}">{{image.type.name}}</span>

                                <p class="caption"
                                   ng-if="imageCtrl.imageCaption(image)">"<span ng-bind-html="imageCtrl.imageCaption(image) | sanitizeHtml"></span>"
                                    <span class="caption"
                                          ng-if="image.metadata.creator">by {{ image.metadata.creator }}<span
                                            ng-if="image.metadata.created">, {{ image.metadata.created | date: 'dd/MM/yyyy' }}</span>
                                    </span>
                                    <span ng-if="image.metadata.rightsHolder">(&copy; {{ image.metadata.rightsHolder }})</span>
                                </p>

                            </div>
                        </div>

                        <div class="col-sm-2">
                            <div class="small center">
                                <div class="btn-group">
                                    <button class="btn btn-xs" ng-disabled="image.primary"
                                           ng-class="image.displayOption == 'INCLUDE' ? 'btn-success' : 'btn-default'"
                                           ng-model="image.displayOption" btn-radio="'INCLUDE'"
                                           ng-change="imageCtrl.changeImageDisplay(ImageForm)">Yes</button>
                                    <button class="btn btn-xs" ng-disabled="image.primary"
                                           ng-class="image.displayOption == 'EXCLUDE' ? 'btn-danger' : 'btn-default'"
                                           ng-model="image.displayOption" btn-radio="'EXCLUDE'"
                                           ng-change="imageCtrl.changeImageDisplay(ImageForm)">No</button>
                                </div>
                            </div>
                        </div>

                        <div class="col-sm-2">
                            <div class="small center">
                                <div class="btn-group">
                                    <button class="btn btn-xs" ng-disabled="image.displayOption == 'EXCLUDE'"
                                           ng-class="image.primary ? 'btn-success' : 'btn-default'"
                                           ng-model="image.primary"
                                           ng-click="imageCtrl.changePrimaryImage(image.imageId, ImageForm)"
                                           btn-radio="true">Yes</button>
                                    <button class="btn btn-xs" ng-disabled="image.displayOption == 'EXCLUDE'"
                                           ng-class="image.primary ? 'btn-default' : 'btn-danger'"
                                           ng-model="image.primary"
                                           ng-click="imageCtrl.changePrimaryImage(image.imageId, ImageForm)"
                                           btn-radio="false">No</button>
                                </div>
                            </div>
                        </div>

                        <div class="col-sm-4">
                            <div class="form-group" ng-if="image.type.name == 'OPEN'">
                                <label>Alternative caption</label>
                                <textarea ng-model="image.caption" ckeditor="richTextSingleLine" placeholder="Alternative caption"></textarea>
                            </div>

                            <div class="form-group" ng-if="image.type.name != 'OPEN'">
                                <button type="button" aria-label="Edit image"
                                        tooltip="Edit '{{image.metadata.title}}'" tooltip-placement="bottom"
                                        tooltip-append-to-body="true"
                                        class="btn btn-sm btn-default"
                                        ng-click="imageCtrl.editImage(image, imageCtrl.offset, imageCtrl.page)">
                                    <i class="fa fa-edit"></i> Edit
                                </button>
%{--                                Removed due to https://github.com/AtlasOfLivingAustralia/profile-hub/issues/717 . TODO: remove publishing functionality from code later. --}%
%{--                                <button type="button" aria-label="Push image to open repository"--}%
%{--                                        tooltip="Push '{{image.metadata.title}}' to open repository"--}%
%{--                                        tooltip-placement="bottom" tooltip-append-to-body="true"--}%
%{--                                        class="btn btn-sm btn-success"--}%
%{--                                        ng-click="imageCtrl.publishPrivateImage(image.imageId)"--}%
%{--                                        ng-show="image.type.name == 'PRIVATE'">--}%
%{--                                    <i class="fa fa-paper-plane"></i> Push--}%
%{--                                </button>--}%
                                <button type="button" aria-label="Delete image"
                                        tooltip="Delete '{{image.metadata.title}}'" tooltip-placement="bottom"
                                        tooltip-append-to-body="true"
                                        class="btn btn-sm btn-danger"
                                        ng-click="imageCtrl.deleteLocalImage(image.imageId, image.type.name)">
                                    <i class="fa fa-trash-o"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
                %{--Start of pagination div when in EDIT mode--}%
                <div>
                    %{-- The pagination tag is how you instantiate ui-bootstrap-tpls PaginationController (third party angular javascript 'module')
                        ng-model can contain any name you like and the tag will populate it with the current or selected page number,
                        which can then be used in ng-change; I mention this here because it is not in the module's documentation --}%
                    <pagination ng-show="imageCtrl.paginate" total-items="imageCtrl.totalItems"
                                items-per-page="imageCtrl.itemsPerPage"
                                ng-model="imageCtrl.page" max-size="10" boundary-links="true" class="pagination-sm"
                                previous-text="Prev" rotate="true"
                                ng-change="imageCtrl.loadImages((imageCtrl.page - 1) * imageCtrl.itemsPerPage, imageCtrl.itemsPerPage)"></pagination>
                </div>

                <div class="small margin-top-1 well" ng-show="!imageCtrl.readonly">
                    <i class="fa fa-info-circle color--medium-blue margin-bottom-1"></i>

                    <p>
                        When your profile is locked for major revision, images will only be uploaded to a temporary location. This is referred to as 'staging'. If your profile is not locked for major revision, images will be published immediately.
                    </p>

                    <p>
                        Only staged <span
                            ng-show="imageCtrl.opus.keepImagesPrivate">or private</span> images can be deleted, as published images are stored in the central Atlas of Living Australia image repository and are accessible by other systems.
                    </p>
                </div>

            </div>
        </div>

        <div class="panel-footer" ng-show="!imageCtrl.readonly">
            <div class="row">
                <div class="col-md-12">
                    <g:if test="${grailsApplication.config.feature.imageUpload == 'true'}">
                        <button class="btn btn-default" ng-click="imageCtrl.uploadImage()"><i
                                class="fa fa-plus"></i>&nbsp;Add Image</button>
                    </g:if>
                    <g:elseif
                            test="${grailsApplication.config.deployment_env.toLowerCase() != 'prod' && grailsApplication.config.deployment_env.toLowerCase() != 'production'}">
                        <span class="small">Image uploads are not available in ${grailsApplication.config.deployment_env}</span>
                    </g:elseif>

                    <save-button ng-click="imageCtrl.saveProfile(ImageForm)" form="ImageForm"></save-button>
                </div>
            </div>
        </div>
    </div>
</div>
