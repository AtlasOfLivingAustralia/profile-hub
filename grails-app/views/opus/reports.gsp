<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="${grailsApplication.config.layout}"/>
    <title>Profile search | Atlas of Living Australia</title>

</head>

<body>
<div ng-controller="OpusController as opusCtrl" ng-init="opusCtrl.loadOpus()">
    <!-- Breadcrumb -->
    <ol class="breadcrumb" ng-cloak>
        <li><a class="font-xxsmall" href="${request.contextPath}/">Profile Collections</a></li>
        <li class="font-xxsmall active">{{opusCtrl.opus.title}}</li>
    </ol><!-- End Breadcrumb -->

    <h1 class="hidden">Welcome to the eFlora website</h1><!-- Show the H1 on each page -->

    <g:include controller="opus" action="opusSummaryPanel" params="[opusId: params.opusId]"/>
    <g:if test="${params.isOpusEditor}">
        <g:include controller="opus" action="reportPanel" params="[opusId: params.opusId]"/>
    </g:if>
</div>
</body>

</html>