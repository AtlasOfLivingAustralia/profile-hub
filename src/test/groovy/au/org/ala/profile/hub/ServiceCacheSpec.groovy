package au.org.ala.profile.hub

import au.org.ala.web.AuthService
import au.org.ala.ws.service.WebService
import org.apache.http.entity.ContentType
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.EnableCaching
import org.springframework.cache.concurrent.ConcurrentMapCacheManager
import org.springframework.context.annotation.AnnotationConfigApplicationContext
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import spock.lang.Specification

/**
 * Tiny Spring cache context (not a full Grails app) for public downstream reads
 * and published profiles.
 */
class ServiceCacheSpec extends Specification {

    static CountingWebService web
    static CountingWrapper wrapper
    static AuthService auth
    static def grailsApp

    AnnotationConfigApplicationContext context

    def setup() {
        web = new CountingWebService()
        wrapper = new CountingWrapper()
        auth = Stub(AuthService) {
            getUserId() >> null
        }
        grailsApp = new GrailsApplicationStub()
        context = new AnnotationConfigApplicationContext(CacheTestConfig)
    }

    def cleanup() {
        context?.close()
    }

    def "a second BIE lookup skips webService"() {
        given:
        web.speciesResponse = [statusCode: 200, resp: [scientificName: "Acacia"]]
        BieService bie = context.getBean(BieService)

        when:
        def first = bie.getSpeciesProfile("guid-1")
        def second = bie.getSpeciesProfile("guid-1")

        then:
        first.resp.scientificName == "Acacia"
        second.resp.scientificName == "Acacia"
        web.calls.count { it.url.contains("/ws/species/guid-1") } == 1
    }

    def "a failed BIE lookup is not stored"() {
        given:
        web.speciesResponse = [statusCode: 500, error: "bie down"]
        BieService bie = context.getBean(BieService)

        when:
        bie.getSpeciesProfile("guid-1")
        bie.getSpeciesProfile("guid-1")

        then:
        web.calls.count { it.url.contains("/ws/species/guid-1") } == 2
    }

    def "a failed collectory lookup is not stored and a success is"() {
        given:
        DownstreamGetCacheService cache = context.getBean(DownstreamGetCacheService)
        web.simpleResponse = [statusCode: 500, error: "collectory down"]

        when:
        DownstreamGetCacheService.unwrap { cache.collectoryResources("http://collectory/ws/dataResource") }
        DownstreamGetCacheService.unwrap { cache.collectoryResources("http://collectory/ws/dataResource") }

        then:
        web.calls.count { it.url == "http://collectory/ws/dataResource" } == 2

        when:
        web.calls.clear()
        web.simpleResponse = [statusCode: 200, resp: [[uid: "dr1", name: "Resource"]]]
        def first = cache.collectoryResources("http://collectory/ws/dataResource")
        def second = cache.collectoryResources("http://collectory/ws/dataResource")

        then:
        first.resp[0].uid == "dr1"
        second.resp[0].uid == "dr1"
        web.calls.count { it.url == "http://collectory/ws/dataResource" } == 1
    }

    def "a failed BHL lookup is not stored"() {
        given:
        DownstreamGetCacheService cache = context.getBean(DownstreamGetCacheService)
        web.simpleResponse = [statusCode: 502, error: "bhl down"]

        when:
        DownstreamGetCacheService.unwrap { cache.bhlMetadata("http://bhl/page/1") }
        DownstreamGetCacheService.unwrap { cache.bhlMetadata("http://bhl/page/1") }

        then:
        web.calls.count { it.url == "http://bhl/page/1" } == 2
        web.calls.every { !it.includeApiKey && !it.includeUser }
    }

