package au.org.ala.profile.hub

import org.apache.http.entity.ContentType
import org.grails.web.util.WebUtils
import org.pac4j.core.config.Config
import org.pac4j.http.client.direct.DirectBearerAuthClient
import org.springframework.beans.factory.annotation.Autowired
/**
 * XXX Used to add florulaOverrideId to all GET requests if the cookie exists
 */
class WebServiceWrapperService {

    static transactional = false
    static final FLORULA_OVERRIDE_PARAM = 'florulaOverrideId'
    static final FLORULA_COOKIE = 'phf'

    def webService
    def authService
    FlorulaCookieService florulaCookieService
    @Autowired(required = false)
    Config config
    @Autowired(required = false)
    DirectBearerAuthClient directBearerAuthClient

    Map get(String url, Map params = [:], ContentType contentType = ContentType.APPLICATION_JSON, boolean includeApiKey = true, boolean includeUser = true, Map customHeaders = [:]) {
        // only add it if there is no current user
        try {
            if (!authService.userId) {
                def florulaIds = extractFlorulaIds()
                if (florulaIds) {
                    florulaIds.each {
                        params += [(FLORULA_OVERRIDE_PARAM + '-' + it.key): it.value]
                    }
                }
            }
        } catch (IllegalStateException e) {
            // not in a request context, so authService.userId will fail
            // continue and move on, note that florula won't work for anonymous user for
            // these methods
            log.trace("Couldn't get florula ids from request", e)
        }
        return webService.get(url, params, contentType, includeApiKey, includeUser, customHeaders)
    }

    Map<String, String> extractFlorulaIds() {
        def wr = WebUtils.retrieveGrailsWebRequest()
        def request = wr.request
        return florulaCookieService.getCookieValue(request)
    }
}
