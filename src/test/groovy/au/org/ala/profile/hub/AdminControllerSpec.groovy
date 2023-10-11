package au.org.ala.profile.hub

import grails.testing.web.controllers.ControllerUnitTest
import org.apache.http.HttpStatus
import spock.lang.Specification

class AdminControllerSpec extends Specification implements ControllerUnitTest<AdminController> {

    AdminController mockAdminController

    def setup() {
        mockAdminController = Mock(AdminController)
    }

    def "cache management should display to the admin controller when admin mode"() {
        when:
        mockAdminController.cacheManagement()

        then:
        assert response.status == HttpStatus.SC_OK
    }

    def "clearCache() should return a 200 (OK_REQUEST) if id has been provided"() {
        when:
        params.id = "userDetailsCache"
        mockAdminController.clearCache()

        then:
        response.status == HttpStatus.SC_OK
    }
}
