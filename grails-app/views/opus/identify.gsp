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
        <div class="row">
            <div class="col-lg-12 col-md-12 col-12">
                <h3 class="heading-medium">Identify via keys
                    <i class="fa fa-question-circle" aria-hidden="true"
                                                                            aria-label="At each step, select the attribute that best matches the plant you wish to identify. Matching taxa will be displayed on the right. The path you have chosen will be displayed underneath; click within the path to step back."
                                                                            tooltip="At each step, select the attribute that best matches the plant you wish to identify. Matching taxa will be displayed on the right. The path you have chosen will be displayed underneath; click within the path to step back." tooltip-placement="top"
                                                                            tooltip-append-to-body="true">
                    </i>
                </h3>
            </div>
        </div>
        %{-- A hack to get key player initialised--}%
        <div class="row" ng-show="opusCtrl.opus.keybaseKeyId && opusCtrl.canInitialiseKeyplayer() && !opusCtrl.initialiseKeyplayer()">
            <script type="text/ng-template" id="keyplayer.html">
            <key-player key-id="opusCtrl.opus.keybaseKeyId" style="display: block"
                        only-include-items="opusCtrl.masterListKeybaseItems"
                        keybase-url="${g.createLink(controller:'keybase', action:'keyLookup', absolute: true)}"
                        profile-url="${request.scheme}://${request.serverName}${request.serverPort ? ":" + request.serverPort : ""}${request.contextPath}/opus/{{opusCtrl.opus.shortName ? opusCtrl.opus.shortName : opusCtrl.opus.uuid}}/profile"></key-player>
            </script>
            <ng-include src="opusCtrl.keybaseTemplateUrl"/>
        </div>
    </div>
</div>
</body>

</html>