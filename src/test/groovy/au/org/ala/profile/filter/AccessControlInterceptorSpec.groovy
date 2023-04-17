package au.org.ala.profile.filter

import au.org.ala.profile.hub.*
import au.org.ala.profile.security.PrivateCollectionSecurityExempt
import au.org.ala.profile.security.Role
import au.org.ala.profile.security.Secured
import au.org.ala.web.AuthService
import au.org.ala.ws.service.WebService
import ch.qos.logback.classic.Logger
import grails.converters.JSON
import grails.events.Events
import grails.testing.web.interceptor.InterceptorUnitTest
import org.grails.spring.beans.factory.InstanceFactoryBean
import org.grails.web.servlet.mvc.GrailsWebRequest
import org.grails.web.util.GrailsApplicationAttributes
import spock.lang.Specification
import spock.lang.Unroll

import java.security.Principal

import static au.org.ala.profile.hub.util.HubConstants.*

@Unroll
class AccessControlInterceptorSpec extends Specification implements InterceptorUnitTest<AccessControlInterceptor> {

    def controller = new SecuredController()
    Map users
    Logger log

    // the following is required to get defineBeans to work in grails 2.5.2
    def doWithSpring = {
        authService au.org.ala.web.AuthService
        profileService au.org.ala.profile.hub.ProfileService
    }

    def setup() {
        grailsApplication.config.security.authorisation.disable = false
        grailsApplication.config.lists.base.url = "http://lists.ala.org.au"
        grailsApplication.config.image.staging.dir = "/data/profile-hub/"
        users = [
                'NOT_LOGGED_IN_USER' : null,
                'LOGGED_IN_USER': new User([authority: "", userid: "9876"]),
                'PRIVATE_USER': new User([authority: "", userid: "PROFILE_REVIEWER_USER"]),
                'REVIEWER': new User([authority: "", userid: "PROFILE_REVIEWER_USER"]),
                'EDITOR': new User([authority: "", userid: "PROFILE_EDITOR_USER"]),
                'AUTHOR': new User([authority: "", userid: "PROFILE_AUTHOR_USER"]),
                'ADMIN': new User([authority: "", userid: "PROFILE_ADMIN_USER"]),
                'ALA_ADMIN': new User([authority: "ROLE_ADMIN"])
        ]

    }

    void "ALA Administrators are allowed to do everything"() {
        setup:
        // need to do this because grailsApplication.controllerClasses is empty in the filter when run from the unit test
        // unless we manually add the dummy controller class used in this test
        grailsApplication.addArtefact("Controller", SecuredController)
//        def controller = (SecuredController) mockController(SecuredController)

        defineBeans {
            authService(MockAuthService)
            profileService(MockProfileService)
            delegateService(MockDelegateService)
        }

        // added call to mockInterceptor method since the first call to withInterceptors does not create
        // interceptor bean correctly, failing the test. More details on this issue.
        // https://github.com/grails/grails-testing-support/issues/29
        mockInterceptor(AccessControlInterceptor)

        when:
        params.opusId = "12345"
        request.userPrincipal = new User([authority: "ROLE_ADMIN"])
        request.setAttribute(GrailsApplicationAttributes.CONTROLLER_NAME_ATTRIBUTE, 'secured')
        request.setAttribute(GrailsApplicationAttributes.ACTION_NAME_ATTRIBUTE, action)
        withInterceptors(controller: "secured", action: action) {

            controller."${action}"()
        }

        then:
        response.status == responseCode
        params.isALAAdmin == true
        params.isOpusAdmin == true
        params.isOpusEditor == true
        params.isOpusAuthor == true
        params.isOpusReviewer == true

        where:
        action                  | responseCode
        "publicAction"          | 200
        "alaAdminAction"        | 200
        "profileAdminAction"    | 200
        "profileEditorAction"   | 200
        "profileAuthorAction"   | 200
        "profileReviewerAction" | 200
    }

    void "public users are only allowed to access unsecured actions"() {
        setup:
        // need to do this because grailsApplication.controllerClasses is empty in the filter when run from the unit test
        // unless we manually add the dummy controller class used in this test
        grailsApplication.addArtefact("Controller", SecuredController)

        defineBeans {
            authService(MockAuthService)
            profileService(MockProfileService)
            delegateService(MockDelegateService)
        }

        when:
        params.opusId = "12345"
        request.userPrincipal = new User([authority: ""])
        request.setAttribute(GrailsApplicationAttributes.CONTROLLER_NAME_ATTRIBUTE, 'secured')
        request.setAttribute(GrailsApplicationAttributes.ACTION_NAME_ATTRIBUTE, action)

        withInterceptors(controller: "secured", action: action) {

            controller."${action}"()
        }

        then:
        response.status == responseCode
        params.isALAAdmin == false
        params.isOpusAdmin == false
        params.isOpusEditor == false
        params.isOpusAuthor == false
        params.isOpusReviewer == false

        where:
        action                  | responseCode
        "publicAction"          | 200
        "alaAdminAction"        | 403
        "profileAdminAction"    | 403
        "profileEditorAction"   | 403
        "profileAuthorAction"   | 403
        "profileReviewerAction" | 403
    }

    void "profile admins can access public and opus-specific admin and edit actions"() {
        setup:
        // need to do this because grailsApplication.controllerClasses is empty in the filter when run from the unit test
        // unless we manually add the dummy controller class used in this test
        grailsApplication.addArtefact("Controller", SecuredController)

        defineBeans {
            authService(MockAuthService)
            profileService(MockProfileService)
            delegateService(MockDelegateService)
        }

        when:
        params.opusId = "admin1"
        request.userPrincipal = new User([authority: "", userid: "PROFILE_ADMIN_USER"])
        request.setAttribute(GrailsApplicationAttributes.CONTROLLER_NAME_ATTRIBUTE, 'secured')
        request.setAttribute(GrailsApplicationAttributes.ACTION_NAME_ATTRIBUTE, action)

        withInterceptors(controller: "secured", action: action) {

            controller."${action}"()
        }

        then:
        response.status == responseCode
        params.isALAAdmin == false
        params.isOpusAdmin == true
        params.isOpusEditor == true
        params.isOpusAuthor == true
        params.isOpusReviewer == true

        where:
        action                  | responseCode
        "publicAction"          | 200
        "alaAdminAction"        | 403
        "profileAdminAction"    | 200
        "profileEditorAction"   | 200
        "profileAuthorAction"   | 200
        "profileReviewerAction" | 200

    }

