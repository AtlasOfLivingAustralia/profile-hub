package au.org.ala.profile.hub

import au.org.ala.web.AuthService
import au.org.ala.ws.service.WebService

class UserService {
    def grailsApplication
    AuthService authService
    WebService webService

    def getCurrentUserDisplayName() {
        authService.displayName ?: "" //?:"mark.woolston@csiro.au"
    }

    def getCurrentUserId() {
        authService.userId ?: ""
    }

    def findUser(String username) {
        authService.getUserForEmailAddress(username)
    }

    def userInRole(role) {
        authService.userInRole(role)
    }

    def userIsSiteAdmin() {
        (authService.userInRole(grailsApplication.config.getProperty('security.cas.officerRole'))
                || authService.userInRole(grailsApplication.config.getProperty('security.cas.adminRole'))
                || authService.userInRole(grailsApplication.config.getProperty('security.cas.alaAdminRole')))
    }

    def checkEmailExists(String email) {
        def resp = authService.getUserForEmailAddress(email)
        return resp?.userId ?: ""
    }
}