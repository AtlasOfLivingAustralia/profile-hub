<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="${grailsApplication.config.layout}"/>
    <title>Profile collections | Atlas of Living Australia</title>

</head>

<body>

<div ng-controller="OpusController as opusCtrl" class="margin-bottom-3" ng-cloak>
    <div class="row">
        <div class="col-md-12">

            <h2 class="heading-large">Profile Collections</h2>

            <g:if test="${params.isALAAdmin}">
                <div class="float-end">
                    <a class="btn btn-secondary" href="${request.contextPath}/opus/create"
                       target="_self">Create a new collection</a>
                </div>
            </g:if>

        </div>
    </div>

    <div class="row">
        <div class="col-md-12">
            <h3 class="heading-medium">Search for profile(s)</h3>
            <delegated-search layout="large"></delegated-search>
        </div>
    </div>

    <div class="row collection-grid">
        <div class="col-md-12">
            <h3 class="heading-medium">Browse by collection</h3>
        </div>

        <div ng-repeat="opus in opusCtrl.opusList | orderBy: 'title'"
             class="col-6 col-sm-4 col-md-2 text-center collection-tile div-centre">
            <a href="${request.contextPath}/opus/{{opus.shortName ? opus.shortName : opus.uuid}}"
               target="_self">
                <img class="img-fluid collection-thumbnail img-thumbnail" src=""
                     ng-src="{{opus.thumbnailUrl | default:'${asset.assetPath(src: "generic_flower.png")}' }}"
                     alt="{{opus.title}} logo" title="{{opus.title}}">
            </a>
            <h4 class="font-xxsmall collection-title">
                <a href="${request.contextPath}/opus/{{opus.shortName ? opus.shortName : opus.uuid}}"
                   target="_self"><strong>{{opus.title}}</strong></a>
            </h4>
        </div>

        <div ng-show="opusCtrl.opusList.length == 0" class="col-md-12 padding-top-1">
            There are no visible collections.
        </div>
    </div>
</div>
</body>

</html>