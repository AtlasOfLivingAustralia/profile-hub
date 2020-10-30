<%--
 Created by Temi Varghese on 14/07/15.
--%>

<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="${grailsApplication.config.layout}"/>
    <title>${profile.scientificName}</title>
</head>

<body>
<div ng-controller="DoiController as doiCtrl" ng-init="doiCtrl.init('${publications as grails.converters.JSON}', '${profile.uuid}', '${opus.uuid}')" ng-cloak>

    <ol class="breadcrumb" ng-cloak>
        <li><a class="font-xxsmall" href="${request.contextPath}/">Profile Collections</a></li>
        <li><a class="font-xxsmall"
               href="${request.contextPath}/opus/{{doiCtrl.opus.shortName ? doiCtrl.opus.shortName : doiCtrl.opus.uuid}}">{{doiCtrl.opus.title}}</a>
        </li>
        <li class="font-xxsmall active">{{doiCtrl.profile.scientificName}}</li>
    </ol>

    <div class="row padding-bottom-2">
        <div class="col-sm-12 padding-bottom-1">
            <h2 class="heading-large">
                {{doiCtrl.selectedPublication.title | default:'Loading...'}}
                <span ng-show="doiCtrl.selectedPublication.version">v. {{doiCtrl.selectedPublication.version}}</span>
            </h2>

            <div class="citation padding-bottom-1">{{doiCtrl.selectedPublication.authors}}, published on {{doiCtrl.selectedPublication.publicationDate | date:"dd/MM/yyyy H:mm a"}}</div>

            <p class="lead margin-top-1 margin-bottom-1">
                Click the download button below to save the publication.
            </p>

            <div>
                <a class="btn btn-primary"
                       ng-href="${request.contextPath}/opus/{{doiCtrl.opus.shortName || doiCtrl.opus.uuid }}/profile/{{doiCtrl.profileId}}/publication/{{doiCtrl.selectedPublication.uuid}}/file"
                       target="_blank"><span class="glyphicon glyphicon-download"></span> Download PDF</a>
                <a class="btn btn-default"
                       href="${request.contextPath}/opus/{{doiCtrl.opus.shortName ? doiCtrl.opus.shortName : doiCtrl.opus.uuid}}/profile/{{doiCtrl.profile.scientificName}}" target="_blank">View Profile</a>
            </div>
        </div>
    </div>

    <h4 class="padding-top-1 margin-top-1">All available versions</h4>
    <div class="col-sm-12 padding-top-1 padding-bottom-1 border-top-bottom" ng-class="{selected: pub.uuid == doiCtrl.pubId}" ng-repeat="pub in doiCtrl.publications">
        <div class="col-md-1">
            <span class="fa fa-star color--green" ng-show="pub.uuid == doiCtrl.pubId" title="You are viewing this version"></span>
        </div>
        <div class="col-md-11">
            <publication data="pub" opus-id="doiCtrl.opusId" profile-id="doiCtrl.profileId" prefix="${grailsApplication.config.doi.resolver.prefix}"></publication>
        </div>
    </div>
</div>
</body>
</html>