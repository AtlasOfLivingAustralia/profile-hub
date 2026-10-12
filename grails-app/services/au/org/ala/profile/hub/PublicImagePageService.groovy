package au.org.ala.profile.hub

import org.springframework.cache.annotation.Cacheable

import static org.apache.http.HttpStatus.SC_OK

/**
 * Caches one public readonly image page. ImageService decides whether a request
 * may call this, then this bean loads the page with the cache bypassed so the
 * call does not recurse. Draft, private, and florula views never reach here.
 */
class PublicImagePageService {

    static transactional = false

    static final String CACHE_NAME = "publicImagePages"

    ImageService imageService

    @Cacheable(cacheNames = CACHE_NAME, key = "#p0.concat('|').concat(#p1).concat('|').concat(#p2).concat('|').concat(#p3.toString()).concat('|').concat(#p4.toString())", sync = true)
    Map page(String opusId, String profileId, String searchIdentifier, int pageSize, int startIndex) {
        Map response = imageService.retrieveImagesPaged(opusId, profileId, false, searchIdentifier, false, true, pageSize, startIndex, true) as Map
        if (response?.statusCode != SC_OK || response?.resp == null) {
            throw new UncacheableResultException(response)
        }
        response
    }
}
