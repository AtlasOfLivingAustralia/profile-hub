<div class="panel panel-default" ng-controller="OpusController as opusCtrl" ng-form="DeleteCollectionForm" ng-cloak>
    <div class="panel-heading">
        <a name="deleteCollection">
            <h4 class="section-panel-heading">Delete Collection</h4>
        </a>
    </div>

    <div class="panel-body">
        <div class="row">
            <div class="col-sm-12">
                <p class="bg-info alert alert-danger">
                    <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                    <span class="sr-only">Error:</span>Please note clicking delete button will delete this collection. All data of the collection will be lost and cannot be recovered. Only proceed if you are absolutely sure.
                </p>
            </div>
            <div class="col-sm-12">
                <button ng-click="opusCtrl.deleteOpus()" class="btn btn-danger" target="_self">
                       <i class="fa fa-trash-o"></i> Delete this collection
                </button>
            </div>
        </div>
    </div>
</div>