package au.org.ala.profile.hub

import au.org.ala.plugins.openapi.Path
import au.org.ala.profile.analytics.Analytics
import au.org.ala.profile.api.ProfileBriefResponse
import au.org.ala.web.AuthService
import au.org.ala.web.UserDetails
import grails.converters.JSON
import grails.events.Events
import grails.testing.web.interceptor.InterceptorUnitTest
import groovy.util.logging.Slf4j
import org.grails.web.servlet.mvc.GrailsWebRequest
import org.grails.web.util.GrailsApplicationAttributes
import spock.lang.Specification

import javax.servlet.http.Cookie
import java.security.Principal

/*
 * Copyright (C) 2021 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 * 
 * Created by Temi on 23/8/21.
 */
@Slf4j
class AnalyticsInterceptorSpec extends Specification implements InterceptorUnitTest<AnalyticsInterceptor> {

    def controller

    def setup() {
        defineBeans {
            authService(MockAuthService)
            webServiceWrapperService(WebServiceWrapperService)
        }

        grailsApplication.addArtefact("Controller", ExampleController)
        grailsApplication.config.security.authorisation.disable = false
        grailsApplication.config.lists.base.url = "http://lists.ala.org.au"
        grailsApplication.config.image.staging.dir = "/data/profile-hub/"
        grailsApplication.config.app.analytics = [apiid: "cd1", collectionid: "cd3", profileid: "cd4", userid: "cd2"]
    }

    void "Send appropriate data to GA depending on called controller action"() {
        setup:

        interceptor.analyticsService = Mock(AnalyticsService)
        controller = (ExampleController) mockController(ExampleController)
        interceptor.match(controller: "example")

        when:
        params.opusId = "public1"
        request.method = "GET"
        request.addHeader(MockAuthService.DEFAULT_AUTH_HEADER, userId)
        request.cookies = [new Cookie('_ga', 'GA1.1.abc.123')].toArray()
        request.requestURI = "/opus/public1/profile"
        request.setAttribute(GrailsApplicationAttributes.CONTROLLER_NAME_ATTRIBUTE, 'example')
        request.setAttribute(GrailsApplicationAttributes.ACTION_NAME_ATTRIBUTE, 'publicAction')
        withInterceptors(controller: "example", action: "publicAction") {
            controller.publicAction()
        }

        then:
        response.status == responseCode
        1 * interceptor.analyticsService.pageView("localhost", "/opus/public1/profile", 'abc.123', "127.0.0.1", null, null, payload)

        where:
        userId            | responseCode | payload
        ""                  | 200          | [dt: "List profiles in a collection", cd1: "/opus/{opusId}/profile", cd3: "public1"]
        "123" | 200          | [dt: "List profiles in a collection", cd1: "/opus/{opusId}/profile", cd3: "public1", cd2: "123"]

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

@Analytics
class ExampleController {
    MockAnalyticsService analyticsService
    @Path("/opus/{opusId}/profile")
    @io.swagger.v3.oas.annotations.Operation(
            summary = "List profiles in a collection",
            operationId = "/opus/{opusId}/profile",
            method = "GET",
            responses = [
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            content = @io.swagger.v3.oas.annotations.media.Content(
                                    mediaType = "application/json",
                                    array = @io.swagger.v3.oas.annotations.media.ArraySchema(
                                            schema = @io.swagger.v3.oas.annotations.media.Schema(
                                                    implementation = ProfileBriefResponse.class
                                            )
                                    )
                            ),
                            headers = [
                                    @io.swagger.v3.oas.annotations.headers.Header(name = 'X-Total-Count', description = "Total number of profiles", schema = @io.swagger.v3.oas.annotations.media.Schema(type = "integer")),
                                    @io.swagger.v3.oas.annotations.headers.Header(name = 'Access-Control-Allow-Headers', description = "CORS header", schema = @io.swagger.v3.oas.annotations.media.Schema(type = "String")),
                                    @io.swagger.v3.oas.annotations.headers.Header(name = 'Access-Control-Allow-Methods', description = "CORS header", schema = @io.swagger.v3.oas.annotations.media.Schema(type = "String")),
                                    @io.swagger.v3.oas.annotations.headers.Header(name = 'Access-Control-Allow-Origin', description = "CORS header", schema = @io.swagger.v3.oas.annotations.media.Schema(type = "String"))
                            ]
                    )
            ]
    )
    def publicAction() {
        [:] as JSON
    }
}

class MockAuthService extends AuthService implements Events {
    static final String DEFAULT_AUTH_HEADER = "X-ALA-userId"
    @Override
    UserDetails getUserForEmailAddress(String emailAddress) {
        if (emailAddress) {
            new UserDetails(userId: "123")
        }
    }

    @Override
    String getUserId(){
        def userId = GrailsWebRequest.lookup().getHeader(DEFAULT_AUTH_HEADER)
        userId
    }
}

class MockAnalyticsService extends AnalyticsService implements Events {
    @Override
    void pageView(String hostname, String path, String clientId, String userIp, String userAgent, String referrer, Map payload = [:]) {
    }
}