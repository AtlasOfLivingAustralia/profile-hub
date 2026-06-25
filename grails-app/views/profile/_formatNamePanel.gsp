<div  ng-show="profileCtrl.showFormatNameControls" class="padding-top-1" ng-cloak ng-form="FormatNameForm">
     <div class="row">
        <div class="float-end">
            <a href="" class="close-edit-name" ng-click="profileCtrl.formatNameEdit(FormatNameForm)"
               ng-show="!profileCtrl.readonly()"><span class="fa fa-close">&nbsp;</span>Close</a>
        </div>
     </div>
    <div class="panel panel-default"  >
        <div class="panel-body">

           <div class="row">
                <div class="col-md-12">
                    <textarea id="manualFormatName" ng-model="profileCtrl.formattedNameText" name="manualFormatName" ckeditor="richTextSingleLine"></textarea>
                </div>
           </div>
        </div>

       <div class="panel-footer">
            <div class="row">
                <div class="col-md-12">
                    <div class="float-end">
                        <button class="btn btn-outline-secondary" ng-click="profileCtrl.toggleFormatName(true, FormatNameForm)">Cancel Manual Formatting</button>
                        <button class="btn btn-primary" ng-click="profileCtrl.saveProfileSettings(FormatNameForm)">Update Manual Formatting</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>