    void "profile editors can access public and opus-specific edit actions"() {
        setup:
        // need to do this because grailsApplication.controllerClasses is empty in the filter when run from the unit test
        // unless we manually add the dummy controller class used in this test
        grailsApplication.addArtefact("Controller", SecuredController)

        defineBeans {
            authService(MockAuthService)
            profileService(MockProfileService)
            delegateService(MockDelegateService)
        }

        when:
        params.opusId = "editor1"
        request.userPrincipal = new User([authority: "", userid: "PROFILE_EDITOR_USER"])
        request.setAttribute(GrailsApplicationAttributes.CONTROLLER_NAME_ATTRIBUTE, 'secured')
        request.setAttribute(GrailsApplicationAttributes.ACTION_NAME_ATTRIBUTE, action)

        withInterceptors(controller: "secured", action: action) {

            controller."${action}"()
        }

        then:
        response.status == responseCode
        params.isALAAdmin == false
        params.isOpusAdmin == false
        params.isOpusEditor == true
        params.isOpusAuthor == false
        params.isOpusReviewer == true

        where:
        action                  | responseCode
        "publicAction"          | 200
        "alaAdminAction"        | 403
        "profileAdminAction"    | 403
        "profileEditorAction"   | 200
        "profileAuthorAction"   | 403
        "profileReviewerAction" | 200
    }

    void "profile authors can access public and opus-specific author actions"() {
        setup:
        // need to do this because grailsApplication.controllerClasses is empty in the filter when run from the unit test
        // unless we manually add the dummy controller class used in this test
        grailsApplication.addArtefact("Controller", SecuredController)

        defineBeans {
            authService(MockAuthService)
            profileService(MockProfileService)
            delegateService(MockDelegateService)
        }

        when:
        params.opusId = "author1"
        request.userPrincipal = new User([authority: "", userid: "PROFILE_AUTHOR_USER"])
        request.setAttribute(GrailsApplicationAttributes.CONTROLLER_NAME_ATTRIBUTE, 'secured')
        request.setAttribute(GrailsApplicationAttributes.ACTION_NAME_ATTRIBUTE, action)

        withInterceptors(controller: "secured", action: action) {

            controller."${action}"()
        }

        then:
        response.status == responseCode
        params.isALAAdmin == false
        params.isOpusAdmin == false
        params.isOpusEditor == false
        params.isOpusAuthor == true
        params.isOpusReviewer == true

        where:
        action                  | responseCode
        "publicAction"          | 200
        "alaAdminAction"        | 403
        "profileAdminAction"    | 403
        "profileEditorAction"   | 200
        "profileAuthorAction"   | 200
        "profileReviewerAction" | 200
    }

    void "profile reviewers can access public and opus-specific review actions"() {
        setup:
        // need to do this because grailsApplication.controllerClasses is empty in the filter when run from the unit test
        // unless we manually add the dummy controller class used in this test
        grailsApplication.addArtefact("Controller", SecuredController)

        defineBeans {
            authService(MockAuthService)
            profileService(MockProfileService)
        }
        interceptor.delegateService = new MockDelegateService()

        when:
        params.opusId = "reviewer1"
        request.userPrincipal = new User([authority: "", userid: "PROFILE_REVIEWER_USER"])
        request.setAttribute(GrailsApplicationAttributes.CONTROLLER_NAME_ATTRIBUTE, 'secured')
        request.setAttribute(GrailsApplicationAttributes.ACTION_NAME_ATTRIBUTE, action)

        withInterceptors(controller: "secured", action: action) {

            controller."${action}"()
        }

        then:
        response.status == responseCode
        params.isALAAdmin == false
        params.isOpusAdmin == false
        params.isOpusEditor == false
        params.isOpusAuthor == false
        params.isOpusReviewer == true

        where:
        action                  | responseCode
        "publicAction"          | 200
        "alaAdminAction"        | 403
        "profileAdminAction"    | 403
        "profileEditorAction"   | 403
        "profileAuthorAction"   | 403
        "profileReviewerAction" | 200
    }

    void "users who are not logged in should not be able to see private collections"() {
        setup:
        // need to do this because grailsApplication.controllerClasses is empty in the filter when run from the unit test
        // unless we manually add the dummy controller class used in this test
        grailsApplication.addArtefact("Controller", SecuredController)

        defineBeans {
            authService(MockAuthService)
            profileService(MockProfileService)
            delegateService(MockDelegateService)
        }

        when:
        params.opusId = "private"
        request.userPrincipal = null
        request.setAttribute(GrailsApplicationAttributes.CONTROLLER_NAME_ATTRIBUTE, 'secured')
        request.setAttribute(GrailsApplicationAttributes.ACTION_NAME_ATTRIBUTE, 'publicAction')

        withInterceptors(controller: "secured", action: "publicAction") {
            controller.publicAction()
        }

        then:
        response.status == 403
    }