    def "a second published profile lookup skips webService"() {
        given:
        ProfileService profiles = profiles()

        when:
        Map first = profiles.getProfile("opus1", "p1", false, false)
        int profileCalls = profileHits()
        int opusCalls = opusHits()
        Map second = profiles.getProfile("opus1", "p1", false, false)

        then:
        first.profile.scientificName == "Published"
        second.is(first)
        profileHits() == profileCalls
        opusHits() == opusCalls
        profileHits() == 1
        wrapper.calls.count { it.url.contains("/opus/") && !it.url.contains("/profile/") } == 2
        def profileCall = web.calls.find { it.url.contains("/profile/") }
        profileCall.url.contains("latest=false")
        profileCall.url.contains("fullClassification=false")
        profileCall.includeUser == false
        profileCall.headers == [:]
        profileCall.params == [:]
        first.logos == ["logo"]
        first.bannerUrl == "http://banner"
        first.pageTitle == "Opus"
        first.profile.bhl[0].thumbnailUrl == "http://thumb/99"
        !first.containsKey("mapSnapshot")
        publishedCache().nativeCache.keySet() == ["opus1|p1|false"] as Set
    }

    def "draft profile lookups are not stored"() {
        given:
        ProfileService profiles = profiles()
        wrapper.profile = [uuid: "p1", scientificName: "Draft", bhl: []]

        when:
        Map first = profiles.getProfile("opus1", "p1", true, false)
        Map second = profiles.getProfile("opus1", "p1", true, false)

        then:
        first.profile.scientificName == "Draft"
        second.profile.scientificName == "Draft"
        !first.is(second)
        profileHits() == 0
        wrapper.calls.count { it.url.contains("/profile/") } == 2
        publishedCache().nativeCache.isEmpty()
    }

    def "private collections are not stored"() {
        given:
        ProfileService profiles = profiles()
        wrapper.opus = privateOpus()

        when:
        Map first = profiles.getProfile("opus1", "p1", false, false)
        Map second = profiles.getProfile("opus1", "p1", false, false)

        then:
        first.profile.scientificName == "Wrapper published"
        second.profile.scientificName == "Wrapper published"
        profileHits() == 0
        wrapper.calls.count { it.url.contains("/profile/") } == 2
        publishedCache().nativeCache.isEmpty()
    }

    def "a private opus response from the cached loader is not stored"() {
        given:
        PublishedProfileService published = context.getBean(PublishedProfileService)
        web.opus = privateOpus()

        when:
        Map first = DownstreamGetCacheService.unwrap { published.getPublishedProfile("opus1", "p1", false) } as Map
        Map second = DownstreamGetCacheService.unwrap { published.getPublishedProfile("opus1", "p1", false) } as Map

        then:
        first.opus.privateCollection == true
        second.opus.privateCollection == true
        !first.is(second)
        profileHits() == 2
        publishedCache().nativeCache.isEmpty()
    }

    def "a missing published profile is not stored"() {
        given:
        PublishedProfileService published = context.getBean(PublishedProfileService)
        web.profile = null

        when:
        def first = DownstreamGetCacheService.unwrap { published.getPublishedProfile("opus1", "p1", false) }
        def second = DownstreamGetCacheService.unwrap { published.getPublishedProfile("opus1", "p1", false) }

        then:
        first == null
        second == null
        profileHits() == 2
        publishedCache().nativeCache.isEmpty()
    }

    def "publishing and non-draft updates evict both classification keys"() {
        given:
        ProfileService profiles = profiles()

        when:
        profiles.getProfile("opus1", "p1", false, false)
        profiles.getProfile("opus1", "p1", false, true)

        then:
        publishedCache().nativeCache.keySet() == ["opus1|p1|false", "opus1|p1|true"] as Set

        when:
        profiles.toggleDraftMode("opus1", "p1", false)

        then:
        publishedCache().nativeCache.size() == 2

        when:
        profiles.updateProfile("opus1", "p1", [name: "draft"], true)

        then:
        publishedCache().nativeCache.size() == 2

        when:
        int before = profileHits()
        profiles.toggleDraftMode("opus1", "p1", true)

        then:
        publishedCache().nativeCache.isEmpty()

        when:
        profiles.getProfile("opus1", "p1", false, false)
        profiles.getProfile("opus1", "p1", false, true)

        then:
        profileHits() == before + 2

        when:
        profiles.updateProfile("opus1", "p1", [name: "published"], false)

        then:
        publishedCache().nativeCache.isEmpty()
    }

