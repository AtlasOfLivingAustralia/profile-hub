<div class="padding-top-1" ng-controller="ReportController as reportCtrl" ng-cloak>
    <p:help help-id="opus.reports" show="${params.isOpusEditor}"/>
    <div class="row" ng-cloak>
        <div class="col-md-3 margin-bottom-1 stay-on-screen">
            <ul class="nav nav-stacked" id="sidebar">
                <h4 class="font-xxsmall heading-underlined"><strong>Reports</strong></h4>
                <li ng-repeat="report in reportCtrl.reports | orderBy:'name'">
                    <a href="" class="font-xxsmall" ng-click="reportCtrl.loadReport(report.id, 0)">{{report.name}}</a>
                </li>
            </ul>
        </div>

        <div class="col-lg-9 col-md-8 col-12" ng-cloak>
            <div ng-show="!reportCtrl.selectedReport">
                <p>
                    Select the report to display from the menu to the left
                </p>

                <p ng-if="reportCtrl.selectedReport && !reportCtrl.reportData.records">
                    There are no records in the {{reportCtrl.selectedReport.name}} report.
                </p>
            </div>
            <h4 class="heading-underlined"
                ng-show="reportCtrl.selectedReport && reportCtrl.reportData">{{reportCtrl.selectedReport.name}} <span
                    class="small">({{reportCtrl.reportData.recordCount}} row(s))</span>
            </h4>

            <div ng-show="reportCtrl.loading"><span class="fa fa-spin fa-spinner"></span>&nbsp;Loading...</div>

            <ng-include src="'/profileEditor/mismatchedNamesReport.htm'"
                        ng-if="reportCtrl.selectedReport.id == 'mismatchedNames'"></ng-include>
            <ng-include src="'/profileEditor/draftProfilesReport.htm'"
                        ng-if="reportCtrl.selectedReport.id == 'draftProfiles'"></ng-include>
            <ng-include src="'/profileEditor/archivedProfilesReport.htm'"
                        ng-if="reportCtrl.selectedReport.id == 'archivedProfiles'"></ng-include>
            <ng-include src="'/profileEditor/recentChanges.htm'"
                        ng-if="reportCtrl.selectedReport.id == 'recentChanges'"></ng-include>
            <ng-include src="'/profileEditor/recentComments.htm'"
                        ng-if="reportCtrl.selectedReport.id == 'recentComments'"></ng-include>
        </div>
    </div>
</div>
