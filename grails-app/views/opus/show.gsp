<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="${grailsApplication.config.layout + '-nocontainer'}"/>
    <title>Profile collections</title>
</head>

<body>

<div ng-controller="OpusController as opusCtrl" ng-init="opusCtrl.loadOpus()">
    <g:render template="banner" model="[opus: opus]"/>
    <div class="container">
        <div class="row">
            <div class="col-sm-4 col-xs-12">
                <g:link uri="/opus/${opus.shortName ?: opus.uuid}/search" class="btn btn-default btn-lg btn-block " tooltip="${opus.opusLayoutConfig.helpTextSearch}" tooltip-placement="right" tooltip-append-to-body="true">Search</g:link>
                <g:link uri="/opus/${opus.shortName ?: opus.uuid}/browse" class="btn btn-default btn-lg btn-block " tooltip="${opus.opusLayoutConfig.helpTextBrowse}" tooltip-placement="right" tooltip-append-to-body="true">Browse</g:link>
                <g:if test="${opus.keybaseProjectId != null}">
                    <g:link uri="/opus/${opus.shortName ?: opus.uuid}/identify" class="btn btn-default btn-lg btn-block " tooltip="${opus.opusLayoutConfig.helpTextIdentify}" tooltip-placement="right" tooltip-append-to-body="true">Identify</g:link>
                </g:if>
                %{--<g:link uri="/opus/${opus.shortName ?: opus.uuid}/filter" class="btn btn-default btn-lg btn-block" tooltip="${opus.opusLayoutConfig.helpTextFilter}" tooltip-placement="right" tooltip-append-to-body="true">Filter</g:link>--}%
                <g:link uri="/opus/${opus.shortName ?: opus.uuid}/documents" class="btn btn-default btn-lg btn-block" tooltip="${opus.opusLayoutConfig.helpTextDocuments}" tooltip-placement="right" tooltip-append-to-body="true">Context</g:link>
            </div>  <!-- /col-sm-4 -->
            <div class="col-sm-4 col-xs-12" ng-bind-html="opusCtrl.opus.opusLayoutConfig.explanatoryText">
            </div>  <!-- /col-sm-4 -->
            <div class="col-sm-4 col-xs-12">
                <h4>Updates</h4>
                <div ng-bind-html="opusCtrl.opus.opusLayoutConfig.updatesSection">
                </div>
            </div>
        </div>  <!-- /col-sm-4 -->
    </div>
</div>

</body>

</html>