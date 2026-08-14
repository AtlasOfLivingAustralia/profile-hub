package au.org.ala.profile.hub

import com.google.common.io.Resources

class ResourceController {

    String facets

    def facets() {
        if (!facets) {
            if (grailsApplication.config.getProperty('facets')) {
                facets = new File(grailsApplication.config.getProperty('facets')).text
            } else {
                facets = Resources.getResource('grouped_facets_ala.json').text
            }
        }

        response.contentType = 'application/json'
        render facets
    }
}
