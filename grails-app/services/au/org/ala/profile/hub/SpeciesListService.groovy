package au.org.ala.profile.hub

class SpeciesListService {

    def grailsApplication
    DownstreamGetCacheService downstreamGetCacheService

    def getListsForGuid(String guid) {
        def path = grailsApplication.config.getProperty('lists.species.path', String, '/ws/species')
        String url = "${grailsApplication.config.getProperty('lists.base.url')}${path}/${guid}"
        DownstreamGetCacheService.unwrap { downstreamGetCacheService.speciesListsByGuid(url) }
    }

    def getAllLists() {
        String url = "${grailsApplication.config.getProperty('lists.base.url')}/ws/speciesList?max=1000"
        DownstreamGetCacheService.unwrap { downstreamGetCacheService.speciesLists(url) }
    }
}
