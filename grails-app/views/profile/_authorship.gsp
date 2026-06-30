<div class="card" ng-controller="ProfileController as profileCtrl" ng-init="profileCtrl.loadProfile()"
     ng-form="AuthorForm" ng-cloak ng-if="!profileCtrl.readonly() || profileCtrl.authorshipCount > 1">
    <navigation-anchor anchor-name="{{profileCtrl.readonly() ? 'view_' : 'edit_'}}authorship" title="{{profileCtrl.acknowledgementsSectionTitle}}" condition="!profileCtrl.readonly() || profileCtrl.authorshipCount > 0"></navigation-anchor>

    <div class="card-header">
        <div class="row">
            <div class="col-sm-12">
                <h4 class="section-panel-heading">{{profileCtrl.acknowledgementsSectionTitle}}</h4>
                <p:help help-id="profile.edit.authors" show="${edit}" collection-override="${opus?.help?.authorsAndAcknowledgementsLink}"/>
            </div>
        </div>
    </div>

    <div class="card-body">
        <div class="row">
            <div class="col-sm-12">
                <div class="row section-no-para"
                     ng-repeat="authorship in profileCtrl.profile.authorship | filter:{category: '!Author'}:true"
                     ng-if="profileCtrl.readonly() && (authorship.text)">
                    <h5>{{authorship.category}}</h5>
                    {{authorship.text}}
                </div>

                <div ng-repeat="authorship in profileCtrl.profile.authorship"
                     ng-if="!profileCtrl.readonly()">
                    <div class="row">
                        <div class="col-sm-12">
                            <div class="form-group">
                                <label>Type of contribution</label>
                                <select ng-show="profileCtrl.authorVocabStrict"
                                        ng-disabled="authorship.category == 'Author'"
                                        ng-model="authorship.category" class="form-control">
                                    <option value="">--- Select one ---</option>
                                    <option ng-repeat="term in profileCtrl.authorVocab | orderBy:'toString()'"
                                            value="{{term.name}}"
                                            ng-selected="authorship.category == term.name">{{term.name}}</option>
                                </select>
                                <input type="text"
                                       autocomplete="off"
                                       required
                                       typeahead="term.name as term.name for term in profileCtrl.authorVocab | filter: $viewValue"
                                       class="form-control"
                                       ng-model="authorship.category"
                                       ng-show="!profileCtrl.authorVocabStrict"
                                       ng-disabled="authorship.category == 'Author'"/>
                            </div>

                            <div class="form-group">
                                <label for="text">Name</label>
                                <textarea id="text" ng-model="authorship.text" rows="3" class="form-control"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-12">
                            <button class="btn btn-danger float-end"
                                    ng-click="profileCtrl.deleteAuthorship($index, AuthorForm)"
                                    ng-if="authorship.category != 'Author'" style="margin-bottom: 10px">Delete</button>
                        </div>
                    </div>
                    <hr ng-if="!$last"/>
                </div>
            </div>
        </div>
    </div>

    <div class="card-footer" ng-if="!profileCtrl.readonly()">
        <div class="row">
            <div class="col-md-12">
                <button class="btn btn-outline-secondary" ng-click="profileCtrl.addAuthorship(AuthorForm)"><i
                        class="fa fa-plus"></i> Add section</button>
                <save-button ng-click="profileCtrl.saveAuthorship(AuthorForm)" form="AuthorForm"></save-button>
            </div>
        </div>
    </div>
</div>