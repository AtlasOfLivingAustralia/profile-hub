package au.org.ala.profile.hub

import au.org.ala.web.AuthService
import grails.testing.web.controllers.ControllerUnitTest
import org.apache.http.HttpStatus
import spock.lang.Specification

class OpusControllerSpec extends Specification implements ControllerUnitTest<OpusController>{

//    OpusController controller

    CollectoryService mockCollectory
    AuthService mockAuthService
    UserService mockUserService
    ProfileService mockProfileService
    FlorulaCookieService stubFlorulaCookieService

    def setup() {
//        controller = new OpusController()
        mockCollectory = Mock(CollectoryService)
        controller.collectoryService = mockCollectory
        mockAuthService = Mock(AuthService)
        controller.authService = mockAuthService
        mockUserService = Mock(UserService)
        controller.userService = mockUserService

        mockProfileService = Mock(ProfileService)
        controller.profileService = mockProfileService
        stubFlorulaCookieService = Stub(FlorulaCookieService)
        controller.florulaCookieService = stubFlorulaCookieService
    }

    def "index should render the index view"() {
        when:
        controller.index()

        then:
        assert view == "/opus/index"
    }

    def "index should return a model with the expected number of elements"() {
        when:
        controller.index()

        then:
        assert model.size() == 4
        assert model.containsKey("logos")
        assert model.containsKey("bannerUrl")
        assert model.containsKey("footerText")
        assert model.containsKey("contact")
    }

    def "edit should render the edit view"() {
        setup:
        mockProfileService.getOpus(_) >> [uuid: "opusId1"]

        when:
        controller.edit()

        then:
        assert view == "/opus/edit"
    }

    def "edit should return a model with the expected number of elements"() {
        setup:
        mockProfileService.getOpus(_) >> [uuid: "opusId1"]

        when:
        controller.edit()

        then:
        assert model.size() == 19
        assert model.containsKey("opus")
        assert model.containsKey("logos")
        assert model.containsKey("opusUrl")
        assert model.containsKey("bannerUrl")
        assert model.containsKey("currentUser")
        assert model.containsKey("searchUrl")
        assert model.containsKey("browseUrl")
        assert model.containsKey("identifyUrl")
        assert model.containsKey("documentsUrl")
        assert model.containsKey("reportsUrl")
        assert model.containsKey("glossaryUrl")
        assert model.containsKey("aboutPageUrl")
        assert model.containsKey("footerText")
        assert model.containsKey("contact")
    }

    def "show should render the show view"() {
        setup:
        mockProfileService.getOpus(_) >> [uuid: "opusId1"]

        when:
        controller.show()

        then:
        assert view == "/opus/show"
    }

    def "show should return a model with the expected number of elements"() {
        setup:
        mockProfileService.getOpus(_) >> [uuid: "opusId1"]

        when:
        controller.show()

        then:
        assert model.size() == 21
        assert model.containsKey("opus")
        assert model.containsKey("logos")
        assert model.containsKey("bannerUrl")
        assert model.containsKey("opusUrl")
        assert model.containsKey("searchUrl")
        assert model.containsKey("browseUrl")
        assert model.containsKey("identifyUrl")
        assert model.containsKey("documentsUrl")
        assert model.containsKey("reportsUrl")
        assert model.containsKey("glossaryUrl")
        assert model.containsKey("aboutPageUrl")
        assert model.containsKey("footerText")
        assert model.containsKey("contact")
    }

    def "getJson should return a 400 (BAD REQUEST) if the opusId parameter is not set"() {
        when:
        controller.getJson()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "getJson should return the response from the service call on success"() {
        setup:
        mockProfileService.getOpus(_) >> [opus: [uuid: "opus1"]]

        when:
        params.opusId = "opus1"
        controller.getJson()

        then:
        assert response.status == HttpStatus.SC_OK
        assert response.json == [opus: [uuid: "opus1"]]
    }

    def "getJson should return a 404 code when no matching opus is found"() {
        setup:
        mockUserService.findUser(_) >> null

        when:
        params.opusId = "opus1"
        controller.getJson()

        then:
        assert response.status == HttpStatus.SC_NOT_FOUND
    }

    def "list should remove all private collections if there is no logged in user"() {
        setup:
        mockAuthService.getUserId() >> null
        Map opus1 = [privateCollection: true, authorities: []]
        Map opus2 = [privateCollection: false, authorities: []]
        Map opus3 = [privateCollection: true, authorities: []]
        Map opus4 = [privateCollection: false, authorities: []]
        mockProfileService.getOpus() >> [opus1, opus2, opus3, opus4]

        when:
        controller.list()

        then:
        assert response.json == [opus2, opus4]
    }

    def "list should remove private collections if the logged in user is not registered with the collection"() {
        setup:
        mockAuthService.getUserId() >> "1234"
        Map opus1 = [privateCollection: true, authorities: [[userId: "9876"]]]
        Map opus2 = [privateCollection: false, authorities: []]
        Map opus3 = [privateCollection: true, authorities: [[userId: "1234"]]]
        Map opus4 = [privateCollection: false, authorities: []]
        mockProfileService.getOpus() >> [opus1, opus2, opus3, opus4]

        when:
        controller.list()

        then:
        assert response.json == [opus2, opus3, opus4]
    }

    def "list should not remove private collections if the logged in user in an ALA admin"() {
        setup:
        mockAuthService.getUserId() >> "1234"
        Map opus1 = [privateCollection: true, authorities: [[userId: "9876"]]]
        Map opus2 = [privateCollection: false, authorities: []]
        Map opus3 = [privateCollection: true, authorities: [[userId: "1234"]]]
        Map opus4 = [privateCollection: false, authorities: []]
        mockProfileService.getOpus() >> [opus1, opus2, opus3, opus4]

        when:
        params.isALAAdmin = true // this is usually determined by the AccessControlFilter
        controller.list()

        then:
        assert response.json == [opus1, opus2, opus3, opus4]
    }
}
