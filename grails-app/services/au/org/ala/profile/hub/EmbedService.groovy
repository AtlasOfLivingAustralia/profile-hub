package au.org.ala.profile.hub

import org.apache.http.entity.ContentType

/**
 * Resolves supported multimedia URLs through server-side oEmbed requests.
 * Provider endpoints are deliberately fixed here so user supplied URLs cannot
 * turn this service into an arbitrary HTTP proxy.
 */
class EmbedService {

    def webService
    def grailsApplication

    Map describe(String url) {
        Map provider = findProvider(url)
        if (!provider) {
            return [error: 'Unsupported multimedia URL']
        }

        Map response
        try {
            response = webService.get(
                    provider.api,
                    [url: url, format: 'json'],
                    ContentType.APPLICATION_JSON,
                    false,
                    false
            )
        } catch (Exception e) {
            log.warn("Unable to retrieve oEmbed information from ${provider.name}", e)
            return [error: 'Unable to retrieve multimedia information']
        }

        if (!response || response.error || !response.resp) {
            return [error: 'Unable to retrieve multimedia information']
        }

        [
                service: [type: provider.type, name: provider.name],
                embed: response.resp
        ]
    }

    Map findProvider(String url) {
        if (!url) {
            return null
        }

        List providers = grailsApplication.config.getProperty(
            'multimedia.oembed.providers',
            List,
            []
        )

        providers.find { provider ->
            provider.patterns?.any { pattern ->
                url ==~ pattern.toString()
            }
        }
    }
}
