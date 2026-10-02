<div ng-controller="AttributeEditor as attrCtrl" ng-init="attrCtrl.init('${edit}')">
    <div ng-controller="ImagesController as imageCtrl">
        <div class="row">
            <div class="col-md-12 padding-bottom-1" ng-cloak>
                <button ng-show="!attrCtrl.readonly" ng-click="attrCtrl.addAttribute()" class="btn btn-outline-secondary"><i
                        class="fa fa-plus"></i>&nbsp;Add attribute
                </button>
                <p:help help-id="profile.edit.attribute" show="${edit}" collection-override="${opus?.help?.attributeLink}"/>

                <div class="small float-end"
                     ng-form="ShowSupportingAttributesForm" ng-show="(!attrCtrl.readonly && (attrCtrl.opus.showLinkedOpusAttributes || attrCtrl.opus.allowCopyFromLinkedOpus))">
                    Show information from supporting collections:
                    <div class="btn-group">
                        <label class="btn btn-xs" ng-class="attrCtrl.showSupportingData ? 'btn-success' : 'btn-outline-secondary'"
                               ng-model="attrCtrl.showSupportingData" ng-change="attrCtrl.toggleShowSupportingData(ShowSupportingAttributesForm)"
                               btn-radio="true">On</label>
                        <label class="btn btn-xs" ng-class="attrCtrl.showSupportingData ? 'btn-outline-secondary' : 'btn-danger'"
                               ng-model="attrCtrl.showSupportingData" ng-change="attrCtrl.toggleShowSupportingData(ShowSupportingAttributesForm)"
                               btn-radio="false">Off</label>
                    </div>
                </div>

                <g:if test="${edit}">
                    <!-- edit screen -->
                    <ng-include src="'/profileEditor/showEditableAttributeList.htm'" ng-show="!attrCtrl.readonly"></ng-include>
                </g:if>
                <g:else>
                    <!-- view screen -->
                    <ng-include src="'/profileEditor/showReadOnlyAttributeList.htm'" ng-show="attrCtrl.readonly"></ng-include>
                </g:else>
            </div>
        </div>
    </div>
</div>
