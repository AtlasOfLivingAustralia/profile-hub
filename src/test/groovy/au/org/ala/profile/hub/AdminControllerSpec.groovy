package au.org.ala.profile.hub

import grails.testing.web.controllers.ControllerUnitTest
import org.apache.http.HttpStatus
import spock.lang.Specification

class AdminControllerSpec extends Specification implements ControllerUnitTest<AdminController> {

    AdminController controller

    def setup() {
        controller = new AdminController()
    }

    def "cache management should display to the admin controller when admin mode"() {
        when:
        controller.cacheManagement()

        then:
        assert response.status == HttpStatus.SC_OK
    }

    def "clearCache() should return a 200 (OK_REQUEST) if id has been provided"() {
        when:
        params.id = "userDetailsCache"
        controller.clearCache()

        then:
        response.status == HttpStatus.SC_OK
    }

    def "clearCache() should return a 400 (BAD_REQUEST) if id has not been provided"() {
        when:
        params.id = ""
        controller.clearCache()

        then:
        response.status != HttpStatus.SC_OK
    }
}
