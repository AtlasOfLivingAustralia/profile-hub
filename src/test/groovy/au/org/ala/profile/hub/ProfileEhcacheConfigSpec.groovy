package au.org.ala.profile.hub

import groovy.xml.XmlSlurper
import org.ehcache.config.ResourceType
import org.ehcache.xml.XmlConfiguration
import spock.lang.Specification

import java.time.Duration

class ProfileEhcacheConfigSpec extends Specification {

    static final List<String> PUBLIC_ALIASES = [
            "collectoryResources",
            "collectoryHubs",
            "collectoryLicences",
            "bieSpecies",
            "nslNames",
            "nslConcepts",
            "speciesLists",
            "speciesListsByGuid",
            "keybaseProjects",
            "keybaseTaxon",
            "bhlMetadata",
            "publishedProfiles",
            "publicImagePages"
    ]

    def "profile-ehcache.xml defines the public aliases and a 1 day publishedProfiles cache"() {
        given:
        File file = new File("grails-app/conf/profile-ehcache.xml")
        def xml = new XmlSlurper().parse(file)
        def aliases = xml.cache.collect { it.@alias.text() }

        expect:
        aliases.containsAll(PUBLIC_ALIASES)
        aliases.containsAll(["userDetailsCache", "userDetailsByIdCache", "userListCache", "vocabListCache"])

        ttl(xml, "collectoryResources") == [6, "hours"]
        ttl(xml, "collectoryHubs") == [6, "hours"]
        ttl(xml, "collectoryLicences") == [1, "days"]
        ttl(xml, "bieSpecies") == [1, "hours"]
        ttl(xml, "nslNames") == [1, "days"]
        ttl(xml, "nslConcepts") == [1, "days"]
        ttl(xml, "speciesLists") == [30, "minutes"]
        ttl(xml, "speciesListsByGuid") == [30, "minutes"]
        ttl(xml, "keybaseProjects") == [1, "hours"]
        ttl(xml, "keybaseTaxon") == [1, "hours"]
        ttl(xml, "bhlMetadata") == [1, "days"]
        ttl(xml, "publishedProfiles") == [1, "days"]
        heap(xml, "publishedProfiles") == [2000, "entries"]
        ttl(xml, "publicImagePages") == [1, "days"]
        heap(xml, "publicImagePages") == [2000, "entries"]

        PUBLIC_ALIASES.every { alias ->
            def resources = xml.cache.find { it.@alias.text() == alias }.resources
            resources.disk.size() == 0
            resources.heap.size() == 1
        }

        and: "Ehcache accepts the file and publishedProfiles expires after 1 day"
        def configuration = new XmlConfiguration(file.toURI().toURL())
        assert configuration.cacheConfigurations.keySet().containsAll(PUBLIC_ALIASES)
        def published = configuration.cacheConfigurations.publishedProfiles
        published.expiryPolicy.getExpiryForCreation("opus|profile|false", "value") == Duration.ofDays(1)
        published.resourcePools.getPoolForResource(ResourceType.Core.HEAP).size == 2000
        !published.resourcePools.resourceTypeSet.contains(ResourceType.Core.DISK)
        def imagePages = configuration.cacheConfigurations.publicImagePages
        imagePages.expiryPolicy.getExpiryForCreation("opus|profile|lsid|1|0", "value") == Duration.ofDays(1)
        imagePages.resourcePools.getPoolForResource(ResourceType.Core.HEAP).size == 2000
    }

    private static List ttl(xml, String alias) {
        def expiry = xml.cache.find { it.@alias.text() == alias }.expiry.ttl
        [expiry.text().toInteger(), expiry.@unit.text()]
    }

    private static List heap(xml, String alias) {
        def heap = xml.cache.find { it.@alias.text() == alias }.resources.heap
        [heap.text().toInteger(), heap.@unit.text()]
    }
}
