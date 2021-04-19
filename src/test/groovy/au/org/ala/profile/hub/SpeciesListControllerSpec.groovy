package au.org.ala.profile.hub


import grails.testing.web.controllers.ControllerUnitTest
import org.apache.http.HttpStatus
import spock.lang.Specification

class SpeciesListControllerSpec extends Specification implements ControllerUnitTest<SpeciesListController> {

    SpeciesListController controller

    SpeciesListService speciesListService

    def setup() {
        controller = new SpeciesListController()
        speciesListService = Mock(SpeciesListService)
        controller.speciesListService = speciesListService
    }

    def "retrieveLists should return a 400 (BAD REQUEST) if the guid parameter is not set"() {
        when:
        controller.retrieveLists()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "retrieveLists should return the resp element of the response from the service call on success"() {
        setup:
        speciesListService.getListsForGuid(_) >> [resp: [resp: "bla"], statusCode: 200]

        when:
        params.guid = "guid1"
        controller.retrieveLists()

        then:
        assert response.status == HttpStatus.SC_OK
        assert response.json == [resp: "bla"]
    }

    def "retrieveLists should return the error code from the service on failure of the service call"() {
        setup:
        speciesListService.getListsForGuid(_) >> [error: "something died!", statusCode: 666]

        when:
        params.guid = "guid1"
        controller.retrieveLists()

        then:
        assert response.status == 666
    }
}
