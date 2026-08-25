profileEditor.directive('closeModal', function () {
    return {
        restrict: 'E',
        require: [],
        scope: {
            close: '&'
        },
        template: '<button type="button" class="btn-close" aria-label="Close" ng-click="close()"></button>'
    };
});