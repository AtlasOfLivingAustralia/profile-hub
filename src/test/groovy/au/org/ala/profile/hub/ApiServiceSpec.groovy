package au.org.ala.profile.hub

import au.org.ala.profile.api.ApiService
import au.org.ala.ws.service.WebService
import au.org.ala.web.AuthService
import grails.testing.services.ServiceUnitTest
import org.grails.web.mapping.DefaultLinkGenerator
import org.grails.web.mapping.UrlMappingsHolderFactoryBean
import spock.lang.Specification

class ApiServiceSpec extends Specification implements ServiceUnitTest<ApiService>{
    def profileService
    def webServiceWrapperService
    def webService
    def setup() {
        grailsApplication.config.profile.service.url = ""
    }

    void "getProfiles should get all profiles from collection if taxonRank and taxonName is not present"() {
        setup:
        defineBeans {
            grailsUrlMappingsHolder(UrlMappingsHolderFactoryBean) {
                getDelegate().grailsApplication = grailsApplication
            }
            grailsLinkGenerator(DefaultLinkGenerator, "")
            profileService(ProfileService)
            authService(AuthService)
        }

        webService = service.profileService.webService = Mock(WebService)
        webServiceWrapperService = service.profileService.webServiceWrapperService = Mock(WebServiceWrapperService)
        service.profileService.grailsApplication = grailsApplication
        service.profileService.authService = grailsApplication.getMainContext().getBean("authService")

        when:
        1 * webService.get("/opus/opus1/profile/?startIndex=1&pageSize=20&sort=abc&order=desc&rankFilter=abc", _, _, _, _, _) >> [resp: [], statusCode: 200]
        def result = service.getProfiles('opus1','1', '20', 'abc', 'desc', '', '', 'abc')

        then:
        result.resp.size() == 0
        result.statusCode == 200

        when:
        1 * webServiceWrapperService.get("/profile/search/taxon/nameAndTotal?opusId=opus1&scientificName=plantae&taxon=kingdom&max=20&offset=1&sortBy=abc&immediateChildrenOnly=false&includeTaxon=true&rankFilter=abc", _, _, _, _, _) >> [resp: [], statusCode: 200]
        result = service.getProfiles('opus1','1', '20', 'abc', 'desc', 'plantae', 'kingdom', 'abc')

        then:
        result.resp.size() == 0
        result.statusCode == 200
    }

    void "retrieveImagesPaged should return images only if opus id is valid" () {
        setup:
        defineBeans{
            grailsUrlMappingsHolder(UrlMappingsHolderFactoryBean) {
                getDelegate().grailsApplication = grailsApplication
            }
            grailsLinkGenerator(DefaultLinkGenerator, "")
            authService(AuthService)
        }

        service.profileService = Mock(ProfileService)
        service.profileService.authService = grailsApplication.getMainContext().getBean("authService")
        service.imageService = Mock(ImageService)

        when:
        def result = service.retrieveImagesPaged('opus1', 'profile1', 20, 1)

        then:
        1 * service.profileService.getProfile('opus1', 'profile1', false, false) >> [:]

        when:
        result = service.retrieveImagesPaged('opus1', 'profile1', 20, 1)

        then:
        1 * service.profileService.getProfile('opus1', 'profile1', false, false) >> [opus: [uuid: 'abc'], profile: [uuid: '123']]
        1 * service.imageService.retrieveImagesPaged('opus1', 'profile1', false,"", false, true, 20, 1) >> [statusCode: 200, resp      : [:]]
        result.statusCode == 200
    }

    void "getAttributes should only return asked attributes" () {
        setup:
        defineBeans {
            grailsUrlMappingsHolder(UrlMappingsHolderFactoryBean) {
                getDelegate().grailsApplication = grailsApplication
            }
            grailsLinkGenerator(DefaultLinkGenerator, "")
            authService(AuthService)
        }

        when:
        def result = service.getAttributes([attributes: [[uuid: 'abc'], [title: 'name1'], [title: 'name2']]], [])

        then:
        result.size() == 0

        when:
        result = service.getAttributes([attributes: [[uuid: 'abc'], [title: 'name1'], [title: 'name2']]], ['Name2', 'abc'])

        then:
        result.size() == 2
        result.get(0).uuid == 'abc'
        result.get(1).title == 'name2'
    }
}
