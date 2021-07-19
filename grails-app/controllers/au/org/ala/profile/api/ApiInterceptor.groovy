package au.org.ala.profile.api

import au.org.ala.profile.hub.ProfileService
import au.org.ala.web.AuthService
import org.apache.http.HttpStatus


class ApiInterceptor {
    static final String ACCESS_TOKEN_HEADER = 'ACCESS-TOKEN'
    ProfileService profileService
    AuthService authService

    ApiInterceptor() {
        match(uri: "/api/**")
        .excludes(uri: "/api") // api doc
    }

    boolean before() {
        if (grailsApplication.config.security.authorisation.disable != "true") {
            String userName = request.getHeader(grailsApplication.config.app.http.header.userName)
            boolean authorised = false
            def opus = null
            String token = request.getHeader(ACCESS_TOKEN_HEADER)
            if (userName) {
                def user = authService.getUserForEmailAddress(userName)
                if (user) {
                    if (params.opusId && (opus = profileService.getOpus(params.opusId))) {
                        params.isOpusPrivate = opus.privateCollection
                        if (params.isOpusPrivate && (token != opus.accessToken)) {
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