    def "a second public image page skips image assembly and a failure is not stored"() {
        given:
        PublicImagePageService pages = context.getBean(PublicImagePageService)
        CountingImagePages images = context.getBean(CountingImagePages)

        when:
        Map first = pages.page("opus1", "p1", "lsid:guid", 1, 0)
        Map second = pages.page("opus1", "p1", "lsid:guid", 1, 0)

        then:
        first.resp.images[0].imageId == "img-1"
        second.is(first)
        images.calls == 1
        context.getBean(CacheManager).getCache("publicImagePages").get("opus1|p1|lsid:guid|1|0")?.get() == first

        when:
        images.fail = true
        DownstreamGetCacheService.unwrap { pages.page("opus1", "p1", "lsid:other", 1, 0) }
        DownstreamGetCacheService.unwrap { pages.page("opus1", "p1", "lsid:other", 1, 0) }

        then:
        images.calls == 3
        context.getBean(CacheManager).getCache("publicImagePages").get("opus1|p1|lsid:other|1|0") == null
    }

    def "a collection florula list skips the published profile cache"() {
        given:
        ProfileService profiles = profiles()
        wrapper.opus = wrapper.opus + [florulaListId: "dr1"]

        when:
        profiles.getProfile("opus1", "p1", false, false)
        profiles.getProfile("opus1", "p1", false, false)

        then:
        publishedCache().nativeCache.isEmpty()
        wrapper.calls.count { it.url.contains("/profile/") } == 2
    }

    def "published profile sharing follows the public collection and ignores private collections"() {
        given:
        ProfileService profiles = profiles()

        expect:
        profiles.canServePublishedProfile("opus1")

        when:
        wrapper.opus = privateOpus()

        then:
        !profiles.canServePublishedProfile("opus1")
    }

    def "delete, archive, restore, and rename evict the published profile"() {
        given:
        ProfileService profiles = profiles()
        profiles.getProfile("opus1", "p1", false, false)
        profiles.getProfile("opus1", "p1", false, true)
        assert publishedCache().nativeCache.size() == 2

        when:
        action(profiles)

        then:
        publishedCache().nativeCache.isEmpty()

        where:
        action << [
                { ProfileService service -> service.deleteProfile("opus1", "p1") },
                { ProfileService service -> service.archiveProfile("opus1", "p1", "gone") },
                { ProfileService service -> service.restoreArchivedProfile("opus1", "p1", null) },
                { ProfileService service -> service.renameProfile("opus1", "p1", [scientificName: "New"]) }
        ]
    }

    private ProfileService profiles() {
        context.getBean(ProfileService)
    }

    private publishedCache() {
        context.getBean(CacheManager).getCache("publishedProfiles")
    }

    private int profileHits() {
        web.calls.count { it.url.contains("/profile/") }
    }

    private int opusHits() {
        web.calls.count { it.url.contains("/opus/") && !it.url.contains("/profile/") }
    }

    private static Map privateOpus() {
        [uuid: "opus1", title: "Private", privateCollection: true, brandingConfig: [logos: ["logo"], profileBannerUrl: "http://banner"]]
    }

    @Configuration
    @EnableCaching(proxyTargetClass = true)
    static class CacheTestConfig {
        @Bean
        CacheManager cacheManager() {
            new ConcurrentMapCacheManager()
        }

        @Bean
        BieService bieService(DownstreamGetCacheService downstreamGetCacheService) {
            def service = new BieService()
            service.downstreamGetCacheService = downstreamGetCacheService
            service.grailsApplication = grailsApp
            service
        }

        @Bean
        DownstreamGetCacheService downstreamGetCacheService() {
            def service = new DownstreamGetCacheService()
            service.webService = web
            service
        }

        @Bean
        PublishedProfileService publishedProfileService() {
            def service = new PublishedProfileService()
            service.webService = web
            service.grailsApplication = grailsApp
            service
        }

