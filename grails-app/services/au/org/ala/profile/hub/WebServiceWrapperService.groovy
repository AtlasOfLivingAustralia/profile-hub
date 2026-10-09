package au.org.ala.profile.hub

import org.apache.http.entity.ContentType
import org.grails.web.util.WebUtils
/**
 * Adds florulaOverrideId to downstream GETs.
 * Anonymous Grails sessions contribute the phf cookie. A request that names a list
 * (florulaListId + florulaOpusUuid, or florulaOverrideId-<uuid>) contributes that
 * list for both anonymous and signed-in callers.
 */
class WebServiceWrapperService {

    static transactional = false
    static final FLORULA_OVERRIDE_PARAM = 'florulaOverrideId'
    static final FLORULA_LIST_PARAM = 'florulaListId'
    static final FLORULA_OPUS_PARAM = 'florulaOpusUuid'
    static final FLORULA_COOKIE = 'phf'

    def webService
    def authService
    FlorulaCookieService florulaCookieService

    Map get(String url, Map params = [:], ContentType contentType = ContentType.APPLICATION_JSON, boolean includeApiKey = true, boolean includeUser = true, Map customHeaders = [:]) {
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
        try {
            params = withExplicitFlorulaOverrides(params)
        } catch (Exception e) {
            log.trace("Couldn't read explicit florula override", e)
        }
        return webService.get(url, params, contentType, includeApiKey, includeUser, customHeaders)
    }

    private Map withExplicitFlorulaOverrides(Map params) {
        def webRequest = WebUtils.retrieveGrailsWebRequest()
        def request = webRequest?.request
        if (!request) {
            return params
        }

        String listId = request.getParameter(FLORULA_LIST_PARAM)
        String opusUuid = request.getParameter(FLORULA_OPUS_PARAM)
        if (listId && opusUuid) {
            params += [(FLORULA_OVERRIDE_PARAM + '-' + opusUuid): listId]
        }

        request.parameterMap.each { key, values ->
            if (key?.toString()?.startsWith(FLORULA_OVERRIDE_PARAM + '-') && values) {
                String value = values[0]?.toString()
                if (value) {
                    params += [(key.toString()): value]
                }
            }
        }
        return params
    }

    Map<String, String> extractFlorulaIds() {
        def wr = WebUtils.retrieveGrailsWebRequest()
        def request = wr.request
        return florulaCookieService.getCookieValue(request)
    }
}
