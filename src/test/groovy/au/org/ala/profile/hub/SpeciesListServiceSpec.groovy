package au.org.ala.profile.hub

import au.org.ala.ws.service.WebService
import grails.testing.services.ServiceUnitTest
import spock.lang.Specification

class SpeciesListServiceSpec extends Specification implements ServiceUnitTest<SpeciesListService>{
    SpeciesListService service
    WebService webService

    def setup() {
        grailsApplication.config.lists.base.url = "http://lists.base"

        webService = Mock(WebService)
        service = new SpeciesListService()
        service.grailsApplication = grailsApplication

        service.webService = webService

    }

    def "getListsForGuid() should construct the correct Species List URL"() {
        setup:
        String expectedUrl = "http://lists.base/ws/species/guid"

        when:
        service.getListsForGuid("guid")

        then:
        1 * webService.get(expectedUrl)
    }
}
