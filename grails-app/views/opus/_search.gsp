<div ng-controller="SearchController as searchCtrl" ng-cloak>

    <div class="col-12">
        <h3 class="heading-medium">Search for profile(s)</h3>

        <div class="input-group">
            <button type="button" class="btn btn-outline-secondary dropdown-toggle btn-lg search-type-control" data-bs-toggle="dropdown"
                    aria-haspopup="true" aria-expanded="false">
                {{ searchCtrl.isScientificName() ? 'by scientific name' : searchCtrl.isCommonName() ? 'by common name' : 'containing text' }} <span class="caret"></span>
            </button>
            <ul class="dropdown-menu">
                <li><a ng-click="searchCtrl.setSearchOption('scientificname')">by scientific name</a></li>
                <li><a ng-click="searchCtrl.setSearchOption('commonname')">by common name</a></li>
                <li><a ng-click="searchCtrl.setSearchOption('text')">containing text</a></li>
            </ul>
            <input id="searchTerm"
                   ng-model="searchCtrl.searchTerm"
                   ng-enter="searchCtrl.search()"
                   name="searchTerm"
                   class="form-control form-control-lg ignore-save-warning"
                   autocomplete="off"
                   type="text"
                   typeahead-editable="true"
                   typeahead="profile.scientificName as profile.scientificName for profile in searchCtrl.autoCompleteSearchByScientificName($viewValue) | filter:$viewValue | limitTo:10" />
            <button class="btn btn-primary btn-lg search-buttons-responsive-large-screen" type="button" ng-click="searchCtrl.search()">Search</button>
            <button class="btn btn-outline-secondary btn-lg search-buttons-responsive-large-screen" type="button" ng-click="searchCtrl.clearSearch()" title="Clear search"><span class="fa fa-trash"></span></button>
            <button class="btn btn-outline-secondary btn-lg search-buttons-responsive-small-screen" type="button" ng-click="searchCtrl.search()" title="Search"><span class="fa fa-search"></span></button>
        </div>
        <div class="card card-body margin-top-1">
            <div class="checkbox inline-block padding-right-1" ng-hide="searchCtrl.searchOptions.nameOnly">
                <label for="matchAll" class="inline-label">
                    <input id="matchAll" type="checkbox" name="matchAll" class="ignore-save-warning"
                           ng-model="searchCtrl.searchOptions.matchAll" ng-false-value="false">
                    Must contain all terms
                </label>
            </div>
            <div class="checkbox inline-block padding-right-1">
                <label for="hideStubs" class="inline-label">
                    <input id="hideStubs" type="checkbox" name="hideStubs" class="ignore-save-warning"
                           ng-model="searchCtrl.searchOptions.hideStubs" ng-false-value="false">
                    Hide empty profile
                </label>
            </div>
        </div>
    </div>

    <div ng-show="searchCtrl.searchResults.items.length == 0">
        <div class="col-12">
            No results containing your search terms were found.
        </div>
    </div>

    <div ng-show="searchCtrl.searchResults.items.length > 0">
        <div class="col-12">
            Showing {{ searchCtrl.searchOptions.offset + 1 }} to {{ searchCtrl.searchOptions.offset + searchCtrl.searchResults.items.length }} of {{ searchCtrl.searchResults.total }} results, sorted by relevance.
        </div>

        <div class="col-12 padding-top-1" ng-repeat="profile in searchCtrl.searchResults.items" ng-cloak>
            <div class="col-md-2 col-sm-12 col-12">
                <a href="${request.contextPath}/opus/{{ profile.opusShortName ? profile.opusShortName : profile.opusId }}/profile/{{ profile.archivedDate ? profile.uuid : profile.scientificName | enc }}"
                   target="_self">
                    <div class="imgConSmall" in-view="searchCtrl.loadImageForProfile(profile.uuid)" in-view-options="{ debounce: 100 }">
                        <div ng-show="profile.image.url">
                            <img ng-src="{{profile.image.url}}"
                                 ng-if="profile.image.url && profile.image.type.name == 'OPEN'"
                                 class="thumbnail"/>
                            <img ng-src="${request.contextPath}{{profile.image.url}}"
                                 ng-if="profile.image.url && profile.image.type.name != 'OPEN'"
                                 class="thumbnail"/>
                        </div>
                        <asset:image src="not-available.png"
                             ng-hide="profile.image.url || profile.image.status == 'checking' || profile.image.status == 'not-checked'" class="thumbnail"
                             alt="There is no image for this profile"/>
                        <div class="fa fa-spinner fa-spin" ng-show="profile.image.status != 'checked'"></div>
                    </div>
                </a>
            </div>

            <div ng-class="searchCtrl.opusId ? 'col-md-10 col-sm-12 col-12' : 'col-md-8 col-sm-12 col-12'">
                <h4 class="inline-block"><a href="${request.contextPath}/opus/{{ profile.opusShortName ? profile.opusShortName : profile.opusId }}/profile/{{ profile.archivedDate ? profile.uuid : profile.scientificName | enc }}"
                                            target="_self"><span data-ng-bind-html="searchCtrl.formatName(profile) | sanitizeHtml"></span></a></h4>
                <div class="inline-block padding-left-1" ng-show="profile.rank">({{profile.rank | capitalize}})</div>
                <div class="inline-block padding-left-1" ng-show="profile.matchInfo.reason">(<span data-ng-bind-html="searchCtrl.formatReason(profile) | sanitizeHtml"></span>)</div>

                <div class="font-xsmall" ng-show="profile.otherNames"><h5><span ng-repeat="name in profile.otherNames">{{ name.text | capitalize }}<span ng-show="!$last">, </span></span></h5></div>

                <div class="font-xsmall" ng-show="profile.description"><span ng-repeat="description in profile.description">{{ description.text | words: 100 }}<span ng-show="!$last">, </span></span></div>

                <div class="font-xsmall" ng-show="profile.profileStatus == 'Empty'"><uib-alert type="info"><i class="fa fa-exclamation"></i> This profile is a stub.</uib-alert></div>
            </div>

            <div class="col-md-2 col-sm-12 col-12" ng-show="!searchCtrl.opusId">
                {{profile.opusName}}
            </div>

            <div class="col-12">
                <hr/>
            </div>

        </div>
        <pagination total-items="searchCtrl.searchResults.total"
                    ng-change="searchCtrl.search(searchCtrl.pageSize, (searchCtrl.page - 1) * searchCtrl.pageSize)"
                    ng-model="searchCtrl.page" max-size="10" class="pagination-sm"
                    items-per-page="searchCtrl.pageSize"
                    previous-text="Prev" boundary-links="true"
                    ng-show="searchCtrl.searchResults.total > searchCtrl.pageSize"></pagination>
    </div>
</div>
