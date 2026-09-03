package au.org.ala.profile.hub

import au.org.ala.ws.service.WebService
import grails.testing.services.ServiceUnitTest
import org.apache.http.entity.ContentType
import spock.lang.Specification
import spock.lang.Unroll

class EmbedServiceSpec extends Specification implements ServiceUnitTest<EmbedService> {

    @Unroll
    def "findProvider recognises #providerName URLs"() {
        expect:
        service.findProvider(url)?.name == providerName

        where:
        url                                                            | providerName
        'https://www.youtube.com/watch?v=sCAlIDe5Hi8&t=2261s'           | 'YouTube'
        'https://youtu.be/sCAlIDe5Hi8'                                  | 'YouTube'
        'https://soundcloud.com/example/recording'                      | 'SoundCloud'
        'https://www.ted.com/talks/example'                             | 'TED Talks'
        'https://home.wistia.com/medias/e4a27b971d'                     | 'Wistia'
        'https://vimeo.com/147173661'                                   | 'Vimeo'
        'https://player.vimeo.com/video/147173661'                      | 'Vimeo'
    }

    def "describe uses the fixed HTTPS provider endpoint"() {
        given:
        String url = 'https://soundcloud.com/example/recording'
        WebService webService = Mock(WebService)
        service.webService = webService

        when:
        Map result = service.describe(url)

        then:
        1 * webService.get('https://soundcloud.com/oembed', [url: url, format: 'json'],
                ContentType.APPLICATION_JSON, false, false) >> [resp: [title: 'Recording', html: '<iframe></iframe>']]
        result.service == [type: 'audio', name: 'SoundCloud']
        result.embed.title == 'Recording'
    }

    def "describe rejects unsupported URLs without making a request"() {
        given:
        WebService webService = Mock(WebService)
        service.webService = webService

        when:
        Map result = service.describe('https://example.org/media')

        then:
        result.error == 'Unsupported multimedia URL'
        0 * webService._
    }
}
