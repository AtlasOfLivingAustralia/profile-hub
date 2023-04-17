package au.org.ala.profile.hub

import au.org.ala.profile.analytics.GoogleAnalyticsClient

import static grails.async.Promises.task

class AnalyticsService {

    static transactional = false

    def grailsApplication
    GoogleAnalyticsClient googleAnalyticsClient

    /**
     * Asynchronously send a page view to the analytics end point.
     * @param hostname The hostname of the page view
     * @param path The path of the page view
     * @param clientId The client id of the page view
     * @param userIp The originating ip of the page view
     * @param userAgent The user agent for the page view
     * @param referrer The 'referer' for the page view
     */
    void pageView(String hostname, String path, String clientId, String userIp, String userAgent, String referrer, Map payload = [:]) {
        final String googleAnalyticsId = grailsApplication.config.googleAnalyticsId
        if (googleAnalyticsId) {
            task {
                final data = [
                        dh : hostname,         // Document hostname.
                        dp : path,             // Page.
                        uip: userIp,           // User IP
                        ua : userAgent ?: '',  // User Agent
                        dr : referrer ?: '',   // Document referrer
                ] + payload
                final call = googleAnalyticsClient.collect('1', googleAnalyticsId, clientId, 'pageview', data)
                try {
                    final resp = call.execute()
                    if (!resp.successful) {
                        log.warn("Analytics pageview for $clientId with data: $data failed")
                    }
                } catch(e) {
                    log.error("Caught exception while sending pageview to analytics", e)
                }
            }
        }
    }

}
