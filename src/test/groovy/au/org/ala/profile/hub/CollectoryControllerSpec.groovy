package au.org.ala.profile.hub


import grails.testing.web.controllers.ControllerUnitTest
import org.apache.http.HttpStatus
import spock.lang.Specification

class CollectoryControllerSpec extends Specification implements ControllerUnitTest<CollectoryController>{

    CollectoryController controller
    CollectoryService collectoryService

    def setup() {
        controller = new CollectoryController()

        collectoryService = Mock(CollectoryService)
        controller.collectoryService = collectoryService
    }

    def "getResource should return a 400 (BAD REQUEST) if the dataResourceUid parameter is not set"() {
        when:
        controller.getResource()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "getResource should return the resp element of the response from the service call on success"() {
        setup:
        collectoryService.getDataResource(_) >> [resp: [resp: "resource"], statusCode: 200]

        when:
        params.dataResourceUid = "drId1"
        controller.getResource()

        then:
        assert response.status == HttpStatus.SC_OK
        assert response.json == [resp: "resource"]
    }

    def "getResource should return the error code from the service on failure of the service call"() {
        setup:
        collectoryService.getDataResource(_) >> [error: "something died!", statusCode: 666]

        when:
        params.dataResourceUid = "drId1"
        controller.getResource()

        then:
        assert response.status == 666
    }

}
