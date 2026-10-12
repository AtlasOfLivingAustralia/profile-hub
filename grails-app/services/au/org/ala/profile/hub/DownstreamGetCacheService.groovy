package au.org.ala.profile.hub

import au.org.ala.ws.service.WebService
import org.apache.http.entity.ContentType
import org.springframework.cache.annotation.Cacheable

/**
 * Caches successful public downstream GETs.
 *
 * Callers use this bean so the Spring cache proxy runs. A self-call inside the
 * service that handles the response would skip it. {@code sync = true} cannot be
 * combined with {@code unless}, so a failed GET is thrown and not stored. Callers
 * turn that into the same empty or error result they returned before.
 */
class DownstreamGetCacheService {

    static transactional = false

    WebService webService

    @Cacheable(cacheNames = "collectoryResources", sync = true)
    Map collectoryResources(String url) {
        cacheableGet(url)
    }

    @Cacheable(cacheNames = "collectoryHubs", sync = true)
    Map collectoryHubs(String url) {
        cacheableGet(url)
    }

    @Cacheable(cacheNames = "collectoryLicences", sync = true)
    Map collectoryLicences(String url) {
        cacheableGet(url)
    }

    @Cacheable(cacheNames = "bieSpecies", sync = true)
    Map bieSpecies(String url) {
        cacheableGet(url)
    }

    @Cacheable(cacheNames = "nslNames", sync = true)
    Map nslName(String url) {
        cacheableGet(url, false, false)
    }

    @Cacheable(cacheNames = "nslConcepts", sync = true)
    Map nslConcepts(String url) {
        cacheableGet(url, false, false)
    }

    @Cacheable(cacheNames = "speciesLists", sync = true)
    Map speciesLists(String url) {
        cacheableGet(url)
    }

    @Cacheable(cacheNames = "speciesListsByGuid", sync = true)
    Map speciesListsByGuid(String url) {
        cacheableGet(url)
    }

    @Cacheable(cacheNames = "keybaseProjects", sync = true)
    Map keybaseProjects(String url) {
        cacheableGet(url, false, false)
    }

    @Cacheable(cacheNames = "keybaseTaxon", sync = true)
    Map keybaseTaxon(String url) {
        cacheableGet(url, false, false)
    }

    @Cacheable(cacheNames = "bhlMetadata", sync = true)
    Map bhlMetadata(String url) {
        cacheableGet(url, false, false)
    }

    static Object unwrap(Closure call) {
        try {
            return call()
        } catch (UncacheableResultException e) {
            return e.result
        }
    }

    private Map cacheableGet(String url, boolean includeApiKey = true, boolean includeUser = true) {
        Map result = includeApiKey && includeUser ?
                webService.get(url) :
                webService.get(url, [:], ContentType.APPLICATION_JSON, includeApiKey, includeUser)
        if (uncacheable(result)) {
            throw new UncacheableResultException(result)
        }
        result
    }

    private static boolean uncacheable(Map result) {
        if (result == null) {
            return true
        }
        if (result.error) {
            return true
        }
        def status = result.statusCode
        return status instanceof Number && status.intValue() >= 400
    }
}

class UncacheableResultException extends RuntimeException {
    final Object result

    UncacheableResultException(Object result) {
        this.result = result
    }

    @Override
    synchronized Throwable fillInStackTrace() {
        this
    }
}
