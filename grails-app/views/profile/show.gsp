<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="${grailsApplication.config.layout}"/>
    <title>Profile</title>

    <r:require modules="profiles, map, images_plugin"/>

</head>

<body>

<div class="row" ng-controller="ProfileController as profileCtrl"
     ng-init="profileCtrl.loadProfile()">

    <a name="top"></a>

    <div class="col-md-1 col-sm-1 col-xs-1 min-col">
        <profile-side-bar></profile-side-bar>
    </div>

    <div class="col-md-11 col-sm-11 col-xs-11">
        <ol class="breadcrumb" ng-cloak ng-show="profileCtrl.opus">
            <li><a class="fa fa-home"
                   href="${request.contextPath}/opus/{{profileCtrl.opus.shortName ? profileCtrl.opus.shortName : profileCtrl.opus.uuid}}" title="{{profileCtrl.opus.title}}"></a>
            </li>
            <h1>${grailsApplication.config.layout}</h1>
            <li class="font-xxsmall active" ng-if="profileCtrl.profile.classification.length == 0">{{profileCtrl.isArchived() ? profileCtrl.profile.archivedWithName : profileCtrl.profile.scientificName}}</li>
            <span ng-if="profileCtrl.profile.classification.length > 0">
                <taxonomy data="profileCtrl.profile.classification"
                          current-name="profileCtrl.profile.scientificName"
                          opus-id="profileCtrl.opusId"
                          layout="horizontal"
                          limit="4"
                          show-children="true"
                          show-children-for-last-only="false"
                          show-with-profile-only="true"
                          show-infraspecific="false">
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
                                 profile-id="profileCtrl.profileId">
                    </publication>
                </div>
            </p>
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

        <g:if test="${opus?.profileLayoutConfig?.layout}">
            <g:render template="layout${org.apache.commons.lang.StringUtils.capitalize(opus?.profileLayoutConfig?.layout)}"/>
        </g:if>
        <g:else>
            <g:render template="layoutSingleTab"/>
        </g:else>

    </div>

</div>
</body>

</html>



