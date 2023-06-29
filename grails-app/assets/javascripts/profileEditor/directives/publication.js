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
        controller: ['$scope', 'config', 'profileService', function ($scope, config, profileService) {
            $scope.context = config.contextPath;
            $scope.trackDownload = function (context, opusId, profileId, publicationId) {
                var url =  context + '/opus/' + opusId + '/profile/' + profileId + '/publication/' + publicationId + '/file'
                profileService.trackPageview(url);
            }
        }],
        link: function (scope, element, attrs, ctrl) {

        }
    }
});