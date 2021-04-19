package au.org.ala.profile.hub

import au.org.ala.web.AuthService
import grails.testing.web.controllers.ControllerUnitTest
import org.apache.http.HttpStatus
import spock.lang.Specification

class ProfileControllerSpec extends Specification implements ControllerUnitTest<ProfileController> {

//    ProfileController controller
    ProfileService profileService
    AuthService authService
    BiocacheService biocacheService
    ImageService imageService
    MapService mapService
    FlorulaCookieService florulaCookieService

    def setup() {
//        controller = new ProfileController()

        profileService = Mock(ProfileService)
        authService = Mock(AuthService)
        biocacheService = Mock(BiocacheService)
        imageService = Mock(ImageService)
        mapService = Mock(MapService)
        controller.profileService = profileService
        controller.authService = authService
        controller.biocacheService = biocacheService
        controller.imageService = imageService
        controller.mapService = mapService

        florulaCookieService = Stub(FlorulaCookieService)
        controller.florulaCookieService = florulaCookieService

        authService.getDisplayName() >> "Fred Bloggs"
    }

    def "edit should return a 404 if the profile is not found"() {
        setup:
        profileService.getProfile(_, _, _) >> null

        when:
        params.opusId = "opus"
        params.profileId = "bla"
        controller.edit()

        then:
        assert response.status == HttpStatus.SC_NOT_FOUND
    }

