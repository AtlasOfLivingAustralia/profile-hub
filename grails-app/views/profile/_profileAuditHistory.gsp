<div class="row profile-audit" ng-cloak>
    <div class="col-md-12">
        <div class="panel panel-default" ng-show="profileCtrl.showProfileAudit" ng-cloak>
            <div class="panel-body">
                <div ng-if="profileCtrl.loading"><span class="fa fa-spin fa-spinner"></span>&nbsp;Loading...</div>
                <div class="table-responsive" ng-if="!profileCtrl.loading">
                    <table class="table table-striped">
                        <thead>
                        <th>Date updated</th>
                        <th>Editor</th>
                        <th></th>
                        </thead>
                        <tbody>
                        <tr ng-repeat="audit in profileCtrl.audit.data">
                            <td>{{audit.left.date | date:'dd/MM/yyyy h:mm a'}}</td>
                            <td>{{audit.left.userDisplayName | default:'Unknown'}}</td>
                            <td><button class="btn btn-link float-end"
                                        ng-click="profileCtrl.showAuditComparison(audit)"
                                        ng-show="audit.right">Compare with previous revision</button></td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="panel-footer">
                <div class="row">
                    <div class="col-md-12">
                        <pagination total-items="profileCtrl.audit.total"
                                    ng-change="profileCtrl.loadAuditData()"
                                    ng-model="profileCtrl.audit.page" max-size="10"
                                    items-per-page="profileCtrl.audit.pageSize"
                                    previous-text="Prev" boundary-links="true"
                                    ng-show="profileCtrl.audit.total > profileCtrl.audit.pageSize && !profileCtrl.loading"
                        ></pagination>
                        <button class="btn btn-outline-secondary float-end" ng-click="profileCtrl.toggleAudit()">Hide revision history</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>