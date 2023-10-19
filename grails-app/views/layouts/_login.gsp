<g:set var="authService" bean="authService"/>
<g:if test="${params.currentUser}">
<li class="dropdown font-xsmall" ng-controller="UserDetailController as userCtrl">
    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false" title="Settings" aria-label="Settings">
        <span class="hidden-xs fa fa-bars {{ userCtrl.user.role.colour }}"></span>
        <span class="visible-xs-inline"><span class="pull-right caret"></span>Settings</span>
    </a>
    <ul class="dropdown-menu" role="menu" ng-controller="ProfileController as profileCtrl" ng-init="profileCtrl.loadProfile()">
        <li role="separator" class="padding-bottom-1">
            <span role="menuitem" class="no-icon-menu-item">Role: {{ userCtrl.user.role.name }}</span>
        </li>
        <g:if test="${opus}">
            <g:if test="${params.isOpusAdmin && reportsUrl}">
                <li class="${pageName=='reports'?'active':''}" role="presentation"><a href="${reportsUrl}"><span class="fa fa-pie-chart">&nbsp;&nbsp;</span>Reports</a></li>
            </g:if>
            <g:if test="${params.isOpusAdmin || params.isOpusAuthor}">
                <li role="presentation" ng-show="!profileCtrl.opus.masterListUid">
                    <a target="_self" ng-click="profileCtrl.createProfile(profileCtrl.opusId, false)">
                        <span class="fa fa-plus">&nbsp;&nbsp;</span>Add a new profile
                    </a>
                </li>
                <li role="presentation" ng-show="!profileCtrl.opus.masterListUid">
                    <a target="_self" ng-click="profileCtrl.createProfile(profileCtrl.opusId, true)"><span class="fa fa-copy">&nbsp;&nbsp;</span>Copy an existing profile</a>
                </li>
            </g:if>
            <g:if test="${params.isOpusAdmin}">
                <li role="presentation" class="padding-bottom-1">
                    <a href="${request.contextPath}/opus/${opus.uuid}/update"><span class="fa fa-edit">&nbsp;&nbsp;</span>Edit configuration</a>
                </li>
            </g:if>
        </g:if>
        <li role="presentation">
            <a role="menuitem"
               tabindex="-1"
               href="${grailsApplication.config.security.cas.casServerName}/userdetails/myprofile"><span class="fa fa-user">&nbsp;&nbsp;</span>My Profile</a>
        </li>
        <g:if test="${params.isALAAdmin}">
            <li role="presentation">
                <a role="menuitem"
                   tabindex="-1"
                   href="${request.contextPath}/admin"><span class="fa fa-cog">&nbsp;&nbsp;</span>Admin</a>
            </li>
        </g:if>
        <li role="presentation">
            <a role="menuitem"
               tabindex="-1"
               target="_self"
               href="${request.contextPath}/logout/logout?appUrl=${grailsApplication.config.serverURL}${request.forwardURI}">
                <span class="fa fa-sign-out">&nbsp;&nbsp;</span>Logout</a>
        </li>
    </ul>
</li>
</g:if>
<g:else>
    <li><a href="${authService.loginUrl(request)}"><span class="fa fa-sign-in">&nbsp;&nbsp;</span>Login</a></li>
</g:else>