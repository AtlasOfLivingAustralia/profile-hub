<div class="panel panel-default" ng-controller="OpusController as opusCtrl" ng-form="DeleteCollectionForm" ng-cloak>
    <div class="panel-heading">
        <a name="deleteCollection">
            <h4 class="section-panel-heading">Delete Collection</h4>
            <p:help help-id="opus.edit.deleteCollection"/>
        </a>
    </div>

    <div class="panel-body">
        <div class="row">
            <div class="col-sm-12">
                    <button ng-click="opusCtrl.deleteOpus()" class="btn btn-danger" target="_self">
                           <i class="fa fa-trash-o"></i> Delete this collection
                    </button>
            </div>
        </div>
    </div>
</div>