<div class="row margin-top-1 small" ng-cloak>
    <div class="col-6 " ng-cloak>
        <a
                href="${request.contextPath}/opus/{{profileCtrl.opus.shortName ? profileCtrl.opus.shortName : profileCtrl.opus.uuid}}/about##copyright"
                target="_blank">&copy; {{ profileCtrl.opus.copyrightText || 'Copyright Notice' }}</a>
    </div>
    <div class="col-6 last-updated-text">
        Last updated: <span class="last-updated">{{profileCtrl.profile.lastUpdatedBy?profileCtrl.profile.lastUpdatedBy + ';':''}} {{ profileCtrl.profile.lastPublished | date : 'MMM d, y h:mm' }}</span>
        Status: <span ng-bind="profileCtrl.profile.profileStatus"></span>
    </div>

</div>

<div class="row margin-top-1 small" ng-cloak ng-show="profileCtrl.profile.authorship.length > 0">
    <navigation-anchor anchor-name="view_authorship" title="{{profileCtrl.acknowledgementsSectionTitle}}" condition="profileCtrl.profile.authorship.length > 0"></navigation-anchor>

    <div class="col-12 profile-contributor-text">
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