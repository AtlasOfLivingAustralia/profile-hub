<%@ page import="grails.util.Environment" %>
<div class="btn-group" ng-show="profileCtrl.opus">
    <div class="col-md-6" ng-show="!profileCtrl.readonly()">
        <a href="${request.contextPath}/opus/{{profileCtrl.opusId}}/profile/{{profileCtrl.profile.scientificName}}"
           target="_self" class="btn btn-default std-width-btn"><i
                class="fa fa-eye"></i> Public View</a>
    </div>

    <div class="btn-group col-md-6">
        <div class="dropdown">
            <button class="btn btn-default dropdown-toggle std-width-btn" type="button" id="dropdownMenu1"
                    data-toggle="dropdown" aria-expanded="true">
                <span class="fa fa-cog"></span>
                Options
                <span class="fa fa-angle-double-down"></span>
            </button>

            <ul class="dropdown-menu"
                role="menu"
                aria-labelledby="optionsDropdown">
                <li role="presentation" ng-if="!profileCtrl.readonly()">
                    <a href="<p:helpUrl help-id='profile.edit.optionsMenu'/>" target="_blank"><span
                            class="fa fa-question-circle"></span>&nbsp;&nbsp;Help
                    </a>
                </li>
                <g:if test="${Environment.current == Environment.DEVELOPMENT}">
                    <li role="presentation" ng-hide="profileCtrl.isArchived()">
                        <a href="${request.contextPath}/opus/{{profileCtrl.opusId}}/profile/{{profileCtrl.profileId}}/json"
                           target="_blank"><span class="fa fa-file-text-o"></span>&nbsp;&nbsp;Export as JSON
                        </a>
                    </li>
                </g:if>
%{--                <li role="presentation" ng-controller="ExportController as exportCtrl"--}%
%{--                    ng-hide="profileCtrl.isArchived() || !profileCtrl.readonly()">--}%
%{--                    <a href=""--}%
%{--                       ng-click="exportCtrl.exportPdf(profileCtrl.profile.rank, profileCtrl.profile.scientificName)"--}%
%{--                       target="_blank"><span class="fa fa-file-pdf-o"></span>&nbsp;&nbsp;Export as PDF!--}%
%{--                    </a>--}%
%{--                </li>--}%
                <g:if test="${params.isOpusAdmin || params.isOpusEditor || params.isOpusAuthor}">
                    <li class="divider" ng-hide="profileCtrl.isArchived() || !profileCtrl.readonly()"></li>
                    <li role="presentation" ng-hide="!profileCtrl.readonly() || profileCtrl.isArchived()">
                        <a href="${request.contextPath}/opus/{{profileCtrl.opusId}}/profile/{{profileCtrl.profile.scientificName}}/update"
                           target="_self"><span
                                class="fa fa-edit"></span>&nbsp;&nbsp;Edit</a>
                    </li>
                    <li role="presentation"
                        ng-if="!profileCtrl.readonly()">
                        <a href="" ng-click="profileCtrl.toggleAudit()"><span
                                class="fa fa-history"></span>&nbsp;&nbsp;{{profileCtrl.showProfileAudit ? 'Hide ' : 'Show '}} revision history
                        </a>
                    </li>
                    <li role="presentation"
                        ng-if="!profileCtrl.readonly() && !profileCtrl.profile.privateMode">
                        <a href="" ng-click="profileCtrl.toggleDraftMode()"><span
                                class="fa fa-lock"></span>&nbsp;&nbsp;Lock for major revision</a>
                    </li>
                    <g:if test="${params.isOpusAdmin || params.isOpusAuthor}">
                        <g:if test="${params.isOpusAdmin}">
                            <li role="presentation"
                                ng-if="!profileCtrl.readonly() && profileCtrl.profile.privateMode">
                                <a href="" ng-click="profileCtrl.toggleDraftMode()"><span
                                        class="fa fa-unlock"></span>&nbsp;&nbsp;Publish draft changes</a>
                            </li>
                            <li role="presentation"
                                ng-if="!profileCtrl.readonly() && profileCtrl.profile.privateMode">
                                <a href="" ng-click="profileCtrl.discardDraftChanges()"><span
                                        class="fa fa-times-circle"></span>&nbsp;&nbsp;Discard draft changes</a>
                            </li>
                        </g:if>
                        <li class="divider" ng-hide="profileCtrl.readonly()"></li>
                        <g:if test="${params.isOpusAdmin}">
                            <li role="presentation">
                                <a href="" ng-click="profileCtrl.deleteProfile()" target="_self"
                                   ng-hide="profileCtrl.readonly() || !profileCtrl.profileId || profileCtrl.profile.publications.length > 0"><span
                                        class="fa fa-trash-o"></span>&nbsp;&nbsp;Delete this profile</a>
                            </li>
                        </g:if>
                        <li role="presentation">
                            <a href="" ng-click="profileCtrl.archiveProfile()" target="_self"
                               ng-hide="profileCtrl.readonly() || profileCtrl.isArchived()"><span
                                    class="fa fa-archive"></span>&nbsp;&nbsp;Archive this profile</a>
                        </li>
                        <g:if test="${params.isOpusAdmin}">
                            <li role="presentation" ng-hide="!profileCtrl.isArchived()">
                                <a href="" ng-click="profileCtrl.restoreProfile()" target="_self"><span
                                        class="fa fa-recycle"></span>&nbsp;&nbsp;Restore this profile</a>
                            </li>
                        </g:if>
                    </g:if>
                </g:if>
            </ul>
        </div>
    </div>
</div>
