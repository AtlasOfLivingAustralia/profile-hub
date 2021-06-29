package au.org.ala.profile.hub

import au.org.ala.ws.service.WebService
import grails.converters.JSON
import grails.testing.services.ServiceUnitTest
import spock.lang.Specification

class CollectoryServiceSpec extends Specification implements ServiceUnitTest<CollectoryService>{

    def CollectoryService service = new CollectoryService()

    def "getDataResources should return an empty map if there are no data resources available"() {
        setup:
        grailsApplication.config.collectory.base.url = "test"
        service.grailsApplication = grailsApplication
        WebService webService = Mock(WebService)
        webService.get(_) >> null
        service.webService = webService

        when:
        Map<String, String> result = service.getDataResources()

        then:
        assert result == [:]

    }

    def "getDataResources should return a map of UUID|Name for each data resource"() {
        setup:
        grailsApplication.config.collectory.base.url = "test"
        service.grailsApplication = grailsApplication
        WebService webService = Mock(WebService)
        webService.get(_) >> JSON.parse("""{"resp":[{"name": "Resource1",
                                                     "uri": "uri1",
                                                     "uid": "dr1"},
                                                    {"name": "Resource2",
                                                     "uri": "uri2",
                                                     "uid": "dr2"}]}""")
        service.webService = webService

        when:
        Map<String, String> result = service.getDataResources()

        then:
        assert result == [dr1: "Resource1", dr2: "Resource2"]
    }
}
