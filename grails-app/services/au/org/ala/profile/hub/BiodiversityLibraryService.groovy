package au.org.ala.profile.hub

import au.org.ala.ws.service.WebService

/**
 * Service for interacting with the Biodiversity Library
 *
 * http://www.biodiversitylibrary.org/api2/docs/docs.html
 */
class BiodiversityLibraryService {

    def grailsApplication
    WebService webService
    DownstreamGetCacheService downstreamGetCacheService

    def lookupItem(Integer itemId) {
        lookup("Item", itemId, true)
    }

    def lookupTitle(Integer titleId) {
        lookup("Title", titleId, true, "&items=t")
    }

    def lookupPage(Integer pageId) {
        lookup("Page", pageId, true)
    }

    private lookup = { String noun, Integer id, boolean json, String suffix = "" ->
        def apiKey = grailsApplication.config.getProperty('biodiv.library.api.key')

        String url = "${grailsApplication.config.getProperty('biodiv.library.httpquery.url.prefix')}op=Get${noun}Metadata&format=json&${noun.toLowerCase()}id=${id}&apikey=${apiKey}${suffix}"

        try {
            if (json) {
                downstreamGetCacheService.bhlMetadata(url)?.resp
            } else {
                new URL(url).text
            }
        }
        catch (UncacheableResultException ignored) {
            null
        }
        catch (Exception e) {
            log.warn("Failed to retrieve data from " + url, e)
        }
    }
}
