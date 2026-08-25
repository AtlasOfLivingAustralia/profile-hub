<div class="card" ng-form="KeyForm" ng-cloak>
    <div class="card-header">
        <a name="key">
            <h4 class="section-panel-heading">Keys configuration</h4>
            <p:help help-id="opus.edit.keys"/>
        </a>
    </div>

    <div class="card-body">
        <div class="row">
            <div class="col-sm-12">
                <div class="form-group">
                        <label>
                            Select the <a href="${grailsApplication.config.keybase.web.url}">Keybase</a> Project for this collection:
                        </label>
                        <select ng-options="project.project_name for project in opusCtrl.keybaseProjects | orderBy:'project_name'"
                                ng-model="opusCtrl.selectedKeybaseProject" class="form-control">
                            <option value="">--- Select one ---</option>
                        </select>
                </div>
            </div>
        </div>
    </div>

    <div class="card-footer">
        <div class="row">
            <div class="col-md-12">
                <save-button ng-click="opusCtrl.saveOpus(KeyForm)" form="KeyForm"></save-button>
            </div>
        </div>
    </div>
</div>