<div class="row margin-top-1 small" ng-cloak>
    <div class="col-xs-6 " ng-cloak>
        <a
                href="${request.contextPath}/opus/{{profileCtrl.opus.shortName ? profileCtrl.opus.shortName : profileCtrl.opus.uuid}}/about##copyright"
                target="_blank">&copy; {{ profileCtrl.opus.copyrightText || 'Copyright Notice' }}</a>
    </div>
    <div class="col-xs-6 last-updated-text">
        Last updated: <span class="last-updated">{{profileCtrl.profile.lastUpdatedBy?profileCtrl.profile.lastUpdatedBy + ';':''}} {{ profileCtrl.profile.lastPublished | date : 'MMM d, y h:mm' }}</span>
        Status: <span ng-bind="profileCtrl.profile.profileStatus"></span>
    </div>

</div>

<div class="row margin-top-1 small" ng-cloak ng-show="profileCtrl.profile.authorship.length > 0">
    <navigation-anchor anchor-name="view_authorship" title="{{profileCtrl.acknowledgementsSectionTitle}}" condition="profileCtrl.profile.authorship.length > 0"></navigation-anchor>

    <div class="col-xs-12 profile-contributor-text">
        <p ng-repeat="contrib in profileCtrl.profile.authorship"
              ng-show="contrib.text">{{contrib.category | capitalize}} - {{contrib.text}}
        </p>
        <g:if test="${citation}">
            <p>
                ${citation}
            </p>
        </g:if>
    </div>
</div>


<g:if test="${profileQrCodeBase64}">
    <div class="row margin-top-1" ng-cloak>
        <div class="col-xs-12">
            <div class="profile-qr-code">
                <img src="data:image/png;base64,${profileQrCodeBase64}"
                     alt="QR code linking to this profile"
                     width="180"
                     height="180"/>
                <p class="small">
                    Scan this QR code to view this profile.
                </p>
            </div>
        </div>
    </div>
</g:if>
