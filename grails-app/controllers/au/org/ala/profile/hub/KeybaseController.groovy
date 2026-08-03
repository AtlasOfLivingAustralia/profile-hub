package au.org.ala.profile.hub

import au.org.ala.ws.service.WebService
import grails.converters.JSON

class KeybaseController extends BaseController {

    ProfileService profileService
    KeybaseService keybaseService
    WebService webService

    /** Acts as a proxy to the keybase server as it doesn't currently support https  */
    def keyLookup() {
        webService.proxyGetRequest(response, "${grailsApplication.config.getProperty('keybase.key.lookup')}?${request.queryString}", false, false)
    }

    def findKey() {
        if (!params.opusId || !params.scientificName) {
            badRequest "opusId and scientificName are required parameters"
        } else {
            def model = profileService.getProfile(params.opusId as String, params.scientificName as String)

            String key = keybaseService.findKeyForTaxon(model.profile.scientificName, model.opus.keybaseProjectId)

            render ([keyId: key] as JSON)
        }
    }

}