    def "edit should return a 400 (BAD REQUEST) if a profile id is not provided"() {
        when:
        controller.edit()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "edit should return the profile, with edit and current user properties added to the model"() {
        setup:
        profileService.getProfile(_, _, _) >> [profile: [uuid: "1234"], opus: [title: "opus"]]

        when:
        params.opusId = "opus"
        params.profileId = "bla"
        controller.edit()

        then:
        assert response.status == HttpStatus.SC_OK
        assert model.containsKey("profile")
        assert model.edit == true
        assert model.currentUser == "Fred Bloggs"
    }

    def "edit should return a 403 not authorised if the profile is archived (archived profiles cannot be edited)"() {
        setup:
        profileService.getProfile(_, _, _) >> [profile: [uuid: "1234", archivedDate: new Date()], opus: [title: "opus"]]

        when:
        params.opusId = "opus"
        params.profileId = "bla"
        controller.edit()

        then:
        assert response.status == HttpStatus.SC_UNAUTHORIZED
    }

    def "show should return a 404 if the profile is not found"() {
        setup:
        profileService.getProfile(_, _, _) >> null

        when:
        params.profileId = "bla"
        controller.show()

        then:
        assert response.status == HttpStatus.SC_NOT_FOUND
    }

    def "show should return a 400 (BAD REQUEST) if a profile id is not provided"() {
        when:
        controller.show()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "show should return the profile, with edit = false added to the model"() {
        setup:
        profileService.getProfile(_, _, _) >> [profile: [scientificName: "bla"], opus: [title: "opus"]]

        when:
        params.profileId = "bla"
        controller.show()

        then:
        assert response.status == HttpStatus.SC_OK
        assert model.containsKey("profile")
        assert model.edit == false
    }

    def "getJson should return a 404 if the profile is not found"() {
        setup:
        profileService.getProfile(_, _, _, _, _) >> null

        when:
        params.profileId = "bla"
        controller.getJson()

        then:
        assert response.status == HttpStatus.SC_NOT_FOUND
    }

    def "getJson should return a 400 (BAD REQUEST) if a profile id is not provided"() {
        when:
        controller.getJson()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "getJson should return the profile added to the model"() {
        setup:
        profileService.getProfile(_, _, _, _) >> [profile: [:], opus: [:]]

        when:
        params.profileId = "bla"
        controller.getJson()

        then:
        assert response.status == HttpStatus.SC_OK
        assert response.getJson() != null
    }

    def "createProfile should return a 400 (BAD REQUEST) if a json body is not provided"() {
        when:
        controller.createProfile()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "createProfile should return the new profile"() {
        setup:
        profileService.createProfile(_, _) >> [resp: [profile: "bla"], statusCode: 200]

        when:
        request.JSON = """{"opusId": "1234", "scientificName":"name"}"""
        controller.createProfile()

        then:
        assert response.status == HttpStatus.SC_OK
        assert response.getJson() != null
    }

    def "deleteProfile should return a 400 (BAD REQUEST) if a profileId is not provided"() {
        when:
        params.opusId = "1234"
        controller.deleteProfile()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "deleteProfile should return a 400 (BAD REQUEST) if an opusId is not provided"() {
        when:
        params.profileId = "1234"
        controller.deleteProfile()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "deleteProfile should return the error code from the service on failure of the service call"() {
        setup:
        profileService.deleteProfile(_, _) >> [error: "something died!", statusCode: 666]

        when:
        params.profileId = "profile1"
        params.opusId = "opus1"
        controller.deleteProfile()

        then:
        assert response.status == 666
    }

    def "deleteProfile should return the success indicator on success"() {
        setup:
        profileService.deleteProfile(_, _) >> [resp: [success: true], statusCode: 200]

        when:
        params.profileId = "profile1"
        params.opusId = "opus1"
        controller.deleteProfile()

        then:
        assert response.status == HttpStatus.SC_OK
        assert response.json == [success: true]
    }

    def "updateBHLLinks should return a 400 (BAD REQUEST) if the json body is empty"() {
        when:
        controller.updateBHLLinks()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "updateBHLLinks should return a 400 (BAD REQUEST) if the profile id is not included in the json body"() {
        when:
        request.JSON = """{links: "xyz"}"""
        controller.updateBHLLinks()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "updateBHLLinks should return a 400 (BAD REQUEST) if the links are not included in the json body"() {
        when:
        request.JSON = """{profileId: "1"}"""
        controller.updateBHLLinks()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "updateBHLLinks should return the updated links as JSON on success"() {
        setup:
        profileService.updateBHLLinks(_, _, _) >> [resp: ["link1", "link2"], statusCode: 200]

        when:
        params.profileId = "1"
        request.JSON = """{profileId: "1", links: "xyz"}"""
        controller.updateBHLLinks()

        then:
        assert response.status == HttpStatus.SC_OK
        assert response.json == ["link1", "link2"]
    }

    def "updateBHLLinks should return the error code from the service on failure of the service call"() {
        setup:
        profileService.updateBHLLinks(_, _, _) >> [error: "something died!", statusCode: 666]

        when:
        params.profileId = "1"
        request.JSON = """{profileId: "1", links: "xyz"}"""
        controller.updateBHLLinks()

        then:
        assert response.status == 666
    }

    def "updateLinks should return a 400 (BAD REQUEST) if the json body is empty"() {
        when:
        controller.updateLinks()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "updateLinks should return a 400 (BAD REQUEST) if the profile id is not included in the json body"() {
        when:
        request.JSON = """{links: "xyz"}"""
        controller.updateLinks()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "updateLinks should return a 400 (BAD REQUEST) if the links are not included in the json body"() {
        when:
        request.JSON = """{profileId: "1"}"""
        controller.updateLinks()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "updateLinks should return the updated links as JSON on success"() {
        setup:
        profileService.updateLinks(_, _, _) >> [resp: ["link1", "link2"], statusCode: 200]

        when:
        params.profileId = "1"
        request.JSON = """{profileId: "1", links: "xyz"}"""
        controller.updateLinks()

        then:
        assert response.status == HttpStatus.SC_OK
        assert response.json == ["link1", "link2"]
    }

    def "updateLinks should return the error code from the service on failure of the service call"() {
        setup:
        profileService.updateLinks(_, _, _) >> [error: "something died!", statusCode: 666]

        when:
        params.profileId = "1"
        request.JSON = """{profileId: "1", links: "xyz"}"""
        controller.updateLinks()

        then:
        assert response.status == 666
    }

    def "updateAttribute should return a 400 (BAD REQUEST) if the json body is empty"() {
        when:
        controller.updateAttribute()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "updateAttribute should return a 400 (BAD REQUEST) if the profile id is not included in the json body"() {
        when:
        request.JSON = """{attributeId: "xyz"}"""
        controller.updateAttribute()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "updateAttribute should return a 400 (BAD REQUEST) if the attribute id is not included in the json body"() {
        when:
        request.JSON = """{profileId: "1"}"""
        controller.updateAttribute()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "updateAttribute should return a 400 (BAD REQUEST) if the profile id parameter is not provided"() {
        when:

        request.JSON = """{profileId: "1", "uuid": "1"}"""
        controller.updateAttribute()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "updateAttribute should accept a blank attribute id to create a new Attribute"() {
        setup:
        profileService.updateAttribute(_, _, _) >> [resp: [attributeId: "id1", success: true], statusCode: 200]

        when:
        params.profileId = "profile1"
        request.JSON = """{profileId: "1", uuid: ""}"""
        controller.updateAttribute()

        then:
        assert response.status == HttpStatus.SC_OK
        assert response.json == [attributeId: "id1", success: true]
    }

    def "updateAttribute should return the updated attribute id and a success indicator as JSON on success"() {
        setup:
        profileService.updateAttribute(_, _, _) >> [resp: [attributeId: "id1", success: true], statusCode: 200]

        when:
        params.profileId = "profile1"
        request.JSON = """{profileId: "1", uuid: "xyz"}"""
        controller.updateAttribute()

        then:
        assert response.status == HttpStatus.SC_OK
        assert response.json == [attributeId: "id1", success: true]
    }

    def "updateAttribute should return the error code from the service on failure of the service call"() {
        setup:
        profileService.updateAttribute(_, _, _) >> [error: "something died!", statusCode: 666]

        when:
        params.profileId = "profile1"
        request.JSON = """{profileId: "1", uuid: "xyz"}"""
        controller.updateAttribute()

        then:
        assert response.status == 666
    }

    def "deleteAttribute should return a 400 (BAD REQUEST) if the json body is empty"() {
        when:
        controller.deleteAttribute()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "deleteAttribute should return a 400 (BAD REQUEST) if the profile id is not included in the json body"() {
        when:
        params.attributeId = "att1"
        controller.deleteAttribute()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "deleteAttribute should return a 400 (BAD REQUEST) if the attribute id is not included in the json body"() {
        when:
        params.profileId = "profile1"
        controller.deleteAttribute()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "deleteAttribute should return a success indicator as JSON"() {
        setup:
        profileService.deleteAttribute(_, _, _) >> [resp: [success: true], statusCode: 200]

        when:
        params.profileId = "profile1"
        params.attributeId = "att1"
        controller.deleteAttribute()

        then:
        assert response.status == HttpStatus.SC_OK
        assert response.json == [success: true]
    }

    def "deleteAttribute should return the error code from the service on failure of the service call"() {
        setup:
        profileService.deleteAttribute(_, _, _) >> [error: "something died!", statusCode: 666]

        when:
        params.profileId = "profile1"
        params.attributeId = "att1"
        controller.deleteAttribute()

        then:
        assert response.status == 666
    }

    def "retrieveImages should return a 400 (BAD REQUEST) if the searchIdentifier parameter is not set"() {
        when:
        params.imageSources = "1,2,3"
        controller.retrieveImages()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "retrieveImages should return a 400 (BAD REQUEST) if the imagesSources parameter is not set"() {
        when:
        params.searchIdentifier = "blabla"
        controller.retrieveImages()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "retrieveImages should return an empty map with there are no visible images"() {
        setup:
        imageService.retrieveImages(_, _, _, _) >> [resp: [resp: "bla"], statusCode: 200]

        when:
        params.searchIdentifier = "blabla"
        params.imageSources = "1,2,3"
        params.profileId = "profile1"
        params.opusId = "opus1"
        controller.retrieveImages()

        then:
        assert response.status == HttpStatus.SC_OK
        assert response.json == [:]
    }

    def "retrieveSpeciesProfile should return a 400 (BAD REQUEST) if the guid parameter is not set"() {
        when:
        controller.retrieveSpeciesProfile()

        then:
        assert response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "retrieveSpeciesProfile should return the resp element of the response from the service call on success"() {
        setup:
        profileService.getSpeciesProfile(_) >> [resp: [resp: "SpeciesProfile"], statusCode: 200]

        when:
        params.guid = "guid1"
        controller.retrieveSpeciesProfile()

        then:
        assert response.status == HttpStatus.SC_OK
        assert response.json == [resp: "SpeciesProfile"]
    }

    def "retrieveSpeciesProfile should return the error code from the service on failure of the service call"() {
        setup:
        profileService.getSpeciesProfile(_) >> [error: "something died!", statusCode: 666]

        when:
        params.guid = "guid1"
        controller.retrieveSpeciesProfile()

        then:
        assert response.status == 666
    }

    def "show should not include the map when the profile has no matched name"() {

        setup:
        profileService.getProfile(_, _, _) >> [profile: [scientificName: "bla", guid:null], opus: [title: "opus"]]
        profileService.hasMatchedName(_) >> false

        when:
        params.opusId = "opus"
        params.profileId = "bla"
        controller.show()

        then:
        model.displayMap == false
    }

    def "edit should include the map even when the profile has no matched name"() {
        setup:
        profileService.getProfile(_, _, _) >> [profile: [scientificName: "bla", guid:null], opus: [title: "opus"]]
        profileService.hasMatchedName(_) >> false

        when:
        params.opusId = "opus"
        params.profileId = "bla"
        controller.edit()

        then:
        model.displayMap == true
    }


    def "show/edit should include the map when the profile has a matched name"() {
        setup:
        profileService.getProfile(_, _, _) >> [profile: [scientificName: "bla", guid:"1234"], opus: [title: "opus"]]
        profileService.hasMatchedName(_) >> true

        when:
        params.opusId = "opus"
        params.profileId = "bla"
        controller.show()

        then:
        model.displayMap == true

        when:
        controller.edit()

        then:
        model.displayMap == true
    }
}