    void "logged in users cannot see private collections they are not registered with"() {
        setup:
        // need to do this because grailsApplication.controllerClasses is empty in the filter when run from the unit test
        // unless we manually add the dummy controller class used in this test
        grailsApplication.addArtefact("Controller", SecuredController)

        defineBeans {
            authService(MockAuthService)
            profileService(MockProfileService)
            delegateService(MockDelegateService)
        }

        when:
        params.opusId = "private"
        request.userPrincipal = new User([authority: "", userid: "9876"])
        request.setAttribute(GrailsApplicationAttributes.CONTROLLER_NAME_ATTRIBUTE, 'secured')
        request.setAttribute(GrailsApplicationAttributes.ACTION_NAME_ATTRIBUTE, 'publicAction')

        withInterceptors(controller: "secured", action: "publicAction") {
            controller.publicAction()
        }

        then:
        response.status == 403
    }

    void "logged in users can see private collections they are registered with"() {
        setup:
        // need to do this because grailsApplication.controllerClasses is empty in the filter when run from the unit test
        // unless we manually add the dummy controller class used in this test
        grailsApplication.addArtefact("Controller", SecuredController)

        defineBeans {
            authService(MockAuthService)
            profileService(MockProfileService)
            delegateService(MockDelegateService)
        }

        when:
        params.opusId = "private"
        request.userPrincipal = new User([authority: "", userid: "1234"])
        request.setAttribute(GrailsApplicationAttributes.CONTROLLER_NAME_ATTRIBUTE, 'secured')
        request.setAttribute(GrailsApplicationAttributes.ACTION_NAME_ATTRIBUTE, 'publicAction')

        withInterceptors(controller: "secured", action: "publicAction") {
            controller.publicAction()
        }

        then:
        response.status == 200
    }

    void "methods for private collections annotated with @PrivateCollectionSecurityExempt can be accessed by anyone"() {
        setup:
        // need to do this because grailsApplication.controllerClasses is empty in the filter when run from the unit test
        // unless we manually add the dummy controller class used in this test
        grailsApplication.addArtefact("Controller", SecuredController)

        defineBeans {
            authService(MockAuthService)
            profileService(MockProfileService)
            delegateService(MockDelegateService)
        }

        when:
        params.opusId = "private"
        request.userPrincipal = null
        request.setAttribute(GrailsApplicationAttributes.CONTROLLER_NAME_ATTRIBUTE, 'secured')
        request.setAttribute(GrailsApplicationAttributes.ACTION_NAME_ATTRIBUTE, 'privateCollectionSecurityExemptAction')

        withInterceptors(controller: "secured", action: "privateCollectionSecurityExemptAction") {
            controller.privateCollectionSecurityExemptAction()
        }

        then:
        response.status == 200
    }

