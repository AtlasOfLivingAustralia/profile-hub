package au.org.ala.profile.hub

import grails.testing.web.controllers.ControllerUnitTest
import org.apache.http.HttpStatus
import org.grails.plugin.cache.GrailsCacheManager
import org.springframework.cache.Cache
import spock.lang.Specification

class AdminControllerSpec extends Specification implements ControllerUnitTest<AdminController> {

    def setup() {
        controller.grailsCacheManager = Mock(GrailsCacheManager)
    }

    def "cache management should display to the admin controller when admin mode"() {
        when:
        controller.grailsCacheManager.getCacheNames() >> ["Cache1","Cache2"]
        controller.cacheManagement()

        then:
        def cacheNames  = '["Cache1","Cache2"]'

        assert response.getContentAsString() == cacheNames
    }

    def "clearCache() should return a 200 (OK_REQUEST) if id has been provided"() {
        when:
        params.id = "userDetailsCache"

        Cache cache = Mock(Cache.class);
        controller.grailsCacheManager.getCache(params.id) >> cache
        controller.clearCache()

        then:
        response.status == HttpStatus.SC_OK
        def successMessage = '{"resp":"Successfully cleared cache - userDetailsCache","statusCode":200}'
        assert response.getContentAsString() == successMessage
    }

    def "clearCache() should return a 400 (BAD_REQUEST) if id has not been provided"() {
        when:
        params.id = ""
        controller.clearCache()

        then:
        response.status != HttpStatus.SC_OK
        assert response.errorMessage == "Failed to clear cache the job"
    }
}
