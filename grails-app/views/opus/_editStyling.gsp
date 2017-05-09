<div class="panel panel-default" ng-form="opusCtrl.StyleForm" ng-cloak>
    <div class="panel-heading">
        <a name="branding">
            <h4 class="section-panel-heading">Branding</h4>
            <p:help help-id="opus.edit.branding"/>
        </a>
    </div>

    <div class="panel-body">
        <div class="row">
            <div class="col-sm-12">
                <div class="form-group">
                    <label>Banner image for collection pages</label>
                    <input type="text" class="form-control" name="bannerUrl" ng-model="opusCtrl.opus.brandingConfig.opusBannerUrl"/>
                    <button class="btn btn-sm btn-default margin-top-1 ignore-save-warning" ng-model="opusCtrl.showUpload.opusBanner" btn-checkbox >Upload a file</button>
                    <div ng-if="opusCtrl.showUpload.opusBanner" class="clearfix">
                        <image-upload opus="opusCtrl.opus" on-upload-complete="opusCtrl.opusBannerUploaded"
                                url="{{opusCtrl.imageUploadUrl + 'opusBanner'}}" show-metadata="false" disable-source="true"></image-upload>
                    </div>
                    <div class="radio">
                        <label for="opusBannerHeightTall" class="inline-label padding-right-1">Banner height</label>
                        <label for="opusBannerHeightTall" class="inline-label padding-right-1">
                            <input id="opusBannerHeightTall" type="radio" name="opusBannerHeight" ng-value="300"
                                   ng-model="opusCtrl.opus.brandingConfig.opusBannerHeight">
                            Tall
                        </label>
                        <label for="opusBannerHeightShort" class="inline-label">
                            <input id="opusBannerHeightShort" type="radio" name="opusBannerHeight" ng-value="100" class="padding-left-1"
                                   ng-model="opusCtrl.opus.brandingConfig.opusBannerHeight">
                            Short
                        </label>
                    </div>

                    <div class="small">This image will be displayed on all pages <em>except</em> the profile view and edit pages.
                    If left blank, the banner image for profile pages will be used.
                    If both fields are left blank then a system default image will be used.</div>
                    <div class="small">Recommended size is at least 1000px wide by {{ opusCtrl.opus.brandingConfig.opusBannerHeight }}px high.</div>
                </div>

                <div class="form-group">
                    <label>Banner image for profile pages</label>
                    <input type="text" class="form-control" name="bannerUrl" ng-model="opusCtrl.opus.brandingConfig.profileBannerUrl"/>
                    <button class="btn btn-sm btn-default margin-top-1 ignore-save-warning" ng-model="opusCtrl.showUpload.profileBanner" btn-checkbox >Upload a file</button>
                    <div ng-if="opusCtrl.showUpload.profileBanner" class="clearfix">
                        <image-upload opus="opusCtrl.opus" on-upload-complete="opusCtrl.profileBannerUploaded"
                                      url="{{opusCtrl.imageUploadUrl + 'profileBanner'}}" show-metadata="false" disable-source="true"></image-upload>
                    </div>
                    <div class="radio">
                        <label for="profileBannerHeightTall" class="inline-label padding-right-1">Banner height</label>
                        <label for="profileBannerHeightTall" class="inline-label padding-right-1">
                            <input id="profileBannerHeightTall" type="radio" name="profileBannerHeight" ng-value="300"
                                   ng-model="opusCtrl.opus.brandingConfig.profileBannerHeight">
                            Tall
                        </label>
                        <label for="profileBannerHeightShort" class="inline-label">
                            <input id="profileBannerHeightShort" type="radio" name="profileBannerHeight" ng-value="100"
                                   ng-model="opusCtrl.opus.brandingConfig.profileBannerHeight">
                            Short
                        </label>
                    </div>
                    <div class="small">This image will be displayed on the profile view and edit pages.
                    If left blank, the banner image for collection pages will be used.
                    If both fields are left blank then a system default image will be used.</div>
                    <div class="small">Recommended size is at least 1000px wide by {{ opusCtrl.opus.brandingConfig.profileBannerHeight }}px high.</div>
                </div>

                <div class="form-group">
                    <label>Logo</label>
                    <table class="table">
                        <thead>
                            <th>Logo and Link</th>
                            <th>Options</th>
                        </thead>
                        <tbody>
                            <tr ng-repeat="logo in opusCtrl.opus.brandingConfig.logos" class="repeat-items">
                                <td>
                                    <div class="margin-bottom-1" ng-if="logo.logoUrl">
                                        <img class="img-thumbnail" ng-src="{{logo.logoUrl}}">
                                    </div>
                                    <div class="input-group margin-bottom-1">
                                        <span class="input-group-addon">Logo URL</span>
                                        <input type="text" class="form-control" name="logoUrl" ng-model="logo.logoUrl"/>
                                    </div>
                                    <div class="input-group">
                                        <span class="input-group-addon">Link</span>
                                        <input type="text" class="form-control" name="hyperlink" ng-model="logo.hyperlink"/>
                                    </div>
                                    <div class="small">e.g. https://www.ala.org.au. The logo will link to the URL entered here. If left blank, no link will be added.</div>
                                </td>
                                <td>
                                    <button class="btn btn-link btn-xs fa fa-trash-o color--red" title="Delete logo" ng-click="opusCtrl.removeItem($index, opusCtrl.opus.brandingConfig.logos, opusCtrl.StyleForm)"></button>
                                    <button class="btn btn-link btn-xs fa fa-arrow-down ng-scope" ng-if="!$last" ng-click="opusCtrl.move($index, opusCtrl.opus.brandingConfig.logos, opusCtrl.StyleForm, 1)" title="Move this logo down"></button>
                                    <button class="btn btn-link btn-xs fa fa-arrow-up ng-scope" ng-if="!$first " ng-click="opusCtrl.move($index, opusCtrl.opus.brandingConfig.logos, opusCtrl.StyleForm, -1)" title="Move this logo up"></button>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                        <tr>
                            <td colspan="2">
                                <button class="btn btn-sm btn-default margin-top-1 margin-bottom-1" ng-click="opusCtrl.addAnEmptyLogo()" ><i class="fa fa-plus"></i> Add a logo from link</button>
                                <button class="btn btn-sm btn-default margin-top-1 margin-bottom-1 ignore-save-warning" ng-model="opusCtrl.showUpload.logo" btn-checkbox >Upload a file</button>
                                <div ng-if="opusCtrl.showUpload.logo" class="clearfix">
                                    <image-upload opus="opusCtrl.opus" on-upload-complete="opusCtrl.logoUploaded"
                                                  url-generator="opusCtrl.generateFileUploadUrl" show-metadata="false" disable-source="true"></image-upload>
                                </div>
                                <div class="small">Recommended maximum width is 275px. There is no height limit.</div>
                            </td>
                        </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="form-group">
                    <label>Thumbnail</label>
                    <input type="text" class="form-control" name="thumbnailUrl" ng-model="opusCtrl.opus.brandingConfig.thumbnailUrl"/>
                    <button class="btn btn-sm btn-default margin-top-1 ignore-save-warning" ng-model="opusCtrl.showUpload.thumbnail" btn-checkbox >Upload a file</button>
                    <div ng-if="opusCtrl.showUpload.thumbnail" class="clearfix">
                        <image-upload opus="opusCtrl.opus" on-upload-complete="opusCtrl.thumbnailUploaded"
                                      url="{{opusCtrl.imageUploadUrl + 'thumbnail'}}" show-metadata="false" disable-source="true"></image-upload>
                    </div>
                    <div class="small">Recommended size 160px by 100px.</div>
                </div>

                <div class="form-group">
                    <label>Short Name</label>
                    <input type="text" class="form-control" name="shortName" ng-model="opusCtrl.opus.shortName" ng-change="opusCtrl.showShortNameTip()"/> <br/>
                    <span class="small">The URL for your collection will be http://${request.serverName}/opus/{{opusCtrl.opus.shortName ? opusCtrl.opus.shortName : opusCtrl.opus.uuid | lowercase}}</span>
                    <div class="well small" ng-show="opusCtrl.shortNameTipVisible">
                        <i class="fa fa-info-circle color--medium-blue margin-bottom-1"></i>
                        <p/>
                        NOTE: Changing the Short Name of your collection will change the URL used to access it. This will affect any existing bookmarks, and may affect some of the collection statistics.
                        <p/>
                        When changing the Short Name, save the Branding section and leave the Edit Configuration page, then return - this will ensure that your browser is using the new URL.
                    </div>
                </div>

                <div class="form-group">
                    <label>Email contact</label>
                    <input type="text" class="form-control" name="email" ng-model="opusCtrl.opus.contact.email"/> <br/>
                    <span class="small">Setting the email contact will add a 'contact by email' icon to the page footer</span>
                </div>

                <div class="form-group">
                    <label for="facebook">Facebook URL</label>
                    <input id="facebook" type="text" class="form-control" name="facebook" ng-model="opusCtrl.opus.contact.facebook"/> <br/>
                    <span class="small">Setting the facebook URL will add a 'contact by facebook' icon to the page footer</span>
                </div>

                <div class="form-group">
                    <label for="twitter">Twitter URL</label>
                    <input id="twitter" type="text" class="form-control" name="twitter" ng-model="opusCtrl.opus.contact.twitter"/> <br/>
                    <span class="small">Setting the twitter URL will add a 'contact by twitter' icon to the page footer</span>
                </div>

                <div class="form-group">
                    <label for="copyright">Copyright statement</label>

                    <div class="input-group">
                        <span class="input-group-addon">&copy;</span>
                        <input id="copyright" type="text" class="form-control" name="copyright" ng-model="opusCtrl.opus.copyrightText"/> <br/>
                    </div>
                    <span class="small">e.g. &copy; {{opusCtrl.opus.title}}, 2015. To be displayed at the bottom of each profile page</span>
                </div>

                <div class="form-group">
                    <label for="footerText">Footer text</label>

                    <textarea id="footerText" ng-model="opusCtrl.opus.footerText" rows="4"
                              class="form-control" ng-maxlength="300" maxlength="300"></textarea>
                    <span class="small">To be displayed in the page footer</span>
                </div>

                <div class="form-group">
                    <label>ISSN</label>
                    <input type="text" class="form-control" name="issn" ng-model="opusCtrl.opus.brandingConfig.issn" ng-minlength="8" ng-maxlength="8"/>
                    <div class="small">Value entered must be <b>8 characters</b> long without hyphen. </div>
                </div>

                <div class="form-group">
                    <label for="footerText">License - short description</label>

                    <textarea id="licenseShort" ng-model="opusCtrl.opus.brandingConfig.shortLicense" rows="4"
                              class="form-control" ng-maxlength="100" maxlength="100" ckeditor="richTextFullToolbar"></textarea>
                    <div class="small">The text described here will appear on the footer. The maximum characters permitted is 100.</div>
                    <div class="small italics">Characters remaining: {{100 - (opusCtrl.opus.brandingConfig.shortLicense | plainText | replaceUnicodeWithSpace).length}}</div>
                </div>

                <div class="form-group">
                    <label for="footerText">License - long description</label>

                    <textarea id="pdfLicense" ng-model="opusCtrl.opus.brandingConfig.pdfLicense" rows="4"
                              class="form-control" ng-maxlength="500" maxlength="500"></textarea>
                    <div class="small">License details entered here will appear when profile is exported to PDF. The maximum characters permitted is 500.</div>
                    <div class="small italics">Characters remaining: {{500 - (opusCtrl.opus.brandingConfig.pdfLicense || '').length}}</div>
                </div>
            </div>
        </div>
    </div>

    <div class="panel-footer">
        <div class="row">
            <div class="col-md-12">
                <save-button ng-click="opusCtrl.saveOpus(opusCtrl.StyleForm)" form="opusCtrl.StyleForm"></save-button>
            </div>
        </div>
    </div>
</div>