    void "check to ensure users with correct privilege are accessing certain actions on profile controller"() {
        setup:
        // need to do this because grailsApplication.controllerClasses is empty in the filter when run from the unit test
        // unless we manually add the dummy controller class used in this test
        grailsApplication.addArtefact("Controller", ProfileController)
        ProfileService pService = Mock(ProfileService)
        ExportService eService = Mock(ExportService)
        ImageService iService = Mock(ImageService)
        MapService mService = Mock(MapService)
        defineBeans {
            authService(MockAuthService)
            profileService(InstanceFactoryBean, pService, ProfileService)
            exportService(InstanceFactoryBean, eService, ExportService)
            mapService(InstanceFactoryBean, mService, MapService)
            imageService(InstanceFactoryBean, iService, ImageService)
            delegateService(MockDelegateService)
        }

        boolean controllerCalled = false
        def testData = getTestCollectionAndProfile()
        def opus = testData.opus
        def profile = testData.profile
        def wsResponse = [statusCode: 200, resp: [:]]

        pService.getOpus(*_) >> opus
        pService.getProfile(*_) >> profile
        pService.getCitation(*_) >> ""
        pService.hasMatchedName(*_) >> true
        pService.createProfile(*_) >> wsResponse
        pService.archiveProfile(*_) >> wsResponse
        pService.toggleDraftMode(*_) >> wsResponse
        pService.savePublication(*_) >> wsResponse
        pService.updateAttribute(*_) >> wsResponse
        pService.renameProfile(*_) >> wsResponse
        pService.deleteAttribute(*_) >> wsResponse
        pService.deleteAttachment(*_) >> wsResponse
        pService.updateDocument(*_) >> wsResponse
        pService.deleteDocument(*_) >> wsResponse
        pService.setPrimaryMultimedia(*_) >> wsResponse
        pService.setStatus(*_) >> wsResponse
        iService.updateLocalImageMetadata(*_) >> wsResponse
        iService.publishPrivateImage(*_) >> wsResponse
        iService.updateLocalImageMetadata(*_) >> wsResponse
        iService.deletePrivateImage(*_) >> wsResponse
        mService.getSnapshotImageUrlWithUUIDs(*_) >> wsResponse
        mService.createMapSnapshot(*_) >> null
        mService.deleteMapSnapshot(*_) >> null
        eService.createPdf(*_) >> null

        controller = new ProfileController()
        controller.profileService = pService

        when:
//        log.info("Controller - profile; Action - ${action}; User - ${type};")
        params.opusId = "allusers"
        params.profileId = "test"
        params.url = 'https://www.ala.org.au/app/uploads/2019/01/cropped-favicon-32x32.png'
        params.imageId = 'imageId'
        params.dataResourceId = 'dataResourceId'
        params.title = 'title'
        params.type = 'PRIVATE'
        params.attachmentId = 'attachmentId'
        params.attributeId = 'attributeId'
        request.userPrincipal = users[type]
        request.json = profile as JSON
        request.setAttribute(GrailsApplicationAttributes.CONTROLLER_NAME_ATTRIBUTE, 'profile')
        request.setAttribute(GrailsApplicationAttributes.ACTION_NAME_ATTRIBUTE, action)

        withInterceptors(controller: "profile", action: action) {
            controllerCalled = true
            controller."${action}"()
        }

        then:
        response.status == responseCode
        controllerCalled == (responseCode != 403)

        where:
        action                  | type                        | responseCode
        // view profile
        "show"                  | "NOT_LOGGED_IN_USER"        | 200
        "show"                  | "LOGGED_IN_USER"            | 200
        "show"                  | "REVIEWER"                  | 200
        "show"                  | "EDITOR"                    | 200
        "show"                  | "AUTHOR"                    | 200
        "show"                  | "ADMIN"                     | 200
        "show"                  | "ALA_ADMIN"                 | 200
        // edit profile
        "edit"                  | "NOT_LOGGED_IN_USER"        | 403
        "edit"                  | "LOGGED_IN_USER"            | 403
        "edit"                  | "REVIEWER"                  | 403
        "edit"                  | "EDITOR"                    | 200
        "edit"                  | "AUTHOR"                    | 200
        "edit"                  | "ADMIN"                     | 200
        "edit"                  | "ALA_ADMIN"                 | 200
        // update profile
        "updateProfile"         | "NOT_LOGGED_IN_USER"        | 403
        "updateProfile"         | "LOGGED_IN_USER"            | 403
        "updateProfile"         | "REVIEWER"                  | 403
        "updateProfile"         | "EDITOR"                    | 200
        "updateProfile"         | "AUTHOR"                    | 200
        "updateProfile"         | "ADMIN"                     | 200
        "updateProfile"         | "ALA_ADMIN"                 | 200
        // update attribute
        "updateAttribute"       | "NOT_LOGGED_IN_USER"        | 403
        "updateAttribute"       | "LOGGED_IN_USER"            | 403
        "updateAttribute"       | "REVIEWER"                  | 403
        "updateAttribute"       | "EDITOR"                    | 200
        "updateAttribute"       | "AUTHOR"                    | 200
        "updateAttribute"       | "ADMIN"                     | 200
        "updateAttribute"       | "ALA_ADMIN"                 | 200
        // update authorship
        "updateAuthorship"      | "NOT_LOGGED_IN_USER"        | 403
        "updateAuthorship"      | "LOGGED_IN_USER"            | 403
        "updateAuthorship"      | "REVIEWER"                  | 403
        "updateAuthorship"      | "EDITOR"                    | 200
        "updateAuthorship"      | "AUTHOR"                    | 200
        "updateAuthorship"      | "ADMIN"                     | 200
        "updateAuthorship"      | "ALA_ADMIN"                 | 200
        // update bhl
        "updateBHLLinks"        | "NOT_LOGGED_IN_USER"        | 403
        "updateBHLLinks"        | "LOGGED_IN_USER"            | 403
        "updateBHLLinks"        | "REVIEWER"                  | 403
        "updateBHLLinks"        | "EDITOR"                    | 200
        "updateBHLLinks"        | "AUTHOR"                    | 200
        "updateBHLLinks"        | "ADMIN"                     | 200
        "updateBHLLinks"        | "ALA_ADMIN"                 | 200
        // update links
        "updateLinks"           | "NOT_LOGGED_IN_USER"        | 403
        "updateLinks"           | "LOGGED_IN_USER"            | 403
        "updateLinks"           | "REVIEWER"                  | 403
        "updateLinks"           | "EDITOR"                    | 200
        "updateLinks"           | "AUTHOR"                    | 200
        "updateLinks"           | "ADMIN"                     | 200
        "updateLinks"           | "ALA_ADMIN"                 | 200
        // update profile
        "updateLocalImageMetadata" | "NOT_LOGGED_IN_USER"     | 403
        "updateLocalImageMetadata" | "LOGGED_IN_USER"         | 403
        "updateLocalImageMetadata" | "REVIEWER"               | 403
        "updateLocalImageMetadata" | "EDITOR"                 | 200
        "updateLocalImageMetadata" | "AUTHOR"                 | 200
        "updateLocalImageMetadata" | "ADMIN"                  | 200
        "updateLocalImageMetadata" | "ALA_ADMIN"              | 200
        // update image
        "uploadImage"              | "NOT_LOGGED_IN_USER"     | 403
        "uploadImage"              | "LOGGED_IN_USER"         | 403
        "uploadImage"              | "REVIEWER"               | 403
        "uploadImage"              | "EDITOR"                 | 200
        "uploadImage"              | "AUTHOR"                 | 200
        "uploadImage"              | "ADMIN"                  | 200
        "uploadImage"              | "ALA_ADMIN"              | 200
        // rename profile
        "renameProfile"              | "NOT_LOGGED_IN_USER"     | 403
        "renameProfile"              | "LOGGED_IN_USER"         | 403
        "renameProfile"              | "REVIEWER"               | 403
        "renameProfile"              | "EDITOR"                 | 200
        "renameProfile"              | "AUTHOR"                 | 200
        "renameProfile"              | "ADMIN"                  | 200
        "renameProfile"              | "ALA_ADMIN"              | 200
        // update image
        "publishPrivateImage"              | "NOT_LOGGED_IN_USER"     | 403
        "publishPrivateImage"              | "LOGGED_IN_USER"         | 403
        "publishPrivateImage"              | "REVIEWER"               | 403
        "publishPrivateImage"              | "EDITOR"                 | 200
        "publishPrivateImage"              | "AUTHOR"                 | 200
        "publishPrivateImage"              | "ADMIN"                  | 200
        "publishPrivateImage"              | "ALA_ADMIN"              | 200
        // update local image metadata
        "updateLocalImageMetadata"              | "NOT_LOGGED_IN_USER"     | 403
        "updateLocalImageMetadata"              | "LOGGED_IN_USER"         | 403
        "updateLocalImageMetadata"              | "REVIEWER"               | 403
        "updateLocalImageMetadata"              | "EDITOR"                 | 200
        "updateLocalImageMetadata"              | "AUTHOR"                 | 200
        "updateLocalImageMetadata"              | "ADMIN"                  | 200
        "updateLocalImageMetadata"              | "ALA_ADMIN"              | 200
        // delete attribute
        "deleteAttribute"              | "NOT_LOGGED_IN_USER"     | 403
        "deleteAttribute"              | "LOGGED_IN_USER"         | 403
        "deleteAttribute"              | "REVIEWER"               | 403
        "deleteAttribute"              | "EDITOR"                 | 200
        "deleteAttribute"              | "AUTHOR"                 | 200
        "deleteAttribute"              | "ADMIN"                  | 200
        "deleteAttribute"              | "ALA_ADMIN"              | 200
        // delete attribute
        "deleteLocalImage"              | "NOT_LOGGED_IN_USER"     | 403
        "deleteLocalImage"              | "LOGGED_IN_USER"         | 403
        "deleteLocalImage"              | "REVIEWER"               | 403
        "deleteLocalImage"              | "EDITOR"                 | 200
        "deleteLocalImage"              | "AUTHOR"                 | 200
        "deleteLocalImage"              | "ADMIN"                  | 200
        "deleteLocalImage"              | "ALA_ADMIN"              | 200
        // save attachment
        "deleteAttachment"              | "NOT_LOGGED_IN_USER"     | 403
        "deleteAttachment"              | "LOGGED_IN_USER"         | 403
        "deleteAttachment"              | "REVIEWER"               | 403
        "deleteAttachment"              | "EDITOR"                 | 200
        "deleteAttachment"              | "AUTHOR"                 | 200
        "deleteAttachment"              | "ADMIN"                  | 200
        "deleteAttachment"              | "ALA_ADMIN"              | 200
        // create map snapshot
        "createMapSnapshot"              | "NOT_LOGGED_IN_USER"     | 403
        "createMapSnapshot"              | "LOGGED_IN_USER"         | 403
        "createMapSnapshot"              | "REVIEWER"               | 403
        "createMapSnapshot"              | "EDITOR"                 | 200
        "createMapSnapshot"              | "AUTHOR"                 | 200
        "createMapSnapshot"              | "ADMIN"                  | 200
        "createMapSnapshot"              | "ALA_ADMIN"              | 200
        // create map snapshot
        "deleteMapSnapshot"              | "NOT_LOGGED_IN_USER"     | 403
        "deleteMapSnapshot"              | "LOGGED_IN_USER"         | 403
        "deleteMapSnapshot"              | "REVIEWER"               | 403
        "deleteMapSnapshot"              | "EDITOR"                 | 200
        "deleteMapSnapshot"              | "AUTHOR"                 | 200
        "deleteMapSnapshot"              | "ADMIN"                  | 200
        "deleteMapSnapshot"              | "ALA_ADMIN"              | 200
        // create map snapshot
        "documentUpdate"              | "NOT_LOGGED_IN_USER"     | 403
        "documentUpdate"              | "LOGGED_IN_USER"         | 403
        "documentUpdate"              | "REVIEWER"               | 403
        "documentUpdate"              | "EDITOR"                 | 200
        "documentUpdate"              | "AUTHOR"                 | 200
        "documentUpdate"              | "ADMIN"                  | 200
        "documentUpdate"              | "ALA_ADMIN"              | 200
        // document delete
        "documentDelete"              | "NOT_LOGGED_IN_USER"     | 403
        "documentDelete"              | "LOGGED_IN_USER"         | 403
        "documentDelete"              | "REVIEWER"               | 403
        "documentDelete"              | "EDITOR"                 | 200
        "documentDelete"              | "AUTHOR"                 | 200
        "documentDelete"              | "ADMIN"                  | 200
        "documentDelete"              | "ALA_ADMIN"              | 200
        // create map snapshot
        "setPrimaryMultimedia"              | "NOT_LOGGED_IN_USER"     | 403
        "setPrimaryMultimedia"              | "LOGGED_IN_USER"         | 403
        "setPrimaryMultimedia"              | "REVIEWER"               | 403
        "setPrimaryMultimedia"              | "EDITOR"                 | 204
        "setPrimaryMultimedia"              | "AUTHOR"                 | 204
        "setPrimaryMultimedia"              | "ADMIN"                  | 204
        "setPrimaryMultimedia"              | "ALA_ADMIN"              | 204
        // set status
        "setStatus"              | "NOT_LOGGED_IN_USER"     | 403
        "setStatus"              | "LOGGED_IN_USER"         | 403
        "setStatus"              | "REVIEWER"               | 403
        "setStatus"              | "EDITOR"                 | 204
        "setStatus"              | "AUTHOR"                 | 204
        "setStatus"              | "ADMIN"                  | 204
        "setStatus"              | "ALA_ADMIN"              | 204

        // create profile
        "createProfile"         | "NOT_LOGGED_IN_USER"        | 403
        "createProfile"         | "LOGGED_IN_USER"            | 403
        "createProfile"         | "REVIEWER"                  | 403
        "createProfile"         | "EDITOR"                    | 403
        "createProfile"         | "AUTHOR"                    | 200
        "createProfile"         | "ADMIN"                     | 200
        "createProfile"         | "ALA_ADMIN"                 | 200
        // delete profile
        "deleteProfile"         | "NOT_LOGGED_IN_USER"        | 403
        "deleteProfile"         | "LOGGED_IN_USER"            | 403
        "deleteProfile"         | "REVIEWER"                  | 403
        "deleteProfile"         | "EDITOR"                    | 403
        "deleteProfile"         | "AUTHOR"                    | 403
        "deleteProfile"         | "ADMIN"                     | 200
        "deleteProfile"         | "ALA_ADMIN"                 | 200
        // lock for major revision
        "createDraftMode"       | "NOT_LOGGED_IN_USER"        | 403
        "createDraftMode"       | "LOGGED_IN_USER"            | 403
        "createDraftMode"       | "REVIEWER"                  | 403
        "createDraftMode"       | "EDITOR"                    | 200
        "createDraftMode"       | "AUTHOR"                    | 200
        "createDraftMode"       | "ADMIN"                     | 200
        "createDraftMode"       | "ALA_ADMIN"                 | 200
        // Archive profiles
        "archiveProfile"        | "NOT_LOGGED_IN_USER"        | 403
        "archiveProfile"        | "LOGGED_IN_USER"            | 403
        "archiveProfile"        | "REVIEWER"                  | 403
        "archiveProfile"        | "EDITOR"                    | 403
        "archiveProfile"        | "AUTHOR"                    | 200
        "archiveProfile"        | "ADMIN"                     | 200
        "archiveProfile"        | "ALA_ADMIN"                 | 200
        // publish draft profiles
        "publishDraft"          | "NOT_LOGGED_IN_USER"        | 403
        "publishDraft"          | "LOGGED_IN_USER"            | 403
        "publishDraft"          | "REVIEWER"                  | 403
        "publishDraft"          | "EDITOR"                    | 403
        "publishDraft"          | "AUTHOR"                    | 403
        "publishDraft"          | "ADMIN"                     | 200
        "publishDraft"          | "ALA_ADMIN"                 | 200
        // create profile snapshot
        "savePublication"       | "NOT_LOGGED_IN_USER"        | 403
        "savePublication"       | "LOGGED_IN_USER"            | 403
        "savePublication"       | "REVIEWER"                  | 403
        "savePublication"       | "EDITOR"                    | 403
        "savePublication"       | "AUTHOR"                    | 403
        "savePublication"       | "ADMIN"                     | 200
        "savePublication"       | "ALA_ADMIN"                 | 200
    }

