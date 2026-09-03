package au.org.ala.profile.hub

import grails.testing.web.controllers.ControllerUnitTest
import org.apache.http.HttpStatus
import spock.lang.Specification

class MultimediaControllerSpec extends Specification implements ControllerUnitTest<MultimediaController> {

    def setup() {
        controller.embedService = Mock(EmbedService)
    }

    def "describe requires a URL"() {
        when:
        controller.describe()

        then:
        response.status == HttpStatus.SC_BAD_REQUEST
    }

    def "describe returns a normalized oEmbed response"() {
        given:
        params.url = 'https://vimeo.com/147173661'
        controller.embedService.describe(params.url) >> [
                service: [type: 'video', name: 'Vimeo'],
                embed: [title: 'Example']
        ]

        when:
        controller.describe()

        then:
        response.status == HttpStatus.SC_OK
        response.json.service.name == 'Vimeo'
        response.json.embed.title == 'Example'
    }

    def "describe returns bad request when resolution fails"() {
        given:
        params.url = 'https://example.org/media'
        controller.embedService.describe(params.url) >> [error: 'Unsupported multimedia URL']

        when:
        controller.describe()

        then:
        response.status == HttpStatus.SC_BAD_REQUEST
        response.json.error == 'Unsupported multimedia URL'
    }
}
