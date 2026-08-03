package au.org.ala.profile.hub

import grails.converters.JSON
import org.apache.http.HttpStatus


class BHLController extends BaseController {

    BiodiversityLibraryService biodiversityLibraryService

    def index() {}

    def pageLookup() {
        def titleMetadata = [:]

        if (params.pageId) {
            Integer itemId = biodiversityLibraryService.lookupPage(params.pageId as int)?.Result?.ItemID
            if (itemId) {
                Integer titleId = biodiversityLibraryService.lookupItem(itemId)?.Result?.PrimaryTitleID

                if (titleId) {
                    titleMetadata = biodiversityLibraryService.lookupTitle(titleId)
                    titleMetadata.thumbnailUrl = "${grailsApplication.config.getProperty('biodiv.library.thumb.url')}${params.pageId}"
                }
            }
        }

        if (titleMetadata) {
            response.setContentType("application/json")
            render titleMetadata as JSON
        } else {
            response.status = HttpStatus.SC_NOT_FOUND
            response.sendError(HttpStatus.SC_NOT_FOUND)
        }
    }
}
