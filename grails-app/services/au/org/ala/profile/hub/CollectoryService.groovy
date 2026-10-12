package au.org.ala.profile.hub

import au.org.ala.ws.service.WebService

class CollectoryService {

    def grailsApplication
    WebService webService
    DownstreamGetCacheService downstreamGetCacheService

    Map<String, String> getDataResources() {
        Map dataResources = [:]

        try {
            Map resources = DownstreamGetCacheService.unwrap {
                downstreamGetCacheService.collectoryResources("${grailsApplication.config.getProperty('collectory.base.url')}/ws/dataResource")
            } as Map
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
            Map hubs = DownstreamGetCacheService.unwrap {
                downstreamGetCacheService.collectoryHubs("${grailsApplication.config.getProperty('collectory.base.url')}/ws/dataHub")
            } as Map
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
        DownstreamGetCacheService.unwrap {
            downstreamGetCacheService.collectoryLicences("${grailsApplication.config.getProperty('collectory.base.url')}/ws/licence")
        }
    }
}
