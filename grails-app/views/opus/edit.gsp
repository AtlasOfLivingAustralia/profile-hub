<%@ page import="au.org.ala.web.AuthService" %>
<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="${grailsApplication.config.layout}"/>
    <title>Profile collections</title>
    <asset:script type="text/javascript"
            src="http://markusslima.github.io/bootstrap-filestyle/1.0.6/js/bootstrap-filestyle.min.js"></asset:script>
    <style type="text/css">
    .bootstrap-filestyle label {
        margin-bottom: 8px;
    }
    </style>
</head>

<body>

<div ng-controller="OpusController as opusCtrl" ng-init="opusCtrl.loadOpus()">
    <a name="top"></a>

    <div class="row" ng-cloak>
        <div class="col-md-6">
            <p class="lead">
                Configure your profile collection
            </p>
        </div>

        <div class="col-md-6">
            <div class="padding-bottom-1 pull-right">
                    <a href="${request.contextPath}/opus/{{opusCtrl.opus.shortName ? opusCtrl.opus.shortName : opusCtrl.opus.uuid}}"
                       class="btn btn-default" target="_self" ng-show="opusCtrl.opus.uuid"><i
                            class="fa fa-eye"></i> Public View</a>
                    <g:if test="${params.isALAAdmin}">
                        <button ng-click="opusCtrl.deleteOpus()" class="btn btn-danger" target="_self"
                                ng-show="opusCtrl.opus.uuid"><i
                                class="fa fa-trash-o"></i> Delete this collection
                        </button>
                    </g:if>
            </div>
        </div>
    </div>

    <div class="row" ng-cloak>
        <div class="col-md-3 margin-bottom-1 stay-on-screen">
            <ul class="nav nav-stacked" id="sidebar">
                <h4 class="font-xxsmall heading-underlined"><strong>Page index</strong></h4>
                <g:if test="${!params.opusId}">
                    <li><a href="#overview" du-smooth-scroll target="_self" class="font-xxsmall">Site overview</a></li>
                </g:if>
                <g:else>
                    <li><a href="#about" du-smooth-scroll class="font-xxsmall">About page</a></li>
                    <li><a href="#accessControl" du-smooth-scroll class="font-xxsmall">Access control</a></li>
                    <li><a href="#lists" du-smooth-scroll class="font-xxsmall">Approved lists</a></li>
                    <li><a href="#recordSources" du-smooth-scroll
                           class="font-xxsmall">Approved specimen/observation sources</a></li>
                    <li><a href="#attributeVocab" du-smooth-scroll class="font-xxsmall">Attribute vocabulary</a></li>
                    <li><a href="#authorshipVocab" du-smooth-scroll
                           class="font-xxsmall">Acknowledgements vocabulary</a></li>
                    <li><a href="#authorship" du-smooth-scroll class="font-xxsmall">Authorship &amp; attribution</a>
                    </li>
                    <li><a href="#branding" du-smooth-scroll class="font-xxsmall">Branding</a></li>
                    <li><a href="#featureLists" du-smooth-scroll class="font-xxsmall">Feature Lists</a></li>
                    <li><a href="#glossary" du-smooth-scroll class="font-xxsmall">Glossary</a></li>
                    <li><a href="#helplinks" du-smooth-scroll class="font-xxsmall">Help links</a></li>
                    <li><a href="#landingpage" du-smooth-scroll class="font-xxsmall">Home page</a></li>
                    <li><a href="#imageSources" du-smooth-scroll class="font-xxsmall">Image options</a></li>
                    <li><a href="#key" du-smooth-scroll class="font-xxsmall">Key configuration</a></li>
                    <li><a href="#map" du-smooth-scroll class="font-xxsmall">Map configuration</a></li>
                    <li><a href="#edit_master_list" du-smooth-scroll class="font-xxsmall">Master List</a></li>
                    <li><a href="#profileEditing" du-smooth-scroll target="_self" class="font-xxsmall">Profile Editing Options</a></li>
                    <li><a href="#profileLayout" du-smooth-scroll target="_self" class="font-xxsmall">Profile Page Layout</a></li>
                    <li><a href="#overview" du-smooth-scroll target="_self" class="font-xxsmall">Site overview</a></li>
                    <li><a href="#supportingCollections" du-smooth-scroll
                           class="font-xxsmall">Supporting collections</a></li>
                    <li><a href="#theming" du-smooth-scroll class="font-xxsmall">Theming</a></li>
                </g:else>
            </ul>
        </div>

        <div class="col-lg-9 col-md-8 col-xs-12">
            <g:include controller="opus" action="editOpusDetailsPanel" params="[opusId: params.opusId]"/>

            <g:if test="${params.opusId}">

                <master-list
                        opus="opusCtrl.opus"
                        help-url="<p:helpUrl help-id="opus.edit.masterList"/>">
                </master-list>

                <g:include controller="opus" action="editAccessControlPanel" params="[opusId: params.opusId]"/>

                <g:include controller="opus" action="editStylingPanel" params="[opusId: params.opusId]"/>

                <g:include controller="opus" action="editLandingPagePanel" params="[opusId: params.opusId]"/>

                <g:include controller="opus" action="editTheme" params="[opusId: params.opusId]"/>

                <g:include controller="opus" action="editHelpLinks" params="[opusId: params.opusId]"/>

                <g:render template="editProfileEditingOptions" model="[opusId: params.opusId]"/>

                <g:render template="editProfileLayout" model="[opusId: params.opusId]"/>

                <g:include controller="opus" action="editMapConfigPanel" params="[opusId: params.opusId]"/>

%{--                <g:include controller="opus" action="taxaUploadPanel" params="[opusId: params.opusId]"/>--}%

%{--                <g:include controller="opus" action="occurrenceUploadPanel" params="[opusId: params.opusId]"/>--}%

%{--                <g:include controller="opus" action="phyloUploadPanel" params="[opusId: params.opusId]"/>--}%

                <g:include controller="opus" action="editKeyConfigPanel" params="[opusId: params.opusId]"/>

%{--                <g:include controller="opus" action="keyUploadPanel" params="[opusId: params.opusId]"/>--}%

                <g:include controller="opus" action="editImageSourcesPanel" params="[opusId: params.opusId]"/>

                <g:include controller="opus" action="editRecordSourcesPanel" params="[opusId: params.opusId]"/>

                <g:include controller="opus" action="editApprovedListsPanel" params="[opusId: params.opusId]"/>

                <g:include controller="opus" action="editFeatureListPanel" params="[opusId: params.opusId]"/>

                <g:include controller="opus" action="editSupportingOpusPanel" params="[opusId: params.opusId]"/>

                <g:include controller="opus" action="editVocabPanel" params="[opusId: params.opusId]"/>

                <g:include controller="opus" action="editAuthorshipPanel" params="[opusId: params.opusId]"/>

                <g:include controller="opus" action="editGlossaryPanel" params="[opusId: params.opusId]"/>

                <g:include controller="opus" action="editAboutPanel" params="[opusId: params.opusId]"/>

                <additional-statuses opus="opusCtrl.opus"></additional-statuses>
            </g:if>
        </div>
    </div>

    <a href="#top" du-smooth-scroll target="_self" class="btn btn-link scroll-to-top" title="Scroll to top">
        <span class="fa fa-arrow-up"></span><br>Top</a>
</div>

</body>

</html>