    void "check to ensure users with correct privilege can comment on a profile"() {
        setup:
        // need to do this because grailsApplication.controllerClasses is empty in the filter when run from the unit test
        // unless we manually add the dummy controller class used in this test
        grailsApplication.addArtefact("Controller", CommentController)
        ProfileService pService = Mock(ProfileService)
        defineBeans {
            authService(MockAuthService)
            profileService(InstanceFactoryBean, pService, ProfileService)
            delegateService(MockDelegateService)
        }

        boolean controllerCalled = false
        def testData = getTestCollectionAndProfile()
        def opus = testData.opus
        def profile = testData.profile
        def wsResponse = [statusCode: 200, resp: [ author: [userId: "PROFILE_REVIEWER_USER"]]]

        pService.getOpus(_) >> opus
        pService.addComment(*_) >> wsResponse
        pService.getComments(*_) >> wsResponse
        pService.getComment(*_) >> wsResponse

        controller = new CommentController()
        controller.profileService = pService

        when:
//        log.info("Controller - profile; Action - ${action}; User - ${type};")
        params.opusId = "allusers"
        params.profileId = "test"
        params.commentId = "commentId"
        request.userPrincipal = users[type]
        request.json = profile as JSON
        request.setAttribute(GrailsApplicationAttributes.CONTROLLER_NAME_ATTRIBUTE, 'comment')
        request.setAttribute(GrailsApplicationAttributes.ACTION_NAME_ATTRIBUTE, action)

        withInterceptors(controller: "comment", action: action) {
            controllerCalled = true
            controller."${action}"()
        }

        then:
        response.status == responseCode
        controllerCalled == (responseCode != 403)

        where:
        action                  | type                        | responseCode
        // create comment
        "addComment"            | "NOT_LOGGED_IN_USER"        | 403
        "addComment"            | "LOGGED_IN_USER"            | 403
        "addComment"            | "REVIEWER"                  | 200
        "addComment"            | "EDITOR"                    | 200
        "addComment"            | "AUTHOR"                    | 200
        "addComment"            | "ADMIN"                     | 200
        "addComment"            | "ALA_ADMIN"                 | 200
        // view comments
        "getComments"           | "NOT_LOGGED_IN_USER"        | 403
        "getComments"           | "LOGGED_IN_USER"            | 403
        "getComments"           | "REVIEWER"                  | 200
        "getComments"           | "EDITOR"                    | 200
        "getComments"           | "AUTHOR"                    | 200
        "getComments"           | "ADMIN"                     | 200
        "getComments"           | "ALA_ADMIN"                 | 200
        // update comment
        "updateComment"         | "NOT_LOGGED_IN_USER"        | 403
        "updateComment"         | "LOGGED_IN_USER"            | 403
        "updateComment"         | "REVIEWER"                  | 200
        "updateComment"         | "EDITOR"                    | 200
        "updateComment"         | "AUTHOR"                    | 200
        "updateComment"         | "ADMIN"                     | 200
        "updateComment"         | "ALA_ADMIN"                 | 200
        // delete comment
        "deleteComment"         | "NOT_LOGGED_IN_USER"        | 403
        "deleteComment"         | "LOGGED_IN_USER"            | 403
        "deleteComment"         | "REVIEWER"                  | 403
        "deleteComment"         | "EDITOR"                    | 403
        "deleteComment"         | "AUTHOR"                    | 403
        "deleteComment"         | "ADMIN"                     | 200
        "deleteComment"         | "ALA_ADMIN"                 | 200

    }

