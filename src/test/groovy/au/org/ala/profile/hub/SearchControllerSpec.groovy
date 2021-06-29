package au.org.ala.profile.hub


import grails.testing.web.controllers.ControllerUnitTest
import org.apache.http.HttpStatus
import spock.lang.Specification

class SearchControllerSpec extends Specification implements ControllerUnitTest<SearchController> {

    SearchController controller
    ProfileService profileService

    def setup() {
        controller = new SearchController()

        profileService = Mock(ProfileService)
        controller.profileService = profileService
    }

    def "search should return a 400 (BAD REQUEST) if the scientificName parameter is not set"() {
        when:
        params.opusId = "bla"
        controller.findByScientificName()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "search should return the resp element of the response from the service call on success"() {
        setup:
        profileService.findByScientificName(_, _, _, _, _, _) >> [resp: [resp: "search results"], statusCode: 200]

        when:
        params.opusId = "guid1"
        params.scientificName = "name1"
        controller.findByScientificName()

        then:
        assert response.status == HttpStatus.SC_OK
        assert response.json == [resp: "search results"]
    }

    def "search should return the error code from the service on failure of the service call"() {
        setup:
        profileService.findByScientificName(_, _, _, _, _, _) >> [error: "something died!", statusCode: 666]

        when:
        params.opusId = "guid1"
        params.scientificName = "name1"
        controller.findByScientificName()

        then:
        assert response.status == 666
    }
}
