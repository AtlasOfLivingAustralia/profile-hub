package au.org.ala.profile.hub

import au.org.ala.profile.security.Role
import grails.converters.JSON

class UserController extends BaseController {

    UserService userService
    ProfileService profileService

    def findUser() {
        if (!params.userName) {
            badRequest "userName is a required parameter"
        } else {
            log.debug "Searching for user ${params.userName}....."

            def response = userService.findUser(params.userName)

            if (!response) {
                notFound()
            } else {
                render response as JSON
            }
        }
    }

    def getUserDetails() {

        Map user = profileService.getUserDetails(params.opusId)
        if(user) {
            if (!user.roles) {
                user.roles = []
            }

            if (params.isALAAdmin) {
                user.roles << Role.ROLE_ADMIN.name()
            }

            render user as JSON
        } else {
            render text: [:] as JSON
        }

    }
}
