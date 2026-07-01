<div class="row">
    <div class="col-lg-12 col-md-12 col-12">
        <h3 class="heading-medium">Browse by category</h3>
    </div>
</div>
<div class="padding-top-1 row" ng-controller="BrowseController as browseCtrl" ng-init="browseCtrl.getTaxonLevels()" ng-cloak>
    <a name="browseTop"></a>
    <div class="col-lg-3 col-md-4 col-12">
        <!-- Side menu -->
        <div class="side-menu">
            <nav class="navbar navbar-light bg-light" role="navigation">
                <accordion close-others="true">
                    <accordion-group ng-repeat="taxon in browseCtrl.orderedTaxonLevels | orderBy:order" ng-if="browseCtrl.taxonLevels[taxon.key] > 0">
                        <accordion-heading>
                            <i class="fa fa-circle-thin"></i>
                        &emsp;<a ng-href="#" title="{{ taxon.help }}"
                                 ng-click="browseCtrl.searchByTaxonLevel(taxon.key)">{{taxon.name}} ({{browseCtrl.taxonLevels[taxon.key] ? browseCtrl.taxonLevels[taxon.key] : '0'}})
                            <span ng-if="taxon.help" class="fa fa-question-circle small superscript"></span>
                            <span class="caret float-end"></span></a>
                        </accordion-heading>

                        <div class="form-group">
                            <label for="filter" class="screen-reader-label">Filter by name starting with...</label>
                            <input id="filter" type="text"
                                   class="form-control form-control-sm ignore-save-warning"
                                   placeholder="Name starting with..."
                                   ng-change="browseCtrl.searchByTaxonLevel(taxon.key)"
                                   name="filter"
                                   autocomplete="off"
                                   ng-required="true"
                                   ng-model="browseCtrl.filters[taxon.key]">
                        </div>

                        <div ng-repeat="(name, count) in browseCtrl.taxonResults[taxon.key]" class="accordion-item">
                            <a ng-href="" du-smooth-scroll="browseTop"
                               ng-click="browseCtrl.searchByTaxon(taxon.key, name, count)">{{name | capitalize}} ({{count}})</a>
                            <a ng-href=""
                               ng-if="$index >= browseCtrl.MAX_FACET_ITEMS - 1 && $last && $index < browseCtrl.taxonLevels[taxon.key] - 1"
                               ng-click="browseCtrl.searchByTaxonLevel(taxon.key, $index)"><p>View more...</p>
                            </a>
                        </div>
                    </accordion-group>
                </accordion>
            </nav>

            <nav class="navbar navbar-light bg-light" role="navigation">
                <!-- Brand and toggle get grouped for better mobile display -->
                <div class="navbar-header">
                    <div class="brand-wrapper">

                        <!-- Brand -->
                        <div class="brand-name-wrapper">
                            <span class="navbar-brand">Quick browse</span>
                        </div>

                        <!-- Search body -->
                        <div id="search" class="card">
                            <div class="card-body">
                                <form class="navbar-form" role="search">
                                    <div class="form-group">
                                        <input type="text" class="form-control ignore-save-warning" placeholder="e.g. Acacia binervata"
                                               ng-change="browseCtrl.searchByScientificName()"
                                               name="searchTerm"
                                               autocomplete="off"
                                               ng-enter="browseCtrl.selectSingleResult()"
                                               ng-model="browseCtrl.searchTerm"></div>
                                    <button type="submit" class="btn btn-outline-secondary ">
                                        <span class="fa fa-search"></span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    </div>


    <div class="col-lg-9 col-md-8 col-12" ng-cloak>
        <div ng-show="!browseCtrl.selectedTaxon.name && !browseCtrl.searchTerm">
            <p>
                Browse the taxonomic hierarchy using the navigation pane <span class="d-none d-md-inline">to the left</span><span class="d-inline d-md-none">above</span>. You can also jump to a particular taxon in the hierarchy by typing the beginning of the name into the ‘Quick browse’ option at the bottom of the pane.
            </p>
            <p>
                Alternatively, you can select the ‘Search’ navigator at the top of this page and perform a text or name-based search.
            </p>
            <p ng-if="opusCtrl.opus.keybaseKeyId">
                The ‘Identify’ button on the homepage will help you select the appropriate profile using dichotomous keys.
            </p>
        </div>

        <div class="row bottom-border" ng-show="browseCtrl.selectedTaxon.name || browseCtrl.searchTerm">
            <div class="col-md-6">
                <h4 ng-show="browseCtrl.searchTerm && !browseCtrl.selectedTaxon.name">
                    Results for "{{browseCtrl.searchTerm}}*"
                </h4>
                <h4 ng-show="browseCtrl.selectedTaxon.name && browseCtrl.selectedTaxon.level != browseCtrl.selectedTaxon.name">
                    {{browseCtrl.selectedTaxon.level | capitalize}}:
                    <span ng-show="browseCtrl.selectedTaxon.profileExist">
                        <a href="${request.contextPath}/opus/{{ browseCtrl.opusId }}/profile/{{ browseCtrl.selectedTaxon.name | enc }}"
                           target="_self" class="scientific-name">
                            {{browseCtrl.selectedTaxon.name | capitalize}}
                        </a>
                    </span>
                    <span ng-show="!browseCtrl.selectedTaxon.profileExist">
                        {{browseCtrl.selectedTaxon.name | capitalize}}
                    </span>

                    <small>({{browseCtrl.selectedTaxon.count}} entries)</small>
                </h4>
                <h4 ng-show="browseCtrl.selectedTaxon.name && browseCtrl.selectedTaxon.level == browseCtrl.selectedTaxon.name">
                    {{browseCtrl.selectedTaxon.level | capitalize}} <small>({{browseCtrl.selectedTaxon.count}} entries)</small>
                </h4>
            </div>
            <div class="col-md-6">
                <div class="float-end padding-top-1">
                    <label for="sort" class="compact-label small">Sort by</label>
                    <select id="sort" ng-options="sort for sort in browseCtrl.sortOptions" ng-change="browseCtrl.changeSortOrder()"
                            ng-model="browseCtrl.sortOption" class="ignore-save-warning">
                    </select>
                </div>
            </div>
        </div>

        <div class="table-responsive" ng-show="browseCtrl.profiles.length > 0">
            <table class="table table-striped">
                <tr ng-repeat="profile in browseCtrl.profiles">
                    <td>{{profile.rank | capitalize | default:'Unknown'}}:</td>
                    <td>
                        <a href="${request.contextPath}/opus/{{ browseCtrl.opusId }}/profile/{{ profile.scientificName | enc }}"
                           target="_self" class="scientific-name">{{profile.scientificName}}</a>
                    </td>
                </tr>
            </table>
            <pagination total-items="browseCtrl.selectedTaxon.count"
                        ng-change="browseCtrl.searchByTaxon(browseCtrl.selectedTaxon.level, browseCtrl.selectedTaxon.name, browseCtrl.selectedTaxon.count, (browseCtrl.page - 1) * browseCtrl.pageSize)"
                        ng-model="browseCtrl.page" max-size="10" class="pagination-sm"
                        items-per-page="browseCtrl.pageSize"
                        previous-text="Prev" boundary-links="true"
                        ng-show="browseCtrl.selectedTaxon.count > browseCtrl.pageSize"></pagination>
        </div>
    </div>
</div>