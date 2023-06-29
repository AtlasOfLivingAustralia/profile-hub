/**
 * Created by temi varghese on 14/07/15.
 */
profileEditor.controller('DoiController', function (util, $filter, profileService, messageService) {
    var self = this;
    self.opusId = null;
    self.profileId = null;
    self.uuid = null;
    self.scientificName = null;
    self.pubId = util.getEntityId('publication');

    self.profile = null;
    self.publications = [];
    self.selectedPublication = null;

    var orderBy = $filter("orderBy");

    self.init = function (publications, profileId, opusId) {
        // makes lastest version appear first
        self.publications = orderBy(JSON.parse(publications), 'publicationDate', true);
        profileService.getProfile(opusId, profileId).then(function (data) {
            self.profile = data.profile;
            self.opus = data.opus;
            self.profileId = profileId;
            self.opusId = opusId;
        }, function() {
            messageService.alert("An error has occurred while retrieving the publication details.")
        });

        self.getSelectedPublication();
    };

    self.getSelectedPublication = function () {
        self.publications.forEach(function (item) {
            if (item.uuid == self.pubId) {
                self.selectedPublication = item;
            }
        });
    }

    self.trackDownload = function (context, opusId, profileId, publicationId) {
        var url =  context + '/opus/' + opusId + '/profile/' + profileId + '/publication/' + publicationId + '/file'
        profileService.trackPageview(url);
    }

});