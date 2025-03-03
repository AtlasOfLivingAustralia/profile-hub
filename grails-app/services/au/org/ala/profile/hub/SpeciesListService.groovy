package au.org.ala.profile.hub

import au.org.ala.ws.service.WebService


class SpeciesListService {

    def grailsApplication
    WebService webService

    def getListsForGuid(String guid) {
        webService.get("${grailsApplication.config.lists.base.url}/ws/species/${guid}")
    }

    def getAllLists() {
        webService.get("${grailsApplication.config.lists.base.url}/speciesList?page=1&pageSize=1000")
    }
}
