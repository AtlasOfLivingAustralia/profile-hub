package au.org.ala.profile.api

import au.org.ala.profile.hub.ProfileService
import au.org.ala.profile.security.RequiresAccessToken
import au.org.ala.web.AuthService
import grails.converters.JSON
import org.apache.http.HttpStatus
import org.springframework.http.HttpHeaders

class ApiInterceptor {
    static final String ACCESS_TOKEN_HEADER = 'Access-Token'
    ProfileService profileService
    AuthService authService
    int order = LOWEST_PRECEDENCE - 40

    ApiInterceptor() {
        match(controller: "api")
    }

    boolean before() {
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION)
        boolean authorised = false
        def opus
        String token = request.getHeader(ACCESS_TOKEN_HEADER)
        def controller = grailsApplication.getArtefactByLogicalPropertyName("Controller", controllerName)
        Class controllerClass = controller?.clazz
        def method = controllerClass?.getMethod(actionName, [] as Class[])

        if (authorization) {
            def user = authService.userDetails()
            if (user) {
                if (params.opusId && (opus = profileService.getOpus(params.opusId))) {
                    params.isOpusPrivate = opus.privateCollection
                    if ((params.isOpusPrivate
                            || controllerClass?.isAnnotationPresent(RequiresAccessToken)
                            || method?.isAnnotationPresent(RequiresAccessToken)
                    ) && (token != opus.accessToken)) {
                        log.warn("No valid access token for opus ${opus.uuid} when calling ${controllerName}/${actionName}")
                        authorised = false
                    } else {
                        authorised = true
                    }
                }
            }
        }

        if (!authorised) {
            log.debug "API access is not authorised to path ${request.requestURI}"
            response.status = HttpStatus.SC_FORBIDDEN
            render text: [message: "You are not authorized to access this resource. Provide a JWT token in Authorization header to authorize.", status: HttpStatus.SC_FORBIDDEN] as JSON
        }

        return authorised
    }

    boolean after() { true }

    void afterView() {
        // no-op
    }
}
