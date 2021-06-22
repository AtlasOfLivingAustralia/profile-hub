package au.org.ala.profile.hub

import au.org.ala.ws.service.WebService
import grails.testing.services.ServiceUnitTest
import spock.lang.Specification

class BieServiceSpec extends Specification implements ServiceUnitTest<BieService> {
    BieService service
    WebService webService

    def setup() {
        grailsApplication.config.bie.ws.url = "http://bie.service"

        webService = Mock(WebService)
        service = new BieService()
        service.grailsApplication = grailsApplication

        service.webService = webService

    }

    def "getSpeciesProfile() should construct the correct BIE Service URL"() {
        setup:
        String expectedUrl = "http://bie.service/ws/species/guid"

        when:
        service.getSpeciesProfile("guid")

        then:
        1 * webService.get(expectedUrl)
    }

}
