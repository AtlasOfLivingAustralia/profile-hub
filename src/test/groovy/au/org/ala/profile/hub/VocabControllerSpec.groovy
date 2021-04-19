package au.org.ala.profile.hub


import grails.testing.web.controllers.ControllerUnitTest
import org.apache.http.HttpStatus
import spock.lang.Specification

class VocabControllerSpec extends Specification implements ControllerUnitTest<VocabController> {

    VocabController controller
    ProfileService profileService

    def setup() {
        controller = new VocabController()

        profileService = Mock(ProfileService)
        controller.profileService = profileService
    }

    def "show should return a 400 (BAD REQUEST) if a vocab id is not provided"() {
        when:
        controller.show()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "update should return a 400 (BAD REQUEST) if a vocab id is not provided"() {
        when:
        request.JSON = """{}"""
        controller.update()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "update should return a 400 (BAD REQUEST) if a json body is not provided"() {
        when:
        params.vocabId = "12345"
        controller.update()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "findUsagesOfTerm should return a 400 (BAD REQUEST) if a vocab id is not provided"() {
        when:
        params.termName = "something"
        controller.findUsagesOfTerm()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "findUsagesOfTerm should return a 400 (BAD REQUEST) if a term name is not provided"() {
        when:
        params.vocabId = "12345"
        controller.findUsagesOfTerm()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "replaceUsagesOfTerm should return a 400 (BAD REQUEST) if a json body is not provided"() {
        when:
        controller.replaceUsagesOfTerm()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }
}
