package au.org.ala.profile.api

import au.org.ala.profile.hub.ProfileService
import au.org.ala.profile.security.RequiresAccessToken
import au.org.ala.web.AuthService
import au.org.ala.web.UserDetails
import grails.events.Events
import grails.testing.web.interceptor.InterceptorUnitTest
import org.grails.web.util.GrailsApplicationAttributes
import spock.lang.Specification

import java.security.Principal

class ApiInterceptorSpec extends Specification implements InterceptorUnitTest<ApiInterceptor> {

    def controller

    def setup() {
        grailsApplication.config.security.authorisation.disable = false
        grailsApplication.config.lists.base.url = "http://lists.ala.org.au"
        grailsApplication.config.image.staging.dir = "/data/profile-hub/"
        controller = new ExampleController()
    }

    void "Public collection should be accessible when Username is provided"() {
        setup:
        grailsApplication.addArtefact("Controller", ExampleController)
        defineBeans {
            authService(MockAuthService)
            profileService(MockProfileService)
        }
        controller = (ExampleController) mockController(ExampleController)

        when:
        params.opusId = "public1"
        request.method = "GET"
        request.addHeader(grailsApplication.config.app.http.header.userName, userName)
        request.requestURI = "/api/opus/public1/profile"
        request.setAttribute(GrailsApplicationAttributes.CONTROLLER_NAME_ATTRIBUTE, 'example')
        request.setAttribute(GrailsApplicationAttributes.ACTION_NAME_ATTRIBUTE, 'publicAction')
        withInterceptors(controller: "example", action: "publicAction") {
            controller.publicAction()
        }

        then:
        response.status == responseCode

        where:
        userName            | responseCode
        ""                  | 403
        "user1@test.org.au" | 200

    }

    void "Private collection should not be accessible if only if correct access-token is provided"() {
        setup:
        grailsApplication.addArtefact("Controller", ExampleController)
        defineBeans {
            authService(MockAuthService)
            profileService(MockProfileService)
        }

        when:
        params.opusId = "private1"
        request.method = "GET"
        request.addHeader(grailsApplication.config.app.http.header.userName, 'user1@test.org.au')
        request.addHeader(ApiInterceptor.ACCESS_TOKEN_HEADER, accessToken)
        request.requestURI = "/api/opus/public1/profile"
        request.setAttribute(GrailsApplicationAttributes.CONTROLLER_NAME_ATTRIBUTE, 'example')
        request.setAttribute(GrailsApplicationAttributes.ACTION_NAME_ATTRIBUTE, 'privateAction')
        withInterceptors(controller: "example", action: "privateAction") {
            controller.privateAction()
        }

        then:
        response.status == responseCode

        where:
        accessToken | responseCode
        ""          | 403
        "abc123"    | 403
        "secret"    | 200

    }

    void "Annotated controller action should be accessible only if correct access-token is provided"() {
        setup:
        grailsApplication.addArtefact("Controller", ExampleController)
        defineBeans {
            authService(MockAuthService)
            profileService(MockProfileService)
        }

        when:
        params.opusId = "public1"
        request.method = "GET"
        request.addHeader(grailsApplication.config.app.http.header.userName, 'user1@test.org.au')
        request.addHeader(ApiInterceptor.ACCESS_TOKEN_HEADER, accessToken)
        request.requestURI = "/api/opus/public1/profile"
        request.setAttribute(GrailsApplicationAttributes.CONTROLLER_NAME_ATTRIBUTE, 'example')
        request.setAttribute(GrailsApplicationAttributes.ACTION_NAME_ATTRIBUTE, 'publicActionWithAnnotation')
        withInterceptors(controller: "example", action: "publicActionWithAnnotation") {
            controller.publicActionWithAnnotation()
        }

        then:
        response.status == responseCode

        where:
        accessToken | responseCode
        ""          | 403
        "abc123"    | 200
        "secret"    | 403

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

class ExampleController {
    def publicAction() {
    }

    def privateAction() {
    }

    @RequiresAccessToken
    def publicActionWithAnnotation() {
    }
}

class MockProfileService extends ProfileService {
    @Override
    def getOpus(String opusId) {
        def opus
        if (opusId == "public1") {
            opus = [uuid: "public1", accessToken: "abc123", privateCollection: false]
        } else if (opusId == "private1") {
            opus = [uuid: "private1", accessToken: "secret", privateCollection: true]
        }
        return opus
    }
}

class MockAuthService extends AuthService implements Events {
    @Override
    UserDetails getUserForEmailAddress(String emailAddress) {
        if (emailAddress) {
            new UserDetails()
        }
    }
}
