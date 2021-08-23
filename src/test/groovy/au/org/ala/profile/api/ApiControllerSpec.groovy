package au.org.ala.profile.api

import au.org.ala.profile.hub.MapService
import au.org.ala.profile.hub.ProfileService
import grails.testing.web.controllers.ControllerUnitTest
import spock.lang.Specification

class ApiControllerSpec extends Specification implements ControllerUnitTest<ApiController> {
    def profileService
    def apiService
    def mapService

    def setup() {
        profileService = controller.profileService = Mock(ProfileService)
        apiService = controller.apiService = Mock(ApiService)
        mapService = controller.mapService = Mock(MapService)
    }

    void "getProfiles should be provided with opus id parameter"() {
        setup:
        profileService.getOpus('opus1') >> [uuid: 'abc']

        when:
        params.opusId = opusId
        controller.getProfiles()

        then:
        response.status == responseCode

        where:
        opusId  | responseCode
        null    | 400
        'abc'   | 404
        'opus1' | 200
    }

    void "get should be provided with opus id and profile id parameters"() {
        setup:
        profileService.getProfile('opus1', '123', false, true) >> [opus: [uuid: 'abc'], profile: [uuid: '123']]

        when:
        params.opusId = opusId
        params.profileId = profileId
        controller.get()

        then:
        response.status == responseCode

        where:
        opusId  | profileId | responseCode
        null    | null      | 400
        null    | '123'     | 400
        'opus1' | null      | 400
        'opus1' | '123'     | 200
    }

    void "getDraftProfile should be provided with opus id and profile id parameters"() {

        when:
        profileService.getProfile('opus1', '123', true, true) >> [opus: [uuid: 'abc'], profile: [uuid: '123', privateMode: privateMode]]
        params.opusId = opusId
        params.profileId = profileId
        controller.getDraftProfile()

        then:
        response.status == responseCode

        where:
        opusId  | profileId | privateMode | responseCode
        null    | null      | false       | 400
        null    | '123'     | false       | 400
        'opus1' | null      | false       | 400
        'opus1' | '123'     | false       | 404
        'opus1' | '123'     | true        | 200
    }

    void "getImages should be provided with opus id and profile id parameters"() {
        setup:
        profileService.retrieveImagesPaged('opus1', '123', 10, 1) >> [opus: [uuid: 'abc'], profile: [uuid: '123']]

        when:
        params.opusId = opusId
        params.profileId = profileId
        controller.getImages()

        then:
        response.status == responseCode

        where:
        opusId  | profileId | startIndex | pageSize | responseCode
        null    | null      | '1'        | '10'     | 400
        null    | '123'     | '1'        | '10'     | 400
        'opus1' | null      | '1'        | '10'     | 400
        'opus1' | '123'     | '1'        | '10'     | 200
    }

    void "getAttributes should be provided with opus id and profile id parameters"() {
        setup:
        profileService.getProfile('opus1', '123', false, true) >> [opus: [uuid: 'abc'], profile: [uuid: '123']]

        when:
        params.opusId = opusId
        params.profileId = profileId
        params.attributeId = attributes
        controller.getAttributes()

        then:
        response.status == responseCode

        where:
        opusId  | profileId | attributes | responseCode
        null    | null      | null       | 400
        null    | '123'     | null       | 400
        'opus1' | null      | null       | 400
        'opus1' | '123'     | null       | 404
        'opus1' | '123'     | 'a,b'      | 200
    }
}
