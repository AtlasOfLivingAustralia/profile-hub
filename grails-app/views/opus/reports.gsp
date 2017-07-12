<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="${grailsApplication.config.layout + '-nocontainer'}"/>
    <title>Profile search | Atlas of Living Australia</title>

</head>

<body>
<div ng-controller="OpusController as opusCtrl" ng-init="opusCtrl.loadOpus()">
    <g:render template="banner" model="[opus: opus]"/>

    <div class="container">
        <h1 class="hidden">Welcome to the eFlora website</h1><!-- Show the H1 on each page -->
        <g:include controller="opus" action="opusSummaryPanel" params="[opusId: params.opusId]"/>
        <g:if test="${params.isOpusEditor}">
            <g:include controller="opus" action="reportPanel" params="[opusId: params.opusId]"/>
        </g:if>
    </div>
</div>
</body>

</html>