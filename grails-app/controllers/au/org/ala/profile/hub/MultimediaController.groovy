package au.org.ala.profile.hub

import grails.converters.JSON

class MultimediaController extends BaseController {

    EmbedService embedService

    def describe() {
        if (!params.url) {
            badRequest 'url is a required parameter'
            return
        }

        Map description = embedService.describe(params.url as String)
        if (description.error) {
            render status: 400, text: ([error: description.error] as JSON)
        } else {
            render description as JSON
        }
    }
}
