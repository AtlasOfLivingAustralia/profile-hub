package au.org.ala.profile.hub

import au.org.ala.profile.analytics.Analytics
import au.org.ala.profile.api.ProfileBriefResponse
import au.org.ala.web.AuthService
import au.org.ala.web.UserDetails
import grails.events.Events
import grails.testing.web.interceptor.InterceptorUnitTest
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
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

class AnalyticsInterceptorSpec extends Specification implements InterceptorUnitTest<AnalyticsInterceptor> {

    def controller

    def setup() {
        grailsApplication.config.security.authorisation.disable = false
        grailsApplication.config.lists.base.url = "http://lists.ala.org.au"
        grailsApplication.config.image.staging.dir = "/data/profile-hub/"
        grailsApplication.config.app.analytics = [apiid: "cd1", collectionid: "cd2", profileid: "cd3", userid: "cd4"]
        controller = new ExampleController()
    }

    void "Send appropriate data to GA depending on called controller action"() {
        setup:
        grailsApplication.addArtefact("Controller", ExampleController)
        defineBeans {
            authService(MockAuthService)
//            analyticsService(MockAnalyticsService)
        }

        interceptor.analyticsService = Mock(AnalyticsService)
        controller = (ExampleController) mockController(ExampleController)

        when:
        params.opusId = "public1"
        request.method = "GET"
        request.addHeader(grailsApplication.config.app.http.header.userName, userName)
        request.cookies = [new Cookie('_ga', 'GA1.1.abc.123')].toArray()
        request.requestURI = "/api/opus/public1/profile"
        request.setAttribute(GrailsApplicationAttributes.CONTROLLER_NAME_ATTRIBUTE, 'example')
        request.setAttribute(GrailsApplicationAttributes.ACTION_NAME_ATTRIBUTE, 'publicAction')
        withInterceptors(controller: "example", action: "publicAction") {
            controller.publicAction()
        }

        then:
        response.status == responseCode
        1 * interceptor.analyticsService.pageView("localhost", "/api/opus/public1/profile", 'abc.123', "127.0.0.1", null, null, payload)

        where:
        userName            | responseCode | payload
        ""                  | 200          | [dt: "List profiles in a collection", cd1: "/opus/{opusId}/profile", cd2: "public1"]
        "user1@test.org.au" | 200          | [dt: "List profiles in a collection", cd1: "/opus/{opusId}/profile", cd2: "public1", cd4: "123"]

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
@Api
class ExampleController {
    MockAnalyticsService analyticsService

    @ApiOperation(
            value = "List profiles in a collection",
            nickname = "/opus/{opusId}/profile",
            produces = "application/json",
            httpMethod = "GET",
            response = ProfileBriefResponse,
            responseContainer = "List"
    )
    def publicAction() {
    }
}

class MockAuthService extends AuthService implements Events {
    @Override
    UserDetails getUserForEmailAddress(String emailAddress) {
        if (emailAddress) {
            new UserDetails(userId:"123")
        }
    }
}

class MockAnalyticsService extends AnalyticsService implements Events {
    @Override
    void pageView(String hostname, String path, String clientId, String userIp, String userAgent, String referrer, Map payload = [:]) {
    }
}