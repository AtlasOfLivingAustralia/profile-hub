package au.org.ala.profile.api

import au.org.ala.profile.hub.ProfileService
import au.org.ala.profile.security.RequiresAccessToken
import au.org.ala.web.AuthService
import org.apache.http.HttpStatus

class ApiInterceptor {
    static final String ACCESS_TOKEN_HEADER = 'Access-Token'
    ProfileService profileService
    AuthService authService

    ApiInterceptor() {
        match(uri: "/api/**")
        .excludes(uri: "/api") // api doc
        .excludes(uri: "/webjars/**")
    }

    boolean before() {
        if (grailsApplication.config.security.authorisation.disable != "true") {
            String userName = request.getHeader(grailsApplication.config.app.http.header.userName)
            boolean authorised = false
            def opus
            String token = request.getHeader(ACCESS_TOKEN_HEADER)
            def controller = grailsApplication.getArtefactByLogicalPropertyName("Controller", controllerName)
            Class controllerClass = controller?.clazz
            def method = controllerClass?.getMethod(actionName, [] as Class[])

            if (userName) {
                def user = authService.getUserForEmailAddress(userName)
                if (user) {
                    if (params.opusId && (opus = profileService.getOpus(params.opusId))) {
                        params.isOpusPrivate = opus.privateCollection
                        if ((params.isOpusPrivate
                                || controllerClass?.isAnnotationPresent(RequiresAccessToken)
                                || method?.isAnnotationPresent(RequiresAccessToken)
                        ) && (token != opus.accessToken)) {
                            log.warn("No valid access token for opus ${opus.uuid} when calling ${controllerName}/${actionName}")
                            authorised = false
                        }
                        else {
                            authorised = true
                        }
                    }
                }
            }

            if (!authorised) {
                log.debug "API access is not authorised to path ${request.requestURI}"
                response.status = HttpStatus.SC_FORBIDDEN
                response.sendError(HttpStatus.SC_FORBIDDEN)
            }

            return authorised
        } else {
            params.isOpusPrivate = false
            return  true
        }
    }

    boolean after() { true }

    void afterView() {
        // no-op
    }
}
