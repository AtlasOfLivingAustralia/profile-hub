package au.org.ala.profile.hub


import static au.org.ala.profile.hub.Utils.encFragment
import static au.org.ala.profile.hub.Utils.encPath
import static au.org.ala.profile.hub.util.HubConstants.*

class BaseController extends BasicWSController {

    def handle (resp) {
        handleWSResponse resp
    }

    def enabled(feature) {
        return !grailsApplication.config.feature[feature] || grailsApplication.config.feature[feature].toBoolean()
    }

    protected getBannerItems(opus, doMainBanner = false, isProfile = false) {
        def model = [
                doMainBanner  : doMainBanner,
                overlayText   : opus?.opusLayoutConfig?.bannerOverlayText,
                uuid          : UUID.randomUUID().toString()
        ]

        if (doMainBanner) {
            def images = opus?.opusLayoutConfig?.images ?: []
            def displayDuration = opus?.opusLayoutConfig?.duration ?: 5000
            def fadeDuration = 1000
            def numberOfImages = images.size()
            def totalDuration = (displayDuration + fadeDuration) * numberOfImages
            def keyframes
            if (numberOfImages != 0) {
                keyframes = [
                        [opacity: 1.0d, offset: 0.0d, easing: 'linear'],
                        [opacity: 1.0d, offset: displayDuration / totalDuration, easing: 'linear'],
                        [opacity: 0.0d, offset: 1.0d / numberOfImages, easing: 'ease-in-out'],
                        [opacity: 0.0d, offset: 1.0d - fadeDuration / totalDuration, easing: 'linear'],
                        [opacity: 1.0d, offset: 1.0d, easing: 'ease-in-out']
                ]
            } else {
                keyframes = []
            }
            model << [ banners: images,
                       minHeight: '275px',
                       displayDuration: displayDuration,
                       fadeDuration: fadeDuration,
                       totalDuration: totalDuration,
                       keyframes: keyframes
            ]
        } else if (isProfile) {
            model << [
                    banners: [
                            [ imageUrl : opus?.brandingConfig?.profileBannerUrl ?:
                                    opus?.brandingConfig?.opusBannerUrl ?:
                                            DEFAULT_OPUS_BANNER_URL
                            ]
                    ],
                    minHeight: ''
            ]
        } else {
            model << [
                    banners: [
                            [ imageUrl: opus?.brandingConfig?.opusBannerUrl ?:
                                    opus?.brandingConfig?.profileBannerUrl ?:
                                            DEFAULT_OPUS_BANNER_URL
                            ]
                    ],
                    minHeight: ''
            ]
        }

        return model
    }

    protected getSearchUrl(opus) {
        "${request.contextPath}/opus/${encPath(opus.shortName ? opus.shortName : opus.uuid)}/search"
    }

    protected getBrowseUrl(opus) {
        "${request.contextPath}/opus/${encPath(opus.shortName ? opus.shortName : opus.uuid)}/browse"
    }

    protected getFilterUrl(opus) {
        "${request.contextPath}/opus/${encPath(opus.shortName ? opus.shortName : opus.uuid)}/filter"
    }

    protected getIdentifyUrl(opus) {
        if(opus.keybaseProjectId != null && opus.keybaseProjectId != ""){
            "${request.contextPath}/opus/${encPath(opus.shortName ? opus.shortName : opus.uuid)}/identify"
        }
    }

    protected getDocumentsUrl(opus) {
        "${request.contextPath}/opus/${encPath(opus.shortName ? opus.shortName : opus.uuid)}/documents"
    }

    protected getReportsUrl(opus) {
        if(params.isOpusAdmin || params.isAlaAdmin){
            "${request.contextPath}/opus/${encPath(opus.shortName ? opus.shortName : opus.uuid)}/reports"
        }
    }

    protected getGlossaryUrl(opus) {
        opus.glossaryUuid ? "${request.contextPath}/opus/${encPath(opus.shortName ? opus.shortName : opus.uuid)}/glossary" : ""
    }

    protected getAboutUrl(opus) {
        "${request.contextPath}/opus/${encPath(opus.shortName ? opus.shortName : opus.uuid)}/about"
    }

    protected getAboutUrl(opus, profile) {
        "${request.contextPath}/opus/${encPath(opus.shortName ? opus.shortName : opus.uuid)}/about#?profile=${encFragment(profile.scientificName)}"
    }

    protected getOpusUrl(opus) {
        if(opus){
            g.createLink(uri: "/opus/${encPath(opus.shortName ?: opus.uuid)}", absolute: true)
        }
    }

    protected getProfileUrl(opus, profile) {
        if(opus && profile){
            g.createLink(uri: "/opus/${encPath(opus.shortName ?: opus.uuid)}/profile/${encPath(profile.scientificName)}", absolute: true)
        }
    }
}
