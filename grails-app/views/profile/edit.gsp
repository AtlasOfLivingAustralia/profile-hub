<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="${grailsApplication.config.layout}"/>
    <title>Profile</title>
</head>

<body>

<div ng-controller="ProfileController as profileCtrl"
     ng-init="profileCtrl.loadProfile()">

    <a name="top"></a>
    <g:render template="/opus/banner" model="[opus: opus]"/>

    <div class="container">
        <div class="row">
            <div class="col-md-1 col-sm-1 col-xs-1 min-col">
                <profile-side-bar></profile-side-bar>
            </div>

            <div class="col-md-11 col-sm-11 col-xs-11">
                <ol class="breadcrumb" ng-cloak ng-show="profileCtrl.opus">
                    <li><a class="fa fa-home"
                           href="${request.contextPath}/opus/{{profileCtrl.opus.shortName ? profileCtrl.opus.shortName : profileCtrl.opus.uuid}}" title="{{profileCtrl.opus.title}}"></a>
                    </li>
                    <li class="font-xxsmall active" ng-if="profileCtrl.profile.classification.length == 0">{{profileCtrl.isArchived() ? profileCtrl.profile.archivedWithName : profileCtrl.profile.scientificName}}</li>
                    <span ng-if="profileCtrl.profile.classification.length > 0">
                        <taxonomy data="profileCtrl.profile.classification"
                                  opus-id="profileCtrl.opusId"
                                  layout="horizontal"
                                  limit="4"
                                  show-children="false"
                                  show-with-profile-only="true"
                                  show-infraspecific="true">
                        </taxonomy>
                    </span>
                </ol>

                <div class="row" ng-cloak>
                    <alert type="warning"
                           ng-if="profileCtrl.profile.privateMode"><span
                            class="fa fa-lock"></span>&nbsp;&nbsp;You are viewing a profile that is currently in draft. These changes will not be visible to public users until the profile is completed and the draft is released.
                    </alert>

                    <alert type="warning"
                           ng-if="profileCtrl.isArchived()">
                        <p>
                            This profile has been archived with the following explanation:
                        </p>

                        <p class="archive-comment">
                            {{profileCtrl.profile.archiveComment}}
                        </p>

                        <p>
                            If you need to reference this profile, you can do so using the last published version:

                        <div class="archived-publication">
                            <publication data="profileCtrl.profile.publications[0]" opus-id="profileCtrl.opusId"
                                         profile-id="profileCtrl.profileId"  prefix="${grailsApplication.config.doi.resolver.prefix}">
                            </publication>
                        </div>

                        <p>
                            Archived profiles will only appear in the general search results if the 'Include archived profiles' option is selected.
                            Archived profiles will NOT appear in the Browse, Quick Find, Taxonomic Tree or Subordinate Taxa lists.
                        </p>
                        <p>
                            Use the following URL to create a direct link to this profile:
                            <br/>
                            ${request.scheme}://${request.serverName}${request.serverPort ? ":" + request.serverPort : ""}${request.contextPath}/opus/{{profileCtrl.opus.uuid}}/profile/{{profileCtrl.profile.uuid}}
                        </p>
                    </alert>
                </div>

                <div class="row">
                    <div class="col-md-9" ng-cloak>
                        <h2 class="heading-large inline"><span
                                data-ng-bind-html="profileCtrl.formatName() | default:'Loading...' | sanitizeHtml"></span></h2>

                        <div class="margin-bottom-1 inline-block small" ng-show="profileCtrl.opus">
                            <a href="${grailsApplication.config.bie.base.url}/species/{{ profileCtrl.profile.guid }}"
                               ng-show="profileCtrl.profile.guid" title="View this taxon in the Atlas of Living Australia"
                               class="padding-left-1" target="_blank"><span class="fa fa-search">&nbsp;</span>ALA</a>
                            <a href="${grailsApplication.config.nsl.base.url}services/apni-format/display/{{ profileCtrl.profile.nslNameIdentifier }}"
                               ng-show="profileCtrl.profile.nslNameIdentifier"
                               title="View this name in the National Species List" class="padding-left-1" target="_blank"><span
                                    class="fa fa-search">&nbsp;</span>NSL <span
                                    ng-show="profileCtrl.nslNameStatus">[{{profileCtrl.nslNameStatus}}]</span></a>
                        </div>

                        <a href="" ng-click="profileCtrl.editName()" class="padding-left-1 small"
                           ng-show="!profileCtrl.readonly() && profileCtrl.opus" ng-class="{disabled: profileCtrl.showFormatNameControls}"><span class="fa fa-edit">&nbsp;</span>Edit name</a>

                    </div>

                    <div class="col-md-3 text-right" ng-cloak>
                        <g:render template="optionsMenu"/>
                    </div>

                </div>

                <div class="row margin-bottom-1" ng-show="profileCtrl.nslProtologue" ng-cloak>
                    <div class="col-md-12">
                        <div class="citation zero-margin" data-ng-bind-html="profileCtrl.nslProtologue | sanitizeHtml"></div>
                    </div>
                </div>

                <div class="row margin-bottom-1" ng-show="profileCtrl.profile.otherNames.length > 0" ng-cloak>
                    <div class="col-md-12">
                        <h4 class="zero-margin">{{profileCtrl.profile.otherNames.join(', ')}}</h4>
                    </div>
                </div>

                <g:if test="${!profile.archivedDate}">
                    <g:include controller="profile" action="editNamePanel" params="[opusId: params.opusId]"/>

                    <div class="row">
                        <div class="col-md-12" ng-cloak>
                            <label class="padding-left-1 small" for="nameFormatting">Profile Name Format:</label>
                            <div id="nameFormatting" class="btn-group">
                                <label class="btn btn-xs" ng-class="profileCtrl.autoFormatProfileName ? 'btn-success' : 'btn-default'"
                                       ng-model="profileCtrl.autoFormatProfileName" ng-change="profileCtrl.toggleFormatName(true, FormatNameForm)" ng-value="true"
                                       btn-radio="true" ng-disabled="profileCtrl.showNameEditControls">Auto</label>
                                <label class="btn btn-xs" ng-class="profileCtrl.autoFormatProfileName ? 'btn-default' : 'btn-danger'"
                                       ng-model="profileCtrl.autoFormatProfileName" ng-change="profileCtrl.toggleFormatName(false, FormatNameForm)" ng-value="false" ng-click="profileCtrl.formatNameEdit()"
                                       btn-radio="false" ng-disabled="profileCtrl.showNameEditControls">Manual</label>
                            </div>
                        </div>
                    </div>
                    <g:include controller="profile" action="formatNamePanel" params="[opusId: params.opusId]"/>

                    <g:include controller="profile" action="auditHistoryPanel" params="[opusId: params.opusId]"/>

                    <g:if test="${!edit}">
                        <g:include controller="profile" action="nomenclaturePanel" params="[opusId: params.opusId]"/>
                    </g:if>

                    <div class="row margin-bottom-1 top">
                        <g:render template="map" model="[allowStaticImage: true]"/>
                        <div class="top col-md-6 col-sm-12" ng-controller="ImagesController as imageCtrl" ng-init="imageCtrl.init('${edit}')">
                            <g:render template="primaryImage" params="[opusId: params.opusId]"/>
                        </div>
                    </div>
                </g:if>

                <g:if test="${!profile.privateMode || (params.currentUser && params.isOpusReviewer)}">
                    <div class="row">
                        <div class="col-md-12" ng-cloak>
                            <tabset ng-class="!profileCtrl.readonly() || (profileCtrl.opus.keybaseProjectId && profileCtrl.hasKeybaseKey) || (profileCtrl.profile.attachments.length > 0) ? '' : 'single-tabbed-panel'">
                                <tab heading="Details" class="font-xxsmall" managed-tab>
                                    <div class="row">
                                        <div class="col-md-12">
                                            <profile-status opus="profileCtrl.opus" profile="profileCtrl.profile" readonly="profileCtrl.readonly"></profile-status>
                                            <g:include controller="profile" action="attributesPanel"
                                                       params="[opusId: params.opusId]"/>
                                            <g:include controller="profile" action="nomenclaturePanel"
                                                       params="[opusId: params.opusId]"/>
                                            <g:include controller="profile" action="linksPanel"
                                                       params="[opusId: params.opusId]"/>
                                            <g:include controller="profile" action="bhlLinksPanel"
                                                       params="[opusId: params.opusId]"/>
                                            <g:include controller="profile" action="specimenPanel"
                                                       params="[opusId: params.opusId]"/>
                                            <g:include controller="profile" action="classificationPanel"
                                                       params="[opusId: params.opusId]"/>
                                            <g:include controller="profile" action="bibliographyPanel"
                                                       params="[opusId: params.opusId]"/>
                                            <g:if test="${!profile.archivedDate}">
                                                <g:include controller="profile" action="listsPanel"
                                                           params="[opusId: params.opusId]"/>
                                                <g:include controller="profile" action="taxonPanel"
                                                           params="[opusId: params.opusId]"/>
                                                <g:include controller="profile" action="imagesPanel"
                                                           params="[opusId: params.opusId]"/>
                                                <multimedia profile="profileCtrl.profile" readonly="profileCtrl.readonly"></multimedia>
                                            </g:if>
                                            <g:include controller="profile" action="publicationsPanel"
                                                       params="[opusId: params.opusId]"/>
                                            <g:include controller="profile" action="authorPanel"
                                                       params="[opusId: params.opusId]"/>
                                            <g:if test="${params.isOpusReviewer}">
                                                <g:include controller="profile" action="commentsPanel"
                                                           params="[opusId: params.opusId]"/>
                                            </g:if>
                                        </div>
                                    </div>
                                </tab>
                                <tab heading="Key" class="font-xxsmall" ng-show="profileCtrl.opus.keybaseProjectId && profileCtrl.hasKeybaseKey" managed-tab select-to-initialise="true">
                                    <div class="row" ng-if="profileCtrl.canInitialiseKeyplayer()">
                                        <key-player taxon-name="profileCtrl.profile.scientificName" style="display: block"
                                                    opus-id="profileCtrl.opus.uuid"
                                                    only-include-items="profileCtrl.masterListKeybaseItems"
                                                    keybase-url="${g.createLink(controller:'keybase', action:'keyLookup', absolute: true)}"
                                                    key-lookup-url="${request.scheme}://${request.serverName}${request.serverPort ? ":" + request.serverPort : ""}${request.contextPath}/keybase/findKey"
                                                    profile-url="${request.scheme}://${request.serverName}${request.serverPort ? ":" + request.serverPort : ""}${request.contextPath}/opus/{{profileCtrl.opus.shortName ? profileCtrl.opus.shortName : profileCtrl.opus.uuid}}/profile"></key-player>
                                    </div>
                                </tab>
                                <tab heading="Documents" class="font-xxsmall" ng-show="!profileCtrl.readonly() || profileCtrl.profile.attachments.length > 0" managed-tab>
                                    <g:render template="/common/attachments" model="[hideHeading: true]"/>
                                </tab>
                            </tabset>
                        </div>
                    </div>
                </g:if>


                <div class="row margin-top-1" ng-show="!profileCtrl.readonly()">
                    <div class="col-md-12 padding-top-1">
                        <save-all class="pull-right"></save-all>
                    </div>
                </div>

                <div class="row margin-top-1">
                    <div class="col-md-12 col-xs-12 col-lg-12 small text-center" ng-cloak>
                        <p><span ng-show="profileCtrl.opus.copyrightText">&copy; {{ profileCtrl.opus.copyrightText }}.</span> <a
                                href="${request.contextPath}/opus/{{profileCtrl.opus.shortName ? profileCtrl.opus.shortName : profileCtrl.opus.uuid}}/about##copyright"
                                target="_blank">Copyright Notice</a>.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</body>

</html>



