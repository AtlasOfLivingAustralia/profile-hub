<div class="card" ng-form="AuthForm" ng-cloak>
    <div class="card-header">
        <a name="authorship">
            <h4 class="section-panel-heading">Authorship and attribution controls</h4>
            <p:help help-id="opus.edit.authorship"/>
        </a>
    </div>

    <div class="card-body">
        <div class="row">
            <div class="col-sm-12">
                <div class="checkbox">
                    <label for="fineGrainedAttribution" class="inline-label">
                        <input id="fineGrainedAttribution" type="checkbox" name="allowFineGrainedAttribution"
                               ng-model="opusCtrl.opus.allowFineGrainedAttribution" ng-false-value="false">
                        Show contributors and editors for attributes.
                    </label>
                </div>

                <div class="form-group">
                    <label for="citation">Citation template</label>

                    <textarea id="citation" ng-model="opusCtrl.opus.citationProfile" rows="4"
                              class="form-control" ng-maxlength="500" maxlength="500"></textarea>
                    <div class="small">
                        Create a citation template using the given keywords - $Profile(Profile name),
                    $Year(Profile publication year), $Url(Profile url), $Today(Today's date), $Author(Profile author),
                    $Editor(Profile editor) and other vocabulary terms
                    </div>
                    <div class="small italics">Characters remaining: {{500 - (opusCtrl.opus.citationProfile || '').length}}</div>
                </div>

            </div>
        </div>
    </div>

    <div class="card-footer">
        <div class="row">
            <div class="col-md-12">
                <save-button ng-click="opusCtrl.saveOpus(AuthForm)" form="AuthForm"></save-button>
            </div>
        </div>
    </div>

</div>

<a name="authorshipVocab"></a>
<vocabulary-editor vocab-id="opusCtrl.opus.authorshipVocabUuid" vocab-name="Acknowledgements vocabulary" help-url="<p:helpUrl help-id="opus.edit.acknowledgementVocabulary"/>"
                   all-mandatory="true" allow-mandatory="false" allow-reordering="false" allow-categories="false"></vocabulary-editor>