        @Bean
        CountingImagePages countingImagePages() {
            new CountingImagePages()
        }

        @Bean
        PublicImagePageService publicImagePageService(CountingImagePages countingImagePages) {
            def service = new PublicImagePageService()
            service.imageService = countingImagePages
            service
        }

        @Bean
        ProfileService profileService(PublishedProfileService publishedProfileService) {
            def service = new ProfileService()
            service.publishedProfileService = publishedProfileService
            service.webService = web
            service.webServiceWrapperService = wrapper
            service.grailsApplication = grailsApp
            service.authService = auth
            service
        }
    }

    static class GrailsApplicationStub {
        def config = new ConfigStub()
    }

    static class ConfigStub {
        String getProperty(String name) {
            switch (name) {
                case "profile.service.url": return "http://profile.service"
                case "bie.ws.url": return "http://bie.service"
                case "biodiv.library.thumb.url": return "http://thumb/"
                case "collectory.base.url": return "http://collectory"
                default: return null
            }
        }
    }
}

class CountingImagePages extends ImageService {
    int calls = 0
    boolean fail = false

    @Override
    def retrieveImagesPaged(String opusId, String profileId, boolean latest, String searchIdentifier, boolean useInternalPaths = false, boolean readonlyView = true, int pageSize, int startIndex, boolean bypassCache = false) {
        calls++
        if (fail) {
            return [statusCode: 500, resp: null]
        }
        [statusCode: 200, resp: [images: [[imageId: "img-1"]], count: 1]]
    }
}

class CountingWebService extends WebService {
    List<Map> calls = []
    def speciesResponse = [statusCode: 200, resp: [scientificName: "Acacia"]]
    def simpleResponse = [statusCode: 200, resp: [ok: true]]
    def profile = [uuid: "p1", scientificName: "Published", bhl: [[url: "http://www.biodiversitylibrary.org/page/99"]]]
    Map opus = [uuid: "opus1", title: "Opus", privateCollection: false, brandingConfig: [logos: ["logo"], profileBannerUrl: "http://banner"]]

    @Override
    Map get(String url, Map params = [:], ContentType contentType = ContentType.APPLICATION_JSON, boolean includeApiKey = true, boolean includeUser = true, Map customHeaders = [:]) {
        calls << [url: url, params: params, includeApiKey: includeApiKey, includeUser: includeUser, headers: customHeaders]
        if (url?.contains("/ws/species/")) {
            return speciesResponse
        }
        if (url?.contains("/profile/")) {
            return profile == null ? [statusCode: 404, error: "missing"] : [statusCode: 200, resp: profile]
        }
        if (url?.contains("/opus/")) {
            return [statusCode: 200, resp: opus]
        }
        return simpleResponse
    }

    @Override
    Map post(String url, Object body, Map params = [:], ContentType contentType = ContentType.APPLICATION_JSON, boolean includeApiKey = true, boolean includeUser = true, Map customHeaders = [:]) {
        [statusCode: 200, resp: [:]]
    }

    @Override
    Map delete(String url, Map params = [:], ContentType contentType = ContentType.APPLICATION_JSON, boolean includeApiKey = true, boolean includeUser = true, Map customHeaders = [:]) {
        [statusCode: 200, resp: [:]]
    }
}

class CountingWrapper extends WebServiceWrapperService {
    List<Map> calls = []
    def profile = [uuid: "p1", scientificName: "Wrapper published", bhl: []]
    Map opus = [uuid: "opus1", title: "Opus", privateCollection: false, brandingConfig: [logos: ["logo"], profileBannerUrl: "http://banner"]]

    @Override
    Map get(String url, Map params = [:], ContentType contentType = ContentType.APPLICATION_JSON, boolean includeApiKey = true, boolean includeUser = true, Map customHeaders = [:]) {
        calls << [url: url, params: params, headers: customHeaders]
        if (url?.contains("/profile/")) {
            return [statusCode: 200, resp: profile]
        }
        return [statusCode: 200, resp: opus]
    }
}
