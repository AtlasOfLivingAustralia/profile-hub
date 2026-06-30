profileEditor.directive('closeModal', function () {
    return {
        restrict: 'E',
        require: [],
        scope: {
            close: '&'
        },
        template: '<a href="" class="float-end" ng-click="close()"><span class="fa fa-close"></span></a>'
    };
});