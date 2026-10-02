package au.org.ala.profile.hub

class BieService {

    def grailsApplication
    DownstreamGetCacheService downstreamGetCacheService

    def getSpeciesProfile(String guid) {
        String url = "${grailsApplication.config.getProperty('bie.ws.url')}/ws/species/${guid}"
        DownstreamGetCacheService.unwrap { downstreamGetCacheService.bieSpecies(url) }
    }
}
