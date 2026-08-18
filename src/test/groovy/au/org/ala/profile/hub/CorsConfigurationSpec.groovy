package au.org.ala.profile.hub

import grails.web.mapping.cors.GrailsCorsConfiguration
import grails.web.mapping.cors.GrailsCorsFilter
import org.springframework.boot.context.properties.bind.Bindable
import org.springframework.boot.context.properties.bind.Binder
import org.springframework.core.env.MapPropertySource
import org.springframework.core.env.StandardEnvironment
import org.springframework.mock.web.MockFilterChain
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import spock.lang.Specification

import javax.servlet.http.HttpServletResponse

/**
 * Guards the built-in Grails CORS support against the config in application.yml, and against the
 * scalar override form used by the external profile-hub-config.properties.
 */
class CorsConfigurationSpec extends Specification {

    private static final Map<String, Object> APPLICATION_YML_CONFIG = [
            'grails.cors.enabled'           : 'true',
            'grails.cors.allowedOrigins[0]' : 'https://profiles-react-ui-rebuild.dev.ala.org.au',
            'grails.cors.allowedOrigins[1]' : 'https://profiles.dev.ala.org.au',
            'grails.cors.allowedOrigins[2]' : 'https://profile-staging.ala.org.au',
            'grails.cors.allowedOrigins[3]' : 'https://profiles.ala.org.au',
            'grails.cors.allowedMethods[0]' : 'GET',
            'grails.cors.allowedMethods[1]' : 'HEAD',
            'grails.cors.allowedMethods[2]' : 'POST',
            'grails.cors.allowedMethods[3]' : 'PUT',
            'grails.cors.allowedMethods[4]' : 'DELETE',
            'grails.cors.allowedMethods[5]' : 'OPTIONS',
            'grails.cors.allowedHeaders[0]' : '*',
            'grails.cors.allowCredentials'  : 'true',
            'grails.cors.maxAge'            : '3600',
    ].asImmutable()

    private static GrailsCorsConfiguration bind(Map<String, Object>... propertySources) {
        def environment = new StandardEnvironment()
        propertySources.eachWithIndex { Map<String, Object> source, int index ->
            environment.propertySources.addFirst(new MapPropertySource("source-$index", source))
        }
        Binder.get(environment)
                .bind('grails.cors', Bindable.ofInstance(new GrailsCorsConfiguration()))
                .get()
    }

    def "application.yml config binds to the built-in Grails CORS configuration"() {
        when:
        def configuration = bind(APPLICATION_YML_CONFIG)
        def mapping = configuration.corsConfigurations['/**']

        then:
        configuration.enabled
        mapping.allowedOrigins == [
                'https://profiles-react-ui-rebuild.dev.ala.org.au',
                'https://profiles.dev.ala.org.au',
                'https://profile-staging.ala.org.au',
                'https://profiles.ala.org.au',
        ]
        mapping.allowedMethods == ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        mapping.allowedHeaders == ['*']
        mapping.allowCredentials
        mapping.maxAge == 3600L
    }

    def "external config overrides allowedOrigins with a comma separated string"() {
        given: 'the form used by profile-hub-config.properties'
        def externalConfig = ['grails.cors.allowedOrigins': 'http://localhost:5173, http://localhost:3000']

        when: 'external config takes precedence, as external-config adds it first'
        def mapping = bind(APPLICATION_YML_CONFIG, externalConfig).corsConfigurations['/**']

        then: 'it replaces rather than merges with the defaults'
        mapping.allowedOrigins == ['http://localhost:5173', 'http://localhost:3000']
        mapping.allowCredentials
    }

    def "preflight from an allowed origin is approved"() {
        given:
        def filter = new GrailsCorsFilter(bind(APPLICATION_YML_CONFIG))
        def request = new MockHttpServletRequest('OPTIONS', '/opus')
        request.addHeader('Origin', 'https://profiles.dev.ala.org.au')
        request.addHeader('Access-Control-Request-Method', 'POST')
        request.addHeader('Access-Control-Request-Headers', 'authorization,content-type')
        def response = new MockHttpServletResponse()
        def chain = new MockFilterChain()

        when:
        filter.doFilter(request, response, chain)

        then:
        response.status == HttpServletResponse.SC_OK
        response.getHeader('Access-Control-Allow-Origin') == 'https://profiles.dev.ala.org.au'
        response.getHeader('Access-Control-Allow-Credentials') == 'true'
        response.getHeader('Access-Control-Allow-Methods') == 'GET,HEAD,POST,PUT,DELETE,OPTIONS'
        response.getHeader('Access-Control-Allow-Headers') == 'authorization, content-type'
        response.getHeader('Access-Control-Max-Age') == '3600'

        and: 'preflight is answered by the filter and never reaches the application'
        chain.request == null
    }

    def "preflight from an unknown origin is rejected"() {
        given:
        def filter = new GrailsCorsFilter(bind(APPLICATION_YML_CONFIG))
        def request = new MockHttpServletRequest('OPTIONS', '/opus')
        request.addHeader('Origin', 'https://evil.example')
        request.addHeader('Access-Control-Request-Method', 'POST')
        def response = new MockHttpServletResponse()
        def chain = new MockFilterChain()

        when:
        filter.doFilter(request, response, chain)

        then:
        response.status == HttpServletResponse.SC_FORBIDDEN
        response.getHeader('Access-Control-Allow-Origin') == null
        chain.request == null
    }

    def "actual request from an allowed origin is annotated and passed down the chain"() {
        given:
        def filter = new GrailsCorsFilter(bind(APPLICATION_YML_CONFIG))
        def request = new MockHttpServletRequest('GET', '/opus')
        request.addHeader('Origin', 'https://profiles.ala.org.au')
        def response = new MockHttpServletResponse()
        def chain = new MockFilterChain()

        when:
        filter.doFilter(request, response, chain)

        then:
        response.getHeader('Access-Control-Allow-Origin') == 'https://profiles.ala.org.au'
        response.getHeader('Access-Control-Allow-Credentials') == 'true'
        chain.request != null
    }

    def "the CORS filter runs ahead of the ALA security filters"() {
        expect:
        new GrailsCorsFilter(bind(APPLICATION_YML_CONFIG)).order == Integer.MIN_VALUE
    }
}
