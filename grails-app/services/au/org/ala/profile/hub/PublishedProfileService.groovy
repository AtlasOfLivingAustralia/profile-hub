package au.org.ala.profile.hub

import au.org.ala.ws.service.WebService
import org.apache.http.entity.ContentType
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.cache.annotation.Caching

import static au.org.ala.profile.hub.Utils.encPath
import static au.org.ala.profile.hub.util.HubConstants.DEFAULT_OPUS_BANNER_URL
import static au.org.ala.profile.hub.util.HubConstants.DEFAULT_OPUS_LOGOS
import static au.org.ala.profile.hub.util.HubConstants.DEFAULT_OPUS_TITLE

/**
 * Loads one shared published profile (opus, profile, logos, banner, title).
 * ProfileService decides whether a request may call this. The cached read uses
 * webService.get directly, with no user header and no florula params.
 */
class PublishedProfileService {

    static transactional = false

    static final String CACHE_NAME = "publishedProfiles"

    def grailsApplication
    WebService webService

    @Cacheable(cacheNames = CACHE_NAME, key = "#p0.concat('|').concat(#p1).concat('|').concat(#p2.toString())", sync = true)
    Map getPublishedProfile(String opusId, String profileId, boolean fullClassification) {
        try {
            String encodedProfileId = encPath(profileId)
            String serviceUrl = grailsApplication.config.getProperty('profile.service.url')
            def profile = webService.get("${serviceUrl}/opus/${encPath(opusId)}/profile/${encodedProfileId}?latest=false&fullClassification=${fullClassification}", [:], ContentType.APPLICATION_JSON, true, false, [:])?.resp

            if (!profile) {
                throw new UncacheableResultException(null)
            }

            ProfileService.injectBhlThumbnails(profile, grailsApplication.config.getProperty('biodiv.library.thumb.url') as String)

            def opus = webService.get("${serviceUrl}/opus/${encPath(opusId)}", [:], ContentType.APPLICATION_JSON, true, false, [:])?.resp
            Map model = toModel(opus, profile)
            if (opus?.privateCollection) {
                throw new UncacheableResultException(model)
            }
            return model
        } catch (UncacheableResultException e) {
            throw e
        } catch (FileNotFoundException e) {
            log.error("Profile ${profileId} not found")
            throw new UncacheableResultException(null)
        } catch (Exception e) {
            log.error("Failed to retrieve profile ${profileId}", e)
            throw new UncacheableResultException([error: "Failed to retrieve profile ${profileId} due to ${e.getMessage()}"])
        }
    }

    @Caching(evict = [
            @CacheEvict(cacheNames = CACHE_NAME, key = "#p0.concat('|').concat(#p1).concat('|true')"),
            @CacheEvict(cacheNames = CACHE_NAME, key = "#p0.concat('|').concat(#p1).concat('|false')")
    ])
    void evictPublishedProfile(String opusId, String profileId) {
    }

    static Map toModel(Map opus, profile) {
        [
                opus     : opus,
                profile  : profile,
                logos    : opus.brandingConfig?.logos ?: DEFAULT_OPUS_LOGOS,
                bannerUrl: opus.brandingConfig?.profileBannerUrl ?: DEFAULT_OPUS_BANNER_URL,
                pageTitle: opus.title ?: DEFAULT_OPUS_TITLE
        ]
    }
}
