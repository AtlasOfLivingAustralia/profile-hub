<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="${grailsApplication.config.getProperty('layout')}"/>
    <title>${pageTitle}</title>

</head>

<body>
<div ng-controller="ShareRequestController as shareCtrl" ng-cloak>

    <div class="row padding-bottom-2">
        <div class="col-sm-12 padding-bottom-1">
            <h2 class="heading-large">
                Request to share content
            </h2>

            <div class="padding-top-1" ng-show="shareCtrl.alreadyRespondedTo">
                <p class="lead">This request has already been addressed.</p>
            </div>

            <div class="padding-top-1" ng-show="!shareCtrl.alreadyRespondedTo">

                <p class="lead">
                    An administrator of the <a href="${request.contextPath}/opus/{{shareCtrl.requestingOpus.uuid}}"
                                               target="_blank">{{ shareCtrl.requestingOpus.title }}</a> collection would like to share your data.
                </p>

                <p>
                    This will allow them to use your collection as a 'Supporting Collection' to display your data in their profiles.
                </p>

                <p>
                    {{ shareCtrl.requestingOpus.title }} will not be able to see any of the {{ shareCtrl.opus.title }} data until the request has been approved by you or another {{ shareCtrl.opus.title }} administrator.
                </p>

                <div class="padding-top-1" ng-show="!shareCtrl.alreadyRespondedTo">
                    <a class="btn btn-primary" ng-href="" ng-click="shareCtrl.respond(true)"><span
                            class="fa fa-thumbs-up"></span> Allow</a>
                    <a class="btn btn-warning" ng-href="" ng-click="shareCtrl.respond(false)"><span
                            class="fa fa-thumbs-down"></span> Deny</a>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>