<div id="primaryImage"  class="primary-image" ng-show="imageCtrl.primaryImage" ng-cloak>
        <div class="thumbnail pull-left">
            <a href="" ng-click="imageCtrl.showMetadata(imageCtrl.primaryImage)" target="_blank">
                <ala-link href="${grailsApplication.config.getProperty('biocache.base.url')}${grailsApplication.config.getProperty('biocache.occurrence.record.path')}{{imageCtrl.primaryImage.occurrenceId}}"
                   target="_blank" ng-show="imageCtrl.primaryImage.largeImageUrl" disable="{{imageCtrl.primaryImage.type.name != OPEN}}" ng-cloak>
                    <img ng-src="${request.contextPath}{{imageCtrl.primaryImage.thumbnailUrl}}"
                         ng-if="imageCtrl.primaryImage.thumbnailUrl && imageCtrl.primaryImage.type.name != 'OPEN'"/>
                    <img ng-src="{{imageCtrl.primaryImage.largeImageUrl}}"
                         ng-if="imageCtrl.primaryImage.largeImageUrl && imageCtrl.primaryImage.type.name == 'OPEN'"/>
                </ala-link>
            </a>
        </div>
    <div class="clearfix"></div>
    <p class="caption">{{ imageCtrl.primaryImage.dataResourceName }}<br>
        <span ng-if="imageCtrl.imageCaption(imageCtrl.primaryImage)">
            <span ng-bind-html="imageCtrl.imageCaption(imageCtrl.primaryImage) | sanitizeHtml"></span>
            <span class="caption"  ng-if="imageCtrl.primaryImage.metadata.creator">
                by {{ imageCtrl.primaryImage.metadata.creator }}<span
                    ng-if="imageCtrl.primaryImage.metadata.created">,
                {{ imageCtrl.primaryImage.metadata.created | date: 'dd/MM/yyyy' }}</span>
            </span>
            <span ng-if="imageCtrl.primaryImage.metadata.rightsHolder">(&copy;
                {{ imageCtrl.primaryImage.metadata.rightsHolder }})</span>
        </span>
    </p>

    <div class="row">
        <div class="col-md-12" ng-show="imageCtrl.primaryImage" ng-controller="NavigationController as navCtrl">
            <a target="_self" href="" class="margin-top-1 inline-block"
               ng-click="navCtrl.navigateTo('images')">View all images</a>
        </div>
    </div>
</div>