    void "check to ensure user with correct privilege have access to restricted actions on opus controller"() {
        setup:
        // need to do this because grailsApplication.controllerClasses is empty in the filter when run from the unit test
        // unless we manually add the dummy controller class used in this test
        grailsApplication.addArtefact("Controller", OpusController)
        ProfileService pService = Mock(ProfileService)
        FlorulaCookieService fCookieService = Mock(FlorulaCookieService)
        WebService wService = Mock(WebService)
        defineBeans {
            authService(MockAuthService)
            profileService(InstanceFactoryBean, pService, ProfileService)
            florulaCookieService(InstanceFactoryBean, fCookieService, FlorulaCookieService)
            webService(InstanceFactoryBean, wService, WebService)
            delegateService(MockDelegateService)
        }

        boolean controllerCalled = false
        def testData = getTestCollectionAndProfile()
        def opus = testData.opus
        def profile = testData.profile
        def wsResponse = [statusCode: 200, resp: [:]]

        pService.getOpus(*_) >> opus
        pService.getProfile(*_) >> profile
        pService.deleteOpus(*_) >> wsResponse
        fCookieService.getFlorulaListIdForOpusId(*_) >> null
        wService.get(*_) >> wsResponse

        controller = new OpusController()
        controller.profileService = pService
        controller.authService = grailsApplication.mainContext.getBean('authService')

        when:
//        log.info("Controller - opus; Action - ${action}; User - ${type};")
        params.opusId = "allusers"
        params.profileId = "test"
        request.userPrincipal = users[type]
        request.json = profile as JSON
        request.setAttribute(GrailsApplicationAttributes.CONTROLLER_NAME_ATTRIBUTE, 'opus')
        request.setAttribute(GrailsApplicationAttributes.ACTION_NAME_ATTRIBUTE, action)

        withInterceptors(controller: "opus", action: action) {
            controllerCalled = true
            controller."${action}"()
        }

        then:
        response.status == responseCode
        controllerCalled == (responseCode != 403)

        where:
        action                    | type                        | responseCode
        // view opus home page
        "show"                    | "NOT_LOGGED_IN_USER"        | 200
        "show"                    | "LOGGED_IN_USER"            | 200
        "show"                    | "REVIEWER"                  | 200
        "show"                    | "EDITOR"                    | 200
        "show"                    | "AUTHOR"                    | 200
        "show"                    | "ADMIN"                     | 200
        "show"                    | "ALA_ADMIN"                 | 200
        // view search page
        "search"                  | "NOT_LOGGED_IN_USER"        | 200
        "search"                  | "LOGGED_IN_USER"            | 200
        "search"                  | "REVIEWER"                  | 200
        "search"                  | "EDITOR"                    | 200
        "search"                  | "AUTHOR"                    | 200
        "search"                  | "ADMIN"                     | 200
        "search"                  | "ALA_ADMIN"                 | 200
        // view browse page
        "browse"                  | "NOT_LOGGED_IN_USER"        | 200
        "browse"                  | "LOGGED_IN_USER"            | 200
        "browse"                  | "REVIEWER"                  | 200
        "browse"                  | "EDITOR"                    | 200
        "browse"                  | "AUTHOR"                    | 200
        "browse"                  | "ADMIN"                     | 200
        "browse"                  | "ALA_ADMIN"                 | 200
        // view filter page
        "filter"                  | "NOT_LOGGED_IN_USER"        | 200
        "filter"                  | "LOGGED_IN_USER"            | 200
        "filter"                  | "REVIEWER"                  | 200
        "filter"                  | "EDITOR"                    | 200
        "filter"                  | "AUTHOR"                    | 200
        "filter"                  | "ADMIN"                     | 200
        "filter"                  | "ALA_ADMIN"                 | 200
        // edit opus configuration
        "edit"                    | "NOT_LOGGED_IN_USER"        | 403
        "edit"                    | "LOGGED_IN_USER"            | 403
        "edit"                    | "REVIEWER"                  | 403
        "edit"                    | "EDITOR"                    | 403
        "edit"                    | "AUTHOR"                    | 403
        "edit"                    | "ADMIN"                     | 200
        "edit"                    | "ALA_ADMIN"                 | 200
        // view opus reports
        "reports"                 | "NOT_LOGGED_IN_USER"        | 403
        "reports"                 | "LOGGED_IN_USER"            | 403
        "reports"                 | "REVIEWER"                  | 403
        "reports"                 | "EDITOR"                    | 403
        "reports"                 | "AUTHOR"                    | 403
        "reports"                 | "ADMIN"                     | 200
        "reports"                 | "ALA_ADMIN"                 | 200
        // set filter on a page
        "updateFlorulaList"       | "NOT_LOGGED_IN_USER"        | 204
        "updateFlorulaList"       | "LOGGED_IN_USER"            | 204
        "updateFlorulaList"       | "REVIEWER"                  | 204
        "updateFlorulaList"       | "EDITOR"                    | 204
        "updateFlorulaList"       | "AUTHOR"                    | 204
        "updateFlorulaList"       | "ADMIN"                     | 204
        "updateFlorulaList"       | "ALA_ADMIN"                 | 204
        // create opus
        "createOpus"              | "NOT_LOGGED_IN_USER"        | 403
        "createOpus"              | "LOGGED_IN_USER"            | 403
        "createOpus"              | "REVIEWER"                  | 403
        "createOpus"              | "EDITOR"                    | 403
        "createOpus"              | "AUTHOR"                    | 403
        "createOpus"              | "ADMIN"                     | 403
        "createOpus"              | "ALA_ADMIN"                 | 200
        // delete opus
        "deleteOpus"              | "NOT_LOGGED_IN_USER"        | 403
        "deleteOpus"              | "LOGGED_IN_USER"            | 403
        "deleteOpus"              | "REVIEWER"                  | 403
        "deleteOpus"              | "EDITOR"                    | 403
        "deleteOpus"              | "AUTHOR"                    | 403
        "deleteOpus"              | "ADMIN"                     | 403
        "deleteOpus"              | "ALA_ADMIN"                 | 200

    }

