<div class="card ${edit?'':'panel-override'}"  ng-controller="ProfileController as profileCtrl" ng-cloak ng-form="BiblioForm"
     ng-init="profileCtrl.loadProfile()"
     ng-show="profileCtrl.profile.bibliography.length > 0 || !profileCtrl.readonly()">
    <navigation-anchor anchor-name="{{profileCtrl.readonly() ? 'view_' : 'edit_'}}bibliography" title="Bibliography" condition="profileCtrl.profile.bibliography && profileCtrl.profile.bibliography.length > 0 || !profileCtrl.readonly()"></navigation-anchor>

    <div class="card-header">
        <div class="row">
            <div class="col-sm-12">
                <h4 class="section-panel-heading">Bibliography</h4>
                <p:help help-id="profile.edit.bibliography" show="${edit}" collection-override="${opus?.help?.bibliographyLink}"/>
            </div>
        </div>
    </div>

    <div class="card-body">

        <div class="row" ng-repeat="bibliography in profileCtrl.profile.bibliography">
            <div class="col-sm-9">
                <div data-ng-bind-html="bibliography.text | sanitizeHtml" ng-show="!bibliography.edit" class="inline-block"></div>

                <div class="form-group" ng-show="bibliography.edit">
                    <label for="bibliographyText" class="screen-reader-label">Bibliography text</label>
                    <textarea id="bibliographyText" ng-model="bibliography.text" ckeditor="richTextSmall"
                              dirty-check changed="profileCtrl.isDirty()"
                              required="required"></textarea>
                </div>
            </div>

            <div class="col-sm-3" ng-class="!bibliography.edit ? '' : 'padding-top-1 margin-top-1'" ng-show="!profileCtrl.readonly()">
                <button class="btn btn-link fa fa-edit"
                        ng-click="profileCtrl.editBibliography($index, BiblioForm)"
                        title="Edit this bibliography entry"></button>
                <button class="btn btn-link fa fa-trash-o color--red"
                        ng-click="profileCtrl.deleteBibliography($index, BiblioForm)"
                        title="Delete this bibliography entry"></button>
                <button class="btn btn-link fa fa-arrow-down"
                        ng-if="!$last"
                        ng-click="profileCtrl.moveBibliographyDown($index, BiblioForm)"
                        title="Move this bibliography entry down"></button>
                <button class="btn btn-link fa fa-arrow-up" ng-if="!$first"
                        ng-click="profileCtrl.moveBibliographyUp($index, BiblioForm)"
                        title="Move this bibliography entry up"></button>
            </div>
        </div>
    </div>

    <div class="card-footer" ng-if="!profileCtrl.readonly()">
        <div class="row">
            <div class="col-md-12">
                <button class="btn btn-outline-secondary" ng-click="profileCtrl.addBibliography(BiblioForm)"><i
                        class="fa fa-plus"></i> Add bibliography</button>
                <save-button ng-click="profileCtrl.saveProfile()" dirty="profileCtrl.isDirty()"></save-button>
            </div>
        </div>
    </div>
</div>
