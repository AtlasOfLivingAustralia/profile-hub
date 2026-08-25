<div class="card" ng-form="HelpLinks" ng-cloak>
    <div class="card-header">
        <a name="helplinks">
            <h4 class="section-panel-heading">Help links</h4>
        </a>
    </div>

    <div class="card-body">
        <div class="row">
            <div class="col-sm-12">

                <div class="form-group">
                    <label>Home link</label>
                    <input id="opusLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.opusLink">
                </div>

                <div class="form-group">
                    <label>Search link</label>
                    <input id="searchLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.searchLink">
                </div>

                <div class="form-group">
                    <label>Browse link</label>
                    <input id="browseLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.browseLink">
                </div>

                <div class="form-group">
                    <label>Identify link</label>
                    <input id="identifyLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.identifyLink">
                </div>

                <div class="form-group">
                    <label>Filter link</label>
                    <input id="filterLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.filterLink">
                </div>

                <div class="form-group">
                    <label>Documents link</label>
                    <input id="documentsLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.documentsLink">
                </div>

                <div class="form-group">
                    <label>Reports link</label>
                    <input id="reportsLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.reportsLink">
                </div>

                <div class="form-group">
                    <label>About link</label>
                    <input id="aboutLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.aboutLink">
                </div>

                <div class="form-group">
                    <label>Glossary link</label>
                    <input id="glossaryLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.glossaryLink">
                </div>

                <div class="form-group">
                    <label>Profile edit link</label>
                    <input id="profileEditLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.profileEditLink">
                </div>

                <div class="form-group">
                    <label>Profile view link</label>
                    <input id="profileViewLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.profileViewLink">
                </div>

                <h4>Profile's attribute help links</h4>

                <div class="form-group">
                    <label>Attribute link</label>
                    <input id="attributeLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.attributeLink">
                </div>

                <div class="form-group">
                    <label>Nomenclature link</label>
                    <input id="nomenclatureLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.nomenclatureLink">
                </div>

                <div class="form-group">
                    <label>Links link</label>
                    <input id="linksLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.linksLink">
                </div>

                <div class="form-group">
                    <label>Biodiversity Heritage Library references link</label>
                    <input id="bHLReferenceLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.bHLReferenceLink">
                </div>

                <div class="form-group">
                    <label>Specimens link</label>
                    <input id="specimensLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.specimensLink">
                </div>

                <div class="form-group">
                    <label>Bibliography link</label>
                    <input id="bibliographyLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.bibliographyLink">
                </div>

                <div class="form-group">
                    <label>Conservation & sensitivity lists link</label>
                    <input id="conservationSensitivityListsLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.conservationSensitivityListsLink ">
                </div>

                <div class="form-group">
                    <label>Feature Lists link</label>
                    <input id="featureListsLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.featureListsLink ">
                </div>


                <div class="form-group">
                    <label>Taxonomy link</label>
                    <input id="taxonomyLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.taxonomyLink">
                </div>

                <div class="form-group">
                    <label>Images link</label>
                    <input id="imagesLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.imagesLink">
                </div>

                <div class="form-group">
                    <label>Versions link</label>
                    <input id="versionsLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.versionsLink">
                </div>

                <div class="form-group">
                    <label>Authors and Acknowledgements link</label>
                    <input id="authorsAndAcknowledgementsLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.authorsAndAcknowledgementsLink">
                </div>

                <div class="form-group">
                    <label>Comments link</label>
                    <input id="commentsLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.commentsLink">
                </div>

                <div class="form-group">
                    <label>Name match link</label>
                    <input id="nameMatchLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.nameMatchLink">
                </div>

                <div class="form-group">
                    <label>Maps link</label>
                    <input id="mapsLink" type="text" class="form-control" ng-model="opusCtrl.opus.help.mapsLink">
                </div>

            </div>
        </div>
    </div>

    <div class="card-footer">
        <div class="row">
            <div class="col-md-12">
                <save-button ng-click="opusCtrl.saveOpus(HelpLinks)" form="HelpLinks"></save-button>
            </div>
        </div>
    </div>
</div>