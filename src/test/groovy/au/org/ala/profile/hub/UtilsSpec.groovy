package au.org.ala.profile.hub

import spock.lang.Specification
import spock.lang.Unroll

class UtilsSpec extends Specification {
    @Unroll
    def "should get client id from jwt"() {
        given:
        String authorization = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJJc3N1ZXIiOiJJc3N1ZXIiLCJleHAiOjE2Njk2MDg2NzQsImlhdCI6MTY2OTYwODY3NCwiY2xpZW50X2lkIjoiYWJjIn0.EHPAeooKmJjot-0yo6UWsEn_Ow_DZKYyrsRHCOYuqxY"

        when:
        String clientId = Utils.getClientId(authorization)

        then:
        clientId == 'abc'
    }
}
