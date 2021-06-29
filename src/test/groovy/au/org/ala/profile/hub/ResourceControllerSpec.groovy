package au.org.ala.profile.hub

import com.google.common.io.Resources
import grails.testing.web.controllers.ControllerUnitTest
import spock.lang.Specification

class ResourceControllerSpec extends Specification implements ControllerUnitTest<ResourceController> {

    def setup() {
    }

    def cleanup() {
    }

    void "test facets"() {
        when:
        controller.facets()

        then:
        response.contentType == 'application/json'
        response.text == Resources.getResource('grouped_facets_ala.json').text

        // ensure cached facets returned
        when:
        response.reset()
        def file = File.createTempFile('profile-hub', 'test')
        file.deleteOnExit()
        file << '[]'
        controller.grailsApplication.config.facets = file.canonicalPath
        controller.facets()

        then:
        response.text == Resources.getResource('grouped_facets_ala.json').text

        // remove cache and ensure external facets can be loaded
        when:
        response.reset()
        controller.facets = null
        controller.facets()

        then:
        response.text == '[]'

    }
}
