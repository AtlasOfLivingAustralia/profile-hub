package au.org.ala.profile.hub

import au.org.ala.web.AuthService
import grails.testing.web.controllers.ControllerUnitTest
import org.grails.plugins.testing.GrailsMockMultipartFile
import spock.lang.Specification

import static org.apache.http.HttpStatus.SC_BAD_REQUEST
import static org.apache.http.HttpStatus.SC_NOT_FOUND

class GlossaryControllerSpec extends Specification implements ControllerUnitTest<GlossaryController> {

    ProfileService profileService
    AuthService authService
//    GlossaryController controller

    Set<String> getIncludePlugins() {
        ["core", "eventBus", "csv"].toSet()
    }

    def setup() {
        profileService = Mock(ProfileService)
        authService = Mock(AuthService)
        authService.getUserId() >> "123"
        authService.getDisplayName() >> "xyz"
//        controller = new GlossaryController()

        controller.profileService = profileService
        controller.authService = authService
    }

    def "view() should return a 400 bad request if the opusid is not provided"() {
        when:
        controller.view()

        then:
        controller.response.status == SC_BAD_REQUEST
    }

    def "view() should return a 404 not found if the opus does not exist"() {
        setup:
        profileService.getOpus(_) >> null

        when:
        controller.params.opusId = "1234"
        controller.view()

        then:
        controller.response.status == SC_NOT_FOUND
    }

    def "view should return a model with the expected number of elements"() {
        setup:
        profileService.getOpus(_) >> [uuid: "opusId1"]

        when:
        controller.params.opusId = "12345"
        controller.view()

        then:
        assert controller.modelAndView.model.containsKey("bannerUrl")
        assert controller.modelAndView.model.containsKey("logos")
        assert controller.modelAndView.model.containsKey("opus")
        assert controller.modelAndView.model.containsKey("pageTitle")
    }

    def "upload should return a 400 bad request if no opus id is provided"() {
        when:
        controller.upload()

        then:
        controller.response.status == SC_BAD_REQUEST
    }

    def "upload should return a 400 bad request if no file is provided"() {
        when:
        controller.params.opusId = "1234"
        controller.upload()

        then:
        controller.response.status == SC_BAD_REQUEST
    }

    def "upload should read each line of the csv file and pass a list of terms to the service"() {
        setup:
        File mockFile = Mock(File)
        controller.request.addFile(new GrailsMockMultipartFile("file", "file", "text/csv", "term1,description1\nterm2,description2\nterm3,description3".getBytes()))

        controller.request.getFile(_) >> mockFile
        List expectedList = [[term: "term1", description: "description1"], [term: "term2", description: "description2"], [term: "term3", description: "description3"]]

        when:
        controller.params.opusId = "1234"
        controller.upload()

        then:
        1 * profileService.uploadGlossary("1234", _, expectedList) >> [resp: [], statusCode: 200]
    }

    def "getGlossary should return a 400 bad request if there is no opusid"() {
        when:
        controller.getGlossary()

        then:
        controller.response.status == SC_BAD_REQUEST
    }

}