    def getTestCollectionAndProfile(boolean isPrivateOpus = false) {
        def opusId = "allusers"
        def profileName = "test"
        def opus

        if (isPrivateOpus) {
            opus = [uuid: opusId, privateCollection: true, authorities: [[userId: "PROFILE_ADMIN_USER", role: Role.ROLE_PROFILE_ADMIN.toString()],
                                                                         [userId: "PROFILE_EDITOR_USER", role: Role.ROLE_PROFILE_EDITOR.toString()],
                                                                         [userId: "PROFILE_AUTHOR_USER", role: Role.ROLE_PROFILE_AUTHOR.toString()],
                                                                         [userId: "PROFILE_REVIEWER_USER", role: Role.ROLE_PROFILE_REVIEWER.toString()],
                                                                         [userId: "PRIVATE_USER", role: Role.ROLE_USER.toString()]]]
        } else {
            opus = [uuid: opusId, authorities: [[userId: "PROFILE_ADMIN_USER", role: Role.ROLE_PROFILE_ADMIN.toString()],
                                                [userId: "PROFILE_EDITOR_USER", role: Role.ROLE_PROFILE_EDITOR.toString()],
                                                [userId: "PROFILE_AUTHOR_USER", role: Role.ROLE_PROFILE_AUTHOR.toString()],
                                                [userId: "PROFILE_REVIEWER_USER", role: Role.ROLE_PROFILE_REVIEWER.toString()]]]
        }

        def profile = [
                opus         : opus,
                profile      : [ name: profileName],
                logos        : opus.brandingConfig?.logos ?: DEFAULT_OPUS_LOGOS,
                bannerUrl    : opus.brandingConfig?.profileBannerUrl ?: DEFAULT_OPUS_BANNER_URL,
                pageTitle    : opus.title ?: DEFAULT_OPUS_TITLE,
                archiveComment : true,
                profile: [ privateMode: false],
                uuid: 'test',
                occurrenceQuery: 'occurrenceQuery'
        ]

        [
                opus: opus,
                profile: profile,
                opusId: opusId,
                profileName: profileName
        ]
    }
}

