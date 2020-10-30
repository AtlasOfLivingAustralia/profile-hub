/**
 * Created by Temi Varghese on 15/07/15.
 */
profileEditor.directive('publication', function ($browser) {
    return {
        restrict: 'E',
        require: [],
        scope: {
            publication: '=data',
            opusId: '=',
            profileId: '=',
            prefix: '@'
        },
        templateUrl: '/profileEditor/publication.htm',
        controller: ['$scope', 'config', function ($scope, config) {
            $scope.context = config.contextPath;
        }],
        link: function (scope, element, attrs, ctrl) {

        }
    }
});