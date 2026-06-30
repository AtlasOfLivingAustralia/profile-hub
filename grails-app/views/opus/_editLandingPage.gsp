<div class="card" ng-form="opusCtrl.LandingPage" ng-cloak>
    <div class="card-header">
        <a name="landingpage">
            <h4 class="section-panel-heading">Home Page</h4>
            <p:help help-id="opus.edit.landingpage"/>
        </a>
    </div>

    <div class="card-body">
        <div class="row">
            <div class="col-sm-12">

                <div class="form-group">
                    <label for="explanatoryText">Explanatory text</label>
                    <textarea id="explanatoryText" ng-model="opusCtrl.opus.opusLayoutConfig.explanatoryText" name="explanatoryText" ckeditor="richTextFullToolbar"></textarea>
                    <div class="small">
                        Enter a short description about this collection.
                    </div>
                </div>

                <div class="form-group">
                    <label>Image Slider</label>
                    <table class="table">
                        <thead>
                        <th>Image and Credit</th>
                        <th>Options</th>
                        </thead>
                        <tbody>
                        <tr ng-repeat="image in opusCtrl.opus.opusLayoutConfig.images" class="repeat-items">
                            <td>
                                <div class="margin-bottom-1" ng-if="image.imageUrl">
                                    <img class="img-thumbnail" ng-src="{{image.imageUrl}}">
                                </div>
                                <div class="input-group margin-bottom-1">
                                    <span class="input-group-text">Image URL</span>
                                    <input type="text" class="form-control" name="imageUrl" ng-model="image.imageUrl"/>
                                </div>
                                <div class="input-group">
                                    <span class="input-group-text">Credit</span>
                                    <input type="text" class="form-control" name="credit" ng-model="image.credit"/>
                                </div>
                            </td>
                            <td>
                                <button class="btn btn-link btn-xs" title="Delete image" ng-click="opusCtrl.removeItem($index, opusCtrl.opus.opusLayoutConfig.images, opusCtrl.LandingPage)"><i class="fa fa-trash-o color--red"></i></button>
                                <button class="btn btn-link btn-xs" title="Move this image down" ng-if="!$last" ng-click="opusCtrl.move($index, opusCtrl.opus.opusLayoutConfig.images, opusCtrl.LandingPage, 1)"><i class="fa fa-arrow-down"></i></button>
                                <button class="btn btn-link btn-xs" title="Move this image up" ng-if="!$first " ng-click="opusCtrl.move($index, opusCtrl.opus.opusLayoutConfig.images, opusCtrl.LandingPage, -1)"><i class="fa fa-arrow-up"></i></button>
                            </td>
                        </tr>
                        </tbody>
                        <tfoot>
                        <tr>
                            <td colspan="2">
                                <button class="btn btn-sm btn-outline-secondary margin-top-1 margin-bottom-1" ng-click="opusCtrl.addAnEmptyImage()" ><i class="fa fa-plus"></i> Add an external image</button>
                                <button class="btn btn-sm btn-outline-secondary margin-top-1 margin-bottom-1 ignore-save-warning" ng-model="opusCtrl.showUpload.imageSlider" btn-checkbox >Upload a file</button>
                                <div ng-if="opusCtrl.showUpload.imageSlider" class="clearfix">
                                    <image-upload opus="opusCtrl.opus" on-upload-complete="opusCtrl.imageUploaded"
                                                  url-generator="opusCtrl.generateFileUploadUrl" show-metadata="false" disable-source="true"></image-upload>
                                </div>
                                <div class="alert alert-info small" role="alert">
                                    <p><strong><i class="fa fa-exclamation-circle"><span class="sr-only">Note:</span></i></strong> All images should be at least as tall as the logo image and as wide as the widest supported monitor (in "display" pixels).</p>
                                    <p>Images will be scaled and center cropped to fit in the hero area.</p>
                                </div>
                            </td>
                        </tr>
                        </tfoot>
                    </table>
                    <div>
                        <label for="duration">Time duration</label>
                        <div class="input-group">
                            <span class="input-group-text">Duration</span>
                            <input id="duration" type="number" class="form-control"  name="duration" ng-model="opusCtrl.opus.opusLayoutConfig.duration" min="1"/>
                            <span class="input-group-text">ms</span>
                        </div>
                        <div class="small">
                            The time duration spent by the image slider on an image in milli-seconds.
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="bannerOverlayText">Banner overlay text</label>
                    <textarea id="bannerOverlayText" class="form-control" ng-model="opusCtrl.opus.opusLayoutConfig.bannerOverlayText" name="bannerOverlayText"></textarea>
                    <div class="small">
                        Enter the html code which will overlay on banner.
                    </div>
                </div>

                <div class="form-group">
                    <label for="updatesSection">Updates section</label>
                    <textarea id="updatesSection" ng-model="opusCtrl.opus.opusLayoutConfig.updatesSection" name="updatesSection" ckeditor="richTextFullToolbar"></textarea>
                    <div class="small">
                        Enter the formatted content that you wish to be included in the 'update section' for this collection.
                    </div>
                </div>

                <h5>Help text for sections in home page</h5>
                <p>
                    Enter the formatted content that you wish to appear on hover on search, browse, identify and library buttons on collection home page.
                </p>
                <div class="form-group">
                    <label for="helpTextSearch">Search</label>
                    <input type="text" class="form-control"  id="helpTextSearch" name="helpTextSearch" ng-model="opusCtrl.opus.opusLayoutConfig.helpTextSearch"/>
                </div>
                <div class="form-group">
                    <label for="helpTextBrowse">Browse</label>
                    <input type="text" class="form-control" id="helpTextBrowse" name="helpTextBrowse" ng-model="opusCtrl.opus.opusLayoutConfig.helpTextBrowse"/>
                </div>
                <div class="form-group">
                    <label for="helpTextIdentify">Identify</label>
                    <input type="text" class="form-control" id="helpTextIdentify" name="helpTextIdentify" ng-model="opusCtrl.opus.opusLayoutConfig.helpTextIdentify"/>
                </div>
                <div class="form-group">
                    <label for="helpTextFilter">Filter</label>
                    <input type="text" class="form-control" id="helpTextFilter" name="helpTextFilter" ng-model="opusCtrl.opus.opusLayoutConfig.helpTextFilter"/>
                </div>
                <div class="form-group">
                    <label for="helpTextDocuments">Library</label>
                    <input type="text" class="form-control" id="helpTextDocuments" name="helpTextDocuments" ng-model="opusCtrl.opus.opusLayoutConfig.helpTextDocuments"/>
                </div>
            </div>
        </div>
    </div>

    <div class="card-footer">
        <div class="row">
            <div class="col-md-12">
                <save-button ng-click="opusCtrl.saveOpus(opusCtrl.LandingPage)" form="opusCtrl.LandingPage"></save-button>
            </div>
        </div>
    </div>
</div>