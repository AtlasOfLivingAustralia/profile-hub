<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="${grailsApplication.config.layout + '-nocontainer'}"/>
    <title>${pageTitle} Glossary</title>
</head>

<body>

<div ng-controller="GlossaryController as glossaryCtrl" ng-init="glossaryCtrl.loadGlossary()">
    <profile-header opus="glossaryCtrl.opus" is-profile="false"></profile-header>
    <div class="container">
        <div class="row margin-top-2 padding-bottom-2">
            <div class="col-md-10">
                <h2 class="heading-large inline">Glossary</h2>
            </div>

            <g:if test="${params.isOpusAdmin}">
                <div class="col-md-2">
                    <button class="btn btn-outline-secondary float-end margin-top-1" ng-click="glossaryCtrl.addGlossaryItem($index)"><i
                            class="fa fa-plus"></i> Add item</button>
                </div>
            </g:if>
        </div>

        <div class="row" ng-cloak>

            <div class="col-md-2 margin-bottom-1">
                <ul class="nav nav-stacked" id="sidebar">
                    <h4 class="font-xxsmall heading-underlined"><strong>Glossary index</strong></h4>

                    <li ng-repeat="prefix in ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']">
                        <a href="" class="font-xxsmall d-block mb-3" ng-model="glossaryCtrl.page" btn-radio="prefix"
                           ng-click="glossaryCtrl.loadGlossary(prefix)">{{ prefix }}</a></li>
                </ul>
            </div>

            <div class="col-md-10">
                <h4 class="font-xxsmall">Glossary Entry: {{glossaryCtrl.page | capitalize}}</h4>

                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Details</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr ng-repeat="item in glossaryCtrl.glossary.items">
                            <td>{{item.term}}</td>
                            <td><span ng-bind-html="item.description | sanitizeHtml"></span></td>
                            <g:if test="${params.isOpusAdmin}">
                                <td class="edits">
                                    <button type="button"
                                            class="btn btn-sm btn-link p-0 me-2"
                                            ng-click="glossaryCtrl.editGlossaryItem($index)"
                                            title="Edit glossary item"
                                            aria-label="Edit glossary item">
                                        <i class="fa fa-edit"></i>
                                    </button>

                                    <button type="button"
                                            class="btn btn-sm btn-link p-0 text-danger"
                                            ng-click="glossaryCtrl.deleteGlossaryItem($index)"
                                            title="Delete glossary item"
                                            aria-label="Delete glossary item">
                                        <i class="fa fa-trash-o"></i>
                                    </button>
                                </td>
                            </g:if>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    </div>
</div>

</body>
</html>

