package au.org.ala.profile.hub

import au.org.ala.profile.security.PrivateCollectionSecurityExempt
import grails.util.Environment

class StylesheetController {

    def profileService

    @PrivateCollectionSecurityExempt
    def opus() {
        def opusId = params.id
        def opus
        if (opusId) {
            opus = profileService.getOpus(opusId)
        } else {
            opus = null
        }

        def theme = opus?.theme

        def model = [
                mainBackgroundColour    : theme?.mainBackgroundColour ?: '#F8F8F8',
                mainTextColour          : theme?.mainTextColour ?: '#2E4453',
                callToActionHoverColour : theme?.callToActionHoverColour ?: '#005082',
                callToActionColour      : theme?.callToActionColour ?: '#0087BE',
                callToActionTextColour  : theme?.callToActionTextColour ?: '#0087BE',
                footerBackgroundColour  : theme?.footerBackgroundColour ?: '#F8F8F8',
                footerTextColour        : theme?.footerTextColour ?: '#2E4453',
                footerBorderColour      : theme?.footerBorderColour ?: '#0087BE',
                headerTextColour        : theme?.headerTextColour ?: '#2E4453',
                headerBorderColour      : theme?.headerBorderColour ?: '#0087BE'
        ]

        if (Environment.current == Environment.DEVELOPMENT) {
            header 'Cache-Control', 'no-cache, no-store, must-revalidate'
        } else {
            Calendar cal = new GregorianCalendar()
            cal.add(Calendar.DATE, 365)
            Date date = cal.getTime()
            header 'Cache-Control', 'public, max-age=31536000'
            response.setDateHeader('Expires', date.time)
            // override grails pragma header
            header 'Pragma', 'cache'
        }
        render(view: 'opus', contentType: 'text/css', model: model)
    }
}
