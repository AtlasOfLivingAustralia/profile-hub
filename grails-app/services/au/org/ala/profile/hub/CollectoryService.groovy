package au.org.ala.profile.hub

import au.org.ala.ws.service.WebService

class CollectoryService {

    def grailsApplication
    WebService webService

    Map<String, String> getDataResources() {
        Map dataResources = [:]

        try {
            Map resources = webService.get("${grailsApplication.config.getProperty('collectory.base.url')}/ws/dataResource")
            resources?.resp?.each {
                dataResources.put(it.uid, it.name)
            }
        } catch (Exception e) {
            log.error("Unable to retrieve data resources", e)
        }

        dataResources
    }

    Map<String, String> getDataHubs() {
        Map dataHubs = [:]

        try {
            Map hubs = webService.get("${grailsApplication.config.getProperty('collectory.base.url')}/ws/dataHub")
            hubs?.resp?.each {
                dataHubs.put(it.uid, it.name)
            }
        } catch (Exception e) {
            log.error("Unable to retrieve data hubs", e)
        }

        dataHubs
    }

    def getDataResource(String dataResourceUid) {
        webService.get("${grailsApplication.config.getProperty('collectory.base.url')}/ws/dataResource/${dataResourceUid}")
    }

    def getDataHub(String dataHubUid) {
        webService.get("${grailsApplication.config.getProperty('collectory.base.url')}/ws/dataHub/${dataHubUid}")
    }

    def getLicences() {
        webService.get("${grailsApplication.config.getProperty('collectory.base.url')}/ws/licence")
    }
}
