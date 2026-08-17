package au.org.ala.profile.hub

import org.springframework.mock.web.MockFilterChain
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import spock.lang.Specification
import spock.lang.Unroll

import javax.servlet.http.HttpServletResponse

class CorsFilterSpec extends Specification {

    @Unroll
    def "parseOrigins accepts #description"() {
        expect:
        CorsFilter.parseOrigins(raw) == expected

        where:
        description              | raw                                                         | expected
        'a YAML/Groovy list'     | ['https://a.example', 'https://b.example']                  | ['https://a.example', 'https://b.example']
        'a comma-separated string'| 'https://a.example, https://b.example'                     | ['https://a.example', 'https://b.example']
        'null'                   | null                                                        | []
        'an empty string'        | '  '                                                        | []
        'blank list entries'     | ['https://a.example', ' ', null]                            | ['https://a.example']
    }

    def "allows a configured origin and echoes it on the response"() {
        given:
        def filter = new CorsFilter(['https://profiles.dev.ala.org.au'])
        def request = new MockHttpServletRequest('GET', '/opus')
        request.addHeader('Origin', 'https://profiles.dev.ala.org.au')
        def response = new MockHttpServletResponse()
        def chain = new MockFilterChain()

        when:
        filter.doFilter(request, response, chain)

        then:
        response.getHeader('Access-Control-Allow-Origin') == 'https://profiles.dev.ala.org.au'
        response.getHeader('Access-Control-Allow-Credentials') == 'true'
        chain.request != null
    }

    def "rejects an unconfigured origin on preflight"() {
        given:
        def filter = new CorsFilter(['https://profiles.dev.ala.org.au'])
        def request = new MockHttpServletRequest('OPTIONS', '/opus')
        request.addHeader('Origin', 'https://evil.example')
        def response = new MockHttpServletResponse()
        def chain = new MockFilterChain()

        when:
        filter.doFilter(request, response, chain)

        then:
        response.status == HttpServletResponse.SC_FORBIDDEN
        response.getHeader('Access-Control-Allow-Origin') == null
        chain.request == null
    }
}
