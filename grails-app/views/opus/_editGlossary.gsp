<div class="card" ng-controller="GlossaryController as glossaryCtrl" ng-cloak>
    <form ng-submit="glossaryCtrl.upload()" role="form">
        <div class="card-header">
            <a name="glossary">
                <h4 class="section-panel-heading">Glossary</h4>
                <p:help help-id="opus.edit.glossary"/>
            </a>
        </div>

        <div class="card-body">
            <div class="row">
                <div class="col-sm-12">
                    <p>
                        Upload a CSV file containing your glossary.
                    </p>

                    <p>
                        NOTE: This will completely replace any existing glossary items. To add, edit or delete individual items, go to the glossary page.
                    </p>

                    <p>
                        The CSV must have columns "term","description".
                    </p>

                    <div class="form-group">
                        <label for="file">.CSV file input</label>
                        <br/>
                        <span class="btn btn-outline-secondary btn-file">
                            Choose file
                            <input type="file" name="csvFile" id="file" ng-model="glossaryCtrl.newFile"
                                   ngf-select="" required/>
                        </span>
                        <span class="font-xsmall">{{ glossaryCtrl.newFile[0].name }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="card-footer">
            <div class="row">
                <div class="col-md-12">
                    <button class="btn btn-primary float-end">Upload</button>
                </div>
            </div>
        </div>
    </form>
</div>