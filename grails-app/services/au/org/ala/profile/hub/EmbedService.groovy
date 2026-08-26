package au.org.ala.profile.hub

import org.apache.http.entity.ContentType

/**
 * Resolves supported multimedia URLs through server-side oEmbed requests.
 * Provider endpoints are deliberately fixed here so user supplied URLs cannot
 * turn this service into an arbitrary HTTP proxy.
 */
class EmbedService {

    def webService

    private static final List<Map> PROVIDERS = [
            [
                    type: 'video',
                    name: 'YouTube',
                    api: 'https://www.youtube.com/oembed',
                    patterns: [
                            ~/(?i)https?:\/\/(?:[^.]+\.)?youtube\.com\/watch\/?\?.*v=[^&]+.*/,
                            ~/(?i)https?:\/\/(?:[^.]+\.)?(?:youtu\.be|youtube\.com\/embed)\/[a-zA-Z0-9_-]+.*/
                    ]
            ],
            [
                    type: 'video',
                    name: 'TED Talks',
                    api: 'https://www.ted.com/services/v1/oembed.json',
                    patterns: [~/(?i)https?:\/\/((?:www|embed)\.)?ted\.com\/talks\/.*/]
            ],
            [
                    type: 'audio',
                    name: 'SoundCloud',
                    api: 'https://soundcloud.com/oembed',
                    patterns: [~/(?i)https?:\/\/(?:www\.)?soundcloud\.com\/.+/]
            ],
            [
                    type: 'video',
                    name: 'Wistia',
                    api: 'https://fast.wistia.com/oembed',
                    patterns: [~/(?i)https?:\/\/(?:[^\/]+\.)?(?:wistia\.com|wi\.st)\/.*/]
            ],
            [
                    type: 'video',
                    name: 'Vimeo',
                    api: 'https://vimeo.com/api/oembed.json',
                    patterns: [
                            ~/(?i)https?:\/\/(?:www\.)?vimeo\.com\/.+/,
                            ~/(?i)https?:\/\/player\.vimeo\.com\/video\/.*/
                    ]
            ]
    ].asImmutable()

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

        PROVIDERS.find { provider ->
            provider.patterns.any { pattern -> pattern.matcher(url).matches() }
        }
    }
}
