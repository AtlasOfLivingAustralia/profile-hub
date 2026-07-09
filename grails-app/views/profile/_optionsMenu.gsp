<%@ page import="grails.util.Environment" %>
<div class="btn-group" ng-show="profileCtrl.opus">
    <a href="${request.contextPath}/opus/{{profileCtrl.opusId}}/profile/{{profileCtrl.profile.scientificName}}"
       target="_self"
       class="btn btn-outline-secondary std-width-btn"
       ng-show="!profileCtrl.readonly()">
        <i class="fa fa-eye"></i> Public View
    </a>

    <div class="btn-group">
        <button class="btn btn-outline-secondary dropdown-toggle std-width-btn" type="button" id="dropdownMenu1"
                data-bs-toggle="dropdown" aria-expanded="false">
            <span class="fa fa-cog"></span>
            Options
            <span class="fa fa-angle-double-down"></span>
        </button>
        <ul class="dropdown-menu"
            aria-labelledby="dropdownMenu1">
            <li ng-if="!profileCtrl.readonly()">
                <a class="dropdown-item" href="<p:helpUrl help-id='profile.edit.optionsMenu'/>" target="_blank"><span
                        class="fa fa-question-circle"></span>&nbsp;&nbsp;Help
                </a>
            </li>
            <g:if test="${Environment.current == Environment.DEVELOPMENT}">
                <li ng-hide="profileCtrl.isArchived()">
                    <a class="dropdown-item" href="${request.contextPath}/opus/{{profileCtrl.opusId}}/profile/{{profileCtrl.profileId}}/json"
                       target="_blank"><span class="fa fa-file-text-o"></span>&nbsp;&nbsp;Export as JSON
                    </a>
                </li>
            </g:if>
            <g:if test="${params.isOpusAdmin || params.isOpusEditor || params.isOpusAuthor}">
                <li ng-hide="profileCtrl.isArchived() || !profileCtrl.readonly()"><hr class="dropdown-divider"></li>
                <li ng-hide="!profileCtrl.readonly() || profileCtrl.isArchived()">
                    <a class="dropdown-item" href="${request.contextPath}/opus/{{profileCtrl.opusId}}/profile/{{profileCtrl.profile.scientificName}}/update"
                       target="_self"><span
                            class="fa fa-edit"></span>&nbsp;&nbsp;Edit</a>
                </li>
                <li ng-if="!profileCtrl.readonly()">
                    <a class="dropdown-item" href="" ng-click="profileCtrl.toggleAudit()"><span
                            class="fa fa-history"></span>&nbsp;&nbsp;{{profileCtrl.showProfileAudit ? 'Hide ' : 'Show '}} revision history
                    </a>
                </li>
                <li ng-if="!profileCtrl.readonly() && !profileCtrl.profile.privateMode">
                    <a class="dropdown-item" href="" ng-click="profileCtrl.toggleDraftMode()"><span
                            class="fa fa-lock"></span>&nbsp;&nbsp;Lock for major revision</a>
                </li>
                <g:if test="${params.isOpusAdmin || params.isOpusAuthor}">
                    <g:if test="${params.isOpusAdmin}">
                        <li ng-if="!profileCtrl.readonly() && profileCtrl.profile.privateMode">
                            <a class="dropdown-item" href="" ng-click="profileCtrl.toggleDraftMode()"><span
                                    class="fa fa-unlock"></span>&nbsp;&nbsp;Publish draft changes</a>
                        </li>
                        <li ng-if="!profileCtrl.readonly() && profileCtrl.profile.privateMode">
                            <a class="dropdown-item" href="" ng-click="profileCtrl.discardDraftChanges()"><span
                                    class="fa fa-times-circle"></span>&nbsp;&nbsp;Discard draft changes</a>
                        </li>
                    </g:if>
                    <li ng-hide="profileCtrl.readonly()"><hr class="dropdown-divider"></li>
                    <g:if test="${params.isOpusAdmin}">
                        <li>
                            <a class="dropdown-item" href="" ng-click="profileCtrl.deleteProfile()" target="_self"
                               ng-hide="profileCtrl.readonly() || !profileCtrl.profileId || profileCtrl.profile.publications.length > 0"><span
                                    class="fa fa-trash-o"></span>&nbsp;&nbsp;Delete this profile</a>
                        </li>
                    </g:if>
                    <li>
                        <a class="dropdown-item" href="" ng-click="profileCtrl.archiveProfile()" target="_self"
                           ng-hide="profileCtrl.readonly() || profileCtrl.isArchived()"><span
                                class="fa fa-archive"></span>&nbsp;&nbsp;Archive this profile</a>
                    </li>
                    <g:if test="${params.isOpusAdmin}">
                        <li ng-hide="!profileCtrl.isArchived()">
                            <a class="dropdown-item" href="" ng-click="profileCtrl.restoreProfile()" target="_self"><span
                                    class="fa fa-recycle"></span>&nbsp;&nbsp;Restore this profile</a>
                        </li>
                    </g:if>
                </g:if>
            </g:if>
        </ul>
    </div>
</div>
