<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="${grailsApplication.config.layout}"/>
    <title>Profile Admin</title>
</head>

<body>

<div>
    <g:if test="${flash.message}">
        <div class="alert alert-info">${flash.message}</div>
    </g:if>

    <div class="panel-heading">
        <h3>General admin</h3>
    </div>

    <div class="panel-body">
        <a href="${request.contextPath}/alaAdmin" class="btn btn-primary">Go to ALA admin page</a>
    </div>

    <hr/>

    <div ng-controller="ALAAdminController as adminCtrl" ng-cloak>
        <div class="panel-heading">
            <h3>Search index</h3>
        </div>

        <div class="panel-body">
            <p>This lets you rebuild the Elastic Search index used for the free-text search feature</p>
            <button class="btn btn-primary" ng-click="adminCtrl.reindex()">Rebuild search index</button>
        </div>
        <hr/>

        <div class="panel-heading">
            <h3>Rematch names</h3>
        </div>

        <div class="panel-body">
            <p>This lets you rematch all taxa names for all profiles in selected collections</p>
            <dualmultiselect options="adminCtrl.collectionMultiSelectOptions"></dualmultiselect>

            <button class="btn btn-primary" ng-click="adminCtrl.rematchNames()">Rematch profile names</button>
        </div>
        <hr/>

        <div class="panel-heading">
            <h3>Reload Help URLs</h3>
        </div>

        <div class="panel-body">
            <p>This clears the cache of help file URL mappings, allowing the mapping file (${grailsApplication.config.help.mapping.file}) to be updated without restarting the application.</p>

            <button class="btn btn-primary" ng-click="adminCtrl.reloadHelpUrls()">Reload help urls</button>
        </div>
        <hr/>

        <div class="panel-heading">
            <h3>Pending Jobs</h3>
        </div>

        <div class="panel-body">
            <p>This lets you view and delete any pending async jobs</p>

            <div ng-show="adminCtrl.loadingPendingJobs"><span class="fa fa-spin fa-spinner">&nbsp;</span>Loading...
            </div>

            <div ng-show="!adminCtrl.loadingPendingJobs">
                <div ng-show="adminCtrl.jobs.length == 0">There are no pending jobs.</div>

                <div class="table-responsive" ng-show="adminCtrl.jobs.length > 0">
                    <table class="table table-striped">
                        <thead>
                        <th>Job Id</th>
                        <th>User</th>
                        <th>Job Type</th>
                        <th>Attempts</th>
                        <th>Started</th>
                        <th>Created</th>
                        <th></th>
                        </thead>
                        <tbody>
                        <tr ng-repeat="job in adminCtrl.jobs">
                            <td>{{ job.jobId }}</td>
                            <td>{{ job.userEmail }}</td>
                            <td>{{ job.jobType.name }}</td>
                            <td>{{ job.attempts }} <span
                                    ng-show="job.error">Last error: {{ job.error }}, {{ job.lastUpdated }}</span></td>
                            <td>{{ job.startDate }}</td>
                            <td>{{ job.dateCreated }}</td>
                            <td>
                                <button class="btn btn-sm btn-link"
                                        ng-click="adminCtrl.deleteJob(job.jobType.name, job.jobId)"><span
                                        class="fa fa-trash-o color--red"></span></button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <hr/>

        <div class="panel-heading">
            <h3>Tags</h3>
        </div>

        <div class="panel-body">
            <p>Tags are assigned to collections to allow filtering, and to assist with exporting profile details (e.g. for the BIE).</p>
            <p>Tags are identified using the abbreviation, so if you change the abbreviation for a tag, any system that uses it (e.g. BIE) may need to be updated.</p>

            <div ng-show="adminCtrl.loadingTags"><span class="fa fa-spin fa-spinner">&nbsp;</span>Loading...</div>

            <div class="row" ng-repeat="tag in adminCtrl.tags" ng-hide="adminCtrl.loadingTags">
                <div class="col-md-12 form-inline padding-bottom-1">
                    <div class="form-group">
                        <label for="abbrev{{$index}}" class="control-label">Abbrev.</label>
                        <input id="abbrev{{$index}}" class="form-control" ng-model="tag.abbrev">
                    </div>

                    <div class="form-group">
                        <label for="name{{$index}}" class="control-label">Name.</label>
                        <input id="name{{$index}}" class="form-control" ng-model="tag.name">
                    </div>

                    <div class="form-group">
                        <label for="colour{{$index}}" class="control-label">Colour.</label>

                        <div class="input-group">
                            <input id="colour{{$index}}" class="form-control" ng-model="tag.colour" colorpicker
                                   colorpicker-close-on-select>
                            <span class="input-group-addon" ng-style="{background: tag.colour}"></span>
                        </div>
                    </div>
                    <button class="btn btn-primary" ng-click="adminCtrl.saveTag($index)">Save</button>
                    <button class="btn btn-danger" ng-click="adminCtrl.deleteTag($index)">Delete</button>
                </div>
            </div>
            <button class="btn btn-default" ng-click="adminCtrl.addTag()">Add tag</button>

        </div>
        <hr/>

        <div class="panel-default">
        <div class="panel-heading">
            <h3>Backup/Restore collection</h3>
        </div>

        <div class="panel panel-body">
            <h4>Backup collection</h4>
            <label>Backup Name: <input ng-model="adminCtrl.backupName"></label> (Backup Name must not contain spaces)<br><br>
            You may select one or more collections to backup
            <dualmultiselect options="adminCtrl.backupCollectionMultiSelectOptions"></dualmultiselect>
            <br>
            <button class="btn btn-primary" ng-click="adminCtrl.backupCollections()">Backup collection</button><br><br>
        </div>

        <div class="panel panel-body">
            <h4>Restore collection</h4>
            <label>Database Name: <input ng-model="adminCtrl.restoreDBName"></label> (Database name must not contain spaces)<br><br>
            You may select one or more backup name to restore
            <dualmultiselect options="adminCtrl.restoreCollectionMultiSelectOptions"></dualmultiselect>
            <br>
            <button class="btn btn-primary" ng-click="adminCtrl.restoreCollections()">Restore collection</button><br><br>
        </div>

        <div class="panel panel-body">
            <h4>Caches Management</h4>
            <div class="table-responsive" ng-show="adminCtrl.cacheRegions.length > 0">
                <table class="table table-striped">
                    <thead>
                    <th>Cache Name</th>
                    <th>Cache Clear</th>
                    </thead>
                    <tbody>
                    <tr ng-repeat="cache in adminCtrl.cacheRegions">
                        <td>{{ cache }}</td>
                        <td><button class="btn btn-sm btn-danger" ng-click="adminCtrl.clearCache(cache)"><i class="fa fa-times"></i>Clear</button></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
</body>
</html>




