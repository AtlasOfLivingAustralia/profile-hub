package au.org.ala.profile.hub

import au.org.ala.ws.service.WebService


class SpeciesListService {

    def grailsApplication
    WebService webService

    def getListsForGuid(String guid) {
        def path = grailsApplication.config.getProperty('lists.species.path', String, '/ws/species')
        webService.get("${grailsApplication.config.getProperty('lists.base.url')}${path}/${guid}")
    }

    def getAllLists() {
        webService.get("${grailsApplication.config.getProperty('lists.base.url')}/ws/speciesList?max=1000")
    }
}