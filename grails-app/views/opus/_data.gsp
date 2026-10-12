<div ng-controller="DataController as dataCtrl" ng-cloak>
    <div class="row">
        <div class="col-md-12">
            <p:help help-id="opus.data" show="${params.isOpusEditor}"/>
            <h4 class="inline-block padding-bottom-1">Data sets</h4>
            <div class="float-end">
                <a href="${request.contextPath}/opus/{{opusCtrl.opus.shortName ? opusCtrl.opus.shortName : opusCtrl.opus.uuid}}/data/upload" target="_self" class="btn btn-primary float-end"><span class="fa fa-upload">&nbsp;</span>Upload a data set</a>
            </div>
            <div class="clearfix"></div>
            <div ng-hide="!dataCtrl.dataSets || dataCtrl.dataSets.length > 0">
                This collection has no private data.
            </div>
            <div class="table-responsive" ng-show="dataCtrl.dataSets && dataCtrl.dataSets.length > 0">
                <table class="table table-striped">
                    <thead>
                    <th>Dataset ID</th>
                    <th>Dataset name</th>
                    <th>Date uploaded</th>
                    <th>Uploaded by</th>
                    <th>Number of records</th>
                    <th></th>
                    </thead>
                    <tbody>
                    <tr ng-repeat="dataSet in dataCtrl.dataSets">
                        <td>{{ dataSet.uid }}</td>
                        <td>{{ dataSet.name }}</td>
                        <td>{{ dataSet.lastUpdated | date }}</td>
                        <td>{{ dataSet.uploadedBy }}</td>
                        <td>{{ dataSet.numberOfRecords }}</td>
                        <td>
                            <a ng-click="dataCtrl.deleteDataSet(dataSet.uid)" target="_self"><span class="fa fa-trash-o color--red"></span></a>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="row padding-top-1">
        <div class="col-md-12">
            <h4>Notes</h4>
            <p>
                This page allows collection administrators and editors to upload data to be displayed on the occurrence map for profiles. This option should only be used for private or temporary data: datasets that are suitable for public use should be <a href="http://www.ala.org.au/get-involved/upload-data-sets/" target="_blank">provided to the Atlas of Living Australia</a>. For more advanced data exploration tools, see the <a href="http://sandbox.ala.org.au" target="_blank">Sandbox environment</a> (data in the sandbox are publically visible).
            </p>

            <p>
                Data uploaded via this page:
            </p>
            <ul>
                <li>
                    will not be visible to any other Atlas of Living Australia tools until or unless it is published to the Atlas of Living Australia server;
                </li>
                <li>
                    will only be visible to users who have permission to view the profiles in this collection;
                </li>
                <li>
                    cannot be used in conjunction with data from the Atlas of Living Australia, so occurrence maps will display <i>either</i> private data <i>or</i> public data, but not both. This option is controlled via the collection administration settings;
                </li>
                <li>
                    will remain on the server until a collection administrator or editor explicitly deletes it, even if the data source options are changed to use public data instead of private data;
                </li>
            </ul>
        </div>
    </div>
</div>