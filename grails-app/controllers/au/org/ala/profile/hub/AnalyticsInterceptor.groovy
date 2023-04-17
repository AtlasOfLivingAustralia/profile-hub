package au.org.ala.profile.hub

import au.org.ala.profile.analytics.Analytics
import au.org.ala.web.AuthService
import grails.core.GrailsApplication
import io.swagger.v3.oas.annotations.Operation
import au.org.ala.grails.AnnotationMatcher
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders

import javax.annotation.PostConstruct
import javax.servlet.http.Cookie

import static com.google.common.net.HttpHeaders.REFERER
import static com.google.common.net.HttpHeaders.USER_AGENT

class AnalyticsInterceptor {

    @Autowired
    GrailsApplication grailsApplication
    @Autowired(required = false)
    AnalyticsService analyticsService
    @Autowired
    AuthService authService
    @Autowired
    WebServiceWrapperService webServiceWrapperService

    // Code runs after controller action is called. Ordering it such that it is called last.
    int order = HIGHEST_PRECEDENCE

    AnalyticsInterceptor () {

    }

    @PostConstruct
    void init () {
        AnnotationMatcher.matchAnnotation(this, grailsApplication, Analytics)
    }

    boolean before () {
        true
    }

    boolean after () {
        try {
            if (response.getStatus() in 200..299) { // only care about successful HTTP responses
                final artefact = grailsApplication.getArtefactByLogicalPropertyName('Controller', controllerName)
                final annotation = artefact?.clazz.with { clazz ->
                    (clazz?.methods.find { it.name == actionName }?.getAnnotation(Analytics) ?: clazz?.declaredFields.find { it.name == actionName }?.getAnnotation(Analytics)) ?: clazz?.getAnnotation(Analytics)
                }
                if (annotation) {
                    final clientId = extractClientIdFromGoogleAnalyticsCookie(request.cookies)
                    final path = URLDecoder.decode(request.forwardURI, 'utf-8')
                    Map payload = [:]
                    def classAction = artefact.getClazz().methods.find {it.name == actionName}
                    Operation operation = classAction.getAnnotation(Operation)
                    if (operation) {
                        // page title
                        payload.dt = operation.summary() ?: ""
                        payload[grailsApplication.config.app.analytics.apiid] = operation.operationId() ?: ""
                        if (params.opusId) payload[grailsApplication.config.app.analytics.collectionid] = params.opusId
                        if (params.profileId) payload[grailsApplication.config.app.analytics.profileid] = params.profileId

                        def userId = authService.getUserId()
                        if (userId) payload[grailsApplication.config.app.analytics.userid] = userId
                        else {
                            String authorization = request.getHeader(HttpHeaders.AUTHORIZATION)
                            if (authorization) {
                                payload[grailsApplication.config.app.analytics.userid] = Utils.getClientId(authorization)
                            }
                        }
                    }

                    log.debug("Sending pageview to analytics for ${request.serverName}, $path, $clientId, ${request.remoteAddr}")
                    analyticsService?.pageView(request.serverName, path, clientId, request.remoteAddr, request.getHeader(USER_AGENT), request.getHeader(REFERER), payload)
                }
            }
        } catch (e) {
            log.error("Caught exception in analytics filter", e)
        }

        true
    }

    void afterView () {
    }

    /**
     * 1. Under Measurement Protocol it's recommended that you use UUID v4 format to produce standard, unique client
     * IDs. However, it also supports the old X.Y 32-bit IDs used in the previous generation of GA.

     * 2. Universal Analytics analytics.js creates a cookie called _ga. There's just one cookie, not several as there used
     * to be in ye olde GA. The cookie contains four values: GA1.2.299259584.1357814039257.
     * (There are no longer two underscores as there were on old GA cookies).
     *
     * GA1 = The cookie format version
     * 2 = The domain depth on which the cookie is written
     * 299259584.1357814039257 = The client id (cid)
     *
     * Using this CID will ensure server side analytics events match to the same user as the client side events.
     *
     * Source: https://plus.google.com/110147996971766876369/posts/Mz1ksPoBGHx
     *
     * If the CID can't be extracted from the cookie, a random UUID is used instead.  A CID may not be available in
     * the case that a download or PDF link has been given directly to a user.
     * TODO use a persistent UUID per user.
     *
     * @param cookies The cookies from a request
     * @return The Google Analytics CID parameter
     */
    private String extractClientIdFromGoogleAnalyticsCookie(Cookie[] cookies) {
        final GA_VERSION_INDEX = 0
        final GA_CLIENT_ID_PART_1_INDEX = 2
        final GA_CLIENT_ID_PART_2_INDEX = 3
        final GA_COOKIE_PARTS_EXPECTED_LENGTH = 4
        final GA_EXPECTED_VERSION = 'GA1'
        final cookie = cookies.find { it.name == '_ga' }
        String clientId = ''
        if (cookie) {
            final analyticsCookieComponents = cookie.value.split('\\.')
            if (analyticsCookieComponents.length > 1
                    && analyticsCookieComponents[GA_VERSION_INDEX] == GA_EXPECTED_VERSION
                    && analyticsCookieComponents.length == GA_COOKIE_PARTS_EXPECTED_LENGTH) {
                clientId = analyticsCookieComponents[GA_CLIENT_ID_PART_1_INDEX] + '.' + analyticsCookieComponents[GA_CLIENT_ID_PART_2_INDEX]
            } else {
                log.warn("Got Google Analytics cookie but not of a known version: ${cookie.value}")
            }
        }

        if (!clientId) {
            clientId = UUID.randomUUID().toString()
        }

        return clientId
    }
}
