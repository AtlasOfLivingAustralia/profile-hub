package au.org.ala.profile.hub

import au.org.ala.ws.service.WebService
import org.apache.http.entity.ContentType

/**
 * Service for interacting with the Biodiversity Library
 *
 * http://www.biodiversitylibrary.org/api2/docs/docs.html
 */
class BiodiversityLibraryService {

    def grailsApplication
    WebService webService

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
        def apiKey = grailsApplication.config.biodiv.library.api.key

        String url = "${grailsApplication.config.biodiv.library.httpquery.url.prefix}op=Get${noun}Metadata&format=json&${noun.toLowerCase()}id=${id}&apikey=${apiKey}${suffix}"

        try {
            if (json) {
                webService.get(url, [:], ContentType.APPLICATION_JSON, false, false).resp
            } else {
                new URL(url).text
            }
        }
        catch (Exception e) {
            log.warn("Failed to retrieve data from " + url, e)
        }
    }
}
