package au.org.ala.profile.hub

import au.org.ala.web.AuthService
import au.org.ala.ws.service.WebService
import grails.test.mixin.TestFor
import org.codehaus.groovy.grails.web.json.JSONObject
import spock.lang.Specification

@TestFor(ProfileService)
class ProfileServiceSpec extends Specification {
    ProfileService service
    WebService webService
    WebServiceWrapperService webServiceWrapperService
    AuthService authService

    def setup() {
        grailsApplication.config.profile.service.url = "http://profile.service"

        authService = Mock(AuthService)
        authService.getUserId() >> "user1"
        authService.userDetails() >> new au.org.ala.web.UserDetails(firstName: 'fred', lastName: 'smith')

        webService = Mock(WebService)
        service = new ProfileService()
        webServiceWrapperService = Mock(WebServiceWrapperService)
        service.grailsApplication = grailsApplication

        service.webService = webService
        service.authService = authService
        service.webServiceWrapperService = webServiceWrapperService
    }

    def "getClassification() should construct the correct Profile Service URL"() {
        setup:
        String expectedUrl = "http://profile.service/opus/opusid/profile/profileid/classification?guid=guid&opusId=opusid"

        when:
        service.getClassification("opusid", "profileid", "guid")

        then:
        1 * webServiceWrapperService.get(expectedUrl)
    }

    def "updateLinks() should construct the correct Profile Service URL"() {
        setup:
        String expectedUrl = "http://profile.service/opus/opusid/profile/profileId/links"

        when:
        service.updateLinks("opusid", "profileId", "linkdata")

        then:
        1 * webService.post(expectedUrl, [profileId: "profileId", links: "linkdata", userId: "user1", userDisplayName: "fred smith"])
    }

    def "updateAuthorship() should construct the correct Profile Service URL"() {
        setup:
        String expectedUrl = "http://profile.service/opus/opusid/profile/profileId/authorship"

        when:
        service.updateAuthorship("opusid", "profileId", [category: "author", text: "fred"])

        then:
        1 * webService.post(expectedUrl, [category: "author", text: "fred"])
    }


    def "hasMatchedName should return false if the Profile guid is null"() {
        when:
        Map profile = [profileId:'1', guid:null]

        then:
        service.hasMatchedName(profile) == false
    }

    def "hasMatchedName should return false if the Profile guid is a Grails JSONObject.NULL"() {
        when:
        Map profile = [profileId:'1', guid:JSONObject.NULL]

        then:
        service.hasMatchedName(profile) == false
    }

    def "hasMatchedName should return true if the Profile guid is valid"() {
        when:
        Map profile = [profileId:'1', guid:"1234567"]

        then:
        service.hasMatchedName(profile) == true
    }

}
