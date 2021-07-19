package au.org.ala.profile.hub

import au.org.ala.profile.hub.ProfileService
import au.org.ala.profile.security.PrivateCollectionSecurityExempt
import au.org.ala.profile.security.Role
import au.org.ala.profile.security.Secured
import au.org.ala.web.AuthService
import org.apache.http.HttpStatus

import java.lang.annotation.Annotation

class AccessControlInterceptor {

    AuthService authService
    ProfileService profileService

    AccessControlInterceptor(){
        matchAll()
        .excludes(uri: '/notAuthorised')
        .excludes(uri: '/error')
        .excludes(uri: '/notFound')
        .excludes(uri: '/api/**')
        .excludes(uri: '/webjars/swagger-ui/**')
    }

    boolean  before () {
        params.currentUserId = authService.userId
        params.currentUser = authService.getDisplayName()
        List<String> usersRoles = request.userPrincipal ? request.userPrincipal.attributes.authority.split(",") : []
        params.isALAAdmin = usersRoles.contains(Role.ROLE_ADMIN.toString())

        if (grailsApplication.config.security.authorisation.disable != "true") {
            boolean authorised = false

            String actionFullName = "${controllerName.capitalize()}Controller.${actionName}"

            try {
                log.debug "Checking security for ${actionFullName}"

                def controllerClass = grailsApplication.controllerClasses.find {
                    it.shortName.equalsIgnoreCase("${controllerName.capitalize()}Controller")
                }

                if (controllerName.equalsIgnoreCase('console')) {
                    authorised = usersRoles.contains(Role.ROLE_ADMIN.toString())
                } else if (actionName) {
                    def controllerAction = controllerClass.getClazz().getDeclaredMethod(actionName)

                    if (!usersRoles.contains(Role.ROLE_ADMIN.toString())) {
                        // If we have a request for a single opus, check if the user is associated with that opus.
                        // This needs to be done regardless of whether the action is secured because the outcome is
                        // used to determine what controls need to be displayed to the user (e.g. edit buttons) when
                        // rendering the (unsecured) views.
                        def opus = null
                        if (params.opusId && !params.opusId.contains(",") && (opus = profileService.getOpus(params.opusId))) {

                            params.isOpusAdmin = opus.authorities?.find {
                                it.userId == request.userPrincipal?.attributes?.userid && it.role == Role.ROLE_PROFILE_ADMIN.toString()
                            } != null

                            params.isOpusEditor = opus.authorities?.find {
                                it.userId == request.userPrincipal?.attributes?.userid && it.role == Role.ROLE_PROFILE_EDITOR.toString()
                            } != null || params.isOpusAdmin

                            params.isOpusAuthor = opus.authorities?.find {
                                it.userId == request.userPrincipal?.attributes?.userid && it.role == Role.ROLE_PROFILE_AUTHOR.toString()
                            } != null || params.isOpusAdmin //|| params.isOpusEditor

                            params.isOpusReviewer = opus.authorities?.find {
                                it.userId == request.userPrincipal?.attributes?.userid && it.role == Role.ROLE_PROFILE_REVIEWER.toString()
                            } != null || params.isOpusAdmin || params.isOpusAuthor || params.isOpusEditor

                            params.isOpusUser = !opus.privateCollection || opus.authorities?.find {
                                it.userId == request.userPrincipal?.attributes?.userid && it.role == Role.ROLE_USER.toString()
                            } != null || params.isOpusReviewer || params.isOpusAdmin || params.isOpusAuthor || params.isOpusEditor
                        }
                        log.debug("User ${request.userPrincipal?.name} is : Opus Admin? ${params.isOpusAdmin}; Opus editor? ${params.isOpusEditor}; Opus author? ${params.isOpusAuthor}; Opus reviewer? ${params.isOpusReviewer}; Opus user? ${params.isOpusUser};")

                        if (!opus || !opus.privateCollection || params.isOpusUser || controllerAction.isAnnotationPresent(PrivateCollectionSecurityExempt)) {
                            if (controllerAction.isAnnotationPresent(Secured) || controllerClass.getClazz().isAnnotationPresent(Secured)) {
                                Annotation annotation = controllerAction.getAnnotation(Secured) ?: controllerClass.getClazz().getAnnotation(Secured)

                                String requiredRole = annotation.role().toString()

                                if (annotation.opusSpecific()) {
                                    if (opus) {
                                        if (requiredRole == Role.ROLE_PROFILE_ADMIN.toString()) {
                                            authorised = params.isOpusAdmin
                                            log.debug "Action ${actionFullName} requires ROLE_PROFILE_ADMIN. User ${request.userPrincipal?.name} has it? ${authorised}"
                                        } else if (requiredRole == Role.ROLE_PROFILE_EDITOR.toString()) {
                                            authorised = params.isOpusAdmin || params.isOpusAuthor || params.isOpusEditor
                                            log.debug "Action ${actionFullName} requires ${requiredRole}. User ${request.userPrincipal?.name} has it? ${authorised}"
                                        } else if (requiredRole == Role.ROLE_PROFILE_AUTHOR.toString()) {
                                            authorised = params.isOpusAdmin || params.isOpusAuthor
                                            log.debug "Action ${actionFullName} requires ${requiredRole}. User ${request.userPrincipal?.name} has it? ${authorised}"
                                        } else if (requiredRole == Role.ROLE_PROFILE_REVIEWER.toString()) {
                                            authorised = params.isOpusAdmin || params.isOpusAuthor || params.isOpusReviewer || params.isOpusEditor
                                            log.debug "Action ${actionFullName} requires ${requiredRole}. User ${request.userPrincipal?.name} has it? ${authorised}"
                                        } else if (requiredRole == Role.ROLE_USER.toString()) {
                                            authorised = params.isOpusAdmin || params.isOpusAuthor || params.isOpusReviewer || params.isOpusUser || params.isOpusEditor
                                        }
                                    } else {
                                        log.debug "Security for action ${actionFullName} is opus specific, but no matching opus was found with id ${params.opusId}"
                                    }
                                }
                            } else {
                                log.debug "Action ${actionFullName} is not secured"
                                authorised = true
                            }
                        } else {
                            log.debug "The collection is private and the user is not registered with the collection."
                        }
                    } else {
                        params.isOpusAdmin = true
                        params.isOpusAuthor = true
                        params.isOpusEditor = true
                        params.isOpusReviewer = true
                        params.isOpusUser = true
                        log.debug "User ${request.userPrincipal?.name} is an ALA Admin user"
                        authorised = true
                    }
                }
            } catch (e) {
                log.error("Authorisation check failed", e)
            }

            if (!authorised) {
                log.debug "User ${request.userPrincipal?.name} is not authorised to access action ${actionFullName}"
                response.status = HttpStatus.SC_FORBIDDEN
                response.sendError(HttpStatus.SC_FORBIDDEN)
            }

            return authorised
        } else {
            boolean authenticated = authService.getDisplayName() != null
            params.isOpusAdmin = authenticated
            params.isOpusAuthor = authenticated
            params.isOpusEditor = authenticated
            params.isOpusReviewer = authenticated
            params.isOpusUser = authenticated
            log.warn "**** Authorisation has been disabled! ****"
            return true
        }
    }

    boolean  after () {
        true
    }

    void  afterView () {

    }
}
