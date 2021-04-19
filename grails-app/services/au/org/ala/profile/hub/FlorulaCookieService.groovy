package au.org.ala.profile.hub

import com.google.common.base.Charsets
import grails.converters.JSON
import org.grails.web.json.JSONObject
import grails.web.mapping.LinkGenerator

import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletRequest

import static au.org.ala.profile.hub.WebServiceWrapperService.FLORULA_COOKIE

class FlorulaCookieService {

    static transactional = false

    LinkGenerator grailsLinkGenerator

    def findCookie(HttpServletRequest request) {
        def cookie = request.cookies.find { it.name == FLORULA_COOKIE }

        return cookie
    }

    Cookie updateCookie(HttpServletRequest request, String opusId, String listId) {
        def cookie = findCookie(request)
        if (!cookie) {
            cookie = new Cookie(FLORULA_COOKIE, encodeCookieValue( [ (opusId) : listId ] ))
        } else {
            cookie.setValue(encodeCookieValue(decodeCookieValue(cookie.value) + [ (opusId) : listId ]))
        }
        cookie.httpOnly = false
        cookie.maxAge = -1
        cookie.secure = false
        def path = grailsLinkGenerator.contextPath
        path = path.isEmpty() ? "/" : path
        cookie.setPath(path)
        cookie.setDomain(request.serverName)
        return cookie
    }

    Map<String,String> getCookieValue(HttpServletRequest request) {
        def cookie = findCookie(request)
        return cookie ? decodeCookieValue(cookie.value) : [:]
    }

    String getFlorulaListIdForOpusId(HttpServletRequest request, String opusId) {
        getCookieValue(request)[opusId]
    }

    private Map<String,String> decodeCookieValue(String value) {
        try {
            return (JSONObject)JSON.parse(new String(value.decodeBase64(), Charsets.UTF_8))
        } catch (e) {
            log.info("Couldn't parse florula override cookie value $value", e)
            return [:]
        }
    }

    private String encodeCookieValue(Map<String, String> value) {
        (value as JSON).toString(false).getBytes(Charsets.UTF_8).encodeAsBase64()
    }
}