class User implements Principal {

    Map attributes

    User(Map attributes) {
        this.attributes = attributes
    }

    @Override
    String getName() {
        return "Fred"
    }

    Map getAttributes() {
        return attributes
    }
}

class SecuredController {
    def publicAction() {

    }

    @Secured(role = Role.ROLE_ADMIN)
    def alaAdminAction() {

    }

    @Secured(role = Role.ROLE_PROFILE_ADMIN)
    def profileAdminAction() {

    }

    @Secured(role = Role.ROLE_PROFILE_EDITOR)
    def profileEditorAction() {

    }

    @Secured(role = Role.ROLE_PROFILE_AUTHOR)
    def profileAuthorAction() {

    }

    @Secured(role = Role.ROLE_PROFILE_REVIEWER)
    def profileReviewerAction() {

    }

    @PrivateCollectionSecurityExempt
    def privateCollectionSecurityExemptAction() {

    }
}

class MockAuthService extends AuthService implements Events {
    @Override
    String getUserId() {
        "PROFILE_REVIEWER_USER"
    }

    @Override
    String getDisplayName() {
        "Fred Bloggs"
    }
}

class MockDelegateService extends AuthService implements Events {
    Set<String> getUserRoles() {
        def role = GrailsWebRequest.lookup().userPrincipal?.attributes?.authority
        role ? [role].toSet() : [].toSet()
    }

    @Override
    String getUserId() {
        GrailsWebRequest.lookup().userPrincipal?.attributes?.userid
    }

    @Override
    String getDisplayName() {
        "Fred Bloggs"
    }
}

class MockMapService extends MapService {
    @Override
    String getSnapshotImageUrlWithUUIDs(String contextPath, String opusUUID, String profileUUID) {
        ""
    }
}

class MockProfileService extends ProfileService {
    @Override
    def getOpus(String opusId) {
        def opus
        if (opusId == "admin1") {
            opus = [uuid: opusId, authorities: [[userId: "PROFILE_ADMIN_USER", role: Role.ROLE_PROFILE_ADMIN.toString()],
                                                [userId: 2, role: Role.ROLE_PROFILE_ADMIN.toString()],
                                                [userId: 3, role: Role.ROLE_PROFILE_AUTHOR.toString()],
                                                [userId: 4, role: Role.ROLE_PROFILE_AUTHOR.toString()]]]
        } else if (opusId == "editor1") {
            opus = [uuid: opusId, authorities: [[userId: 1, role: Role.ROLE_PROFILE_ADMIN.toString()],
                                                [userId: 2, role: Role.ROLE_PROFILE_ADMIN.toString()],
                                                [userId: 3, role: Role.ROLE_PROFILE_AUTHOR.toString()],
                                                [userId: "PROFILE_EDITOR_USER", role: Role.ROLE_PROFILE_EDITOR.toString()]]]
        } else if (opusId == "author1") {
            opus = [uuid: opusId, authorities: [[userId: 1, role: Role.ROLE_PROFILE_ADMIN.toString()],
                                                [userId: 2, role: Role.ROLE_PROFILE_ADMIN.toString()],
                                                [userId: 3, role: Role.ROLE_PROFILE_AUTHOR.toString()],
                                                [userId: "PROFILE_AUTHOR_USER", role: Role.ROLE_PROFILE_AUTHOR.toString()]]]
        } else if (opusId == "reviewer1") {
            opus = [uuid: opusId, authorities: [[userId: 1, role: Role.ROLE_PROFILE_ADMIN.toString()],
                                                [userId: 2, role: Role.ROLE_PROFILE_ADMIN.toString()],
                                                [userId: 3, role: Role.ROLE_PROFILE_AUTHOR.toString()],
                                                [userId: "PROFILE_REVIEWER_USER", role: Role.ROLE_PROFILE_REVIEWER.toString()]]]
        } else if (opusId == "private") {
            opus = [uuid: opusId, privateCollection: true, authorities: [[userId: "1234", role: Role.ROLE_USER.toString()]]]
        } else {
            opus = [uuid: opusId, authorities: [[userId: 1],
                                                [userId: 2],
                                                [userId: 3],
                                                [userId: 4]]]
        }
        return opus
    }
}