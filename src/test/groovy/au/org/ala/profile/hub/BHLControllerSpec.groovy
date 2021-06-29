package au.org.ala.profile.hub


import grails.testing.web.controllers.ControllerUnitTest
import org.apache.http.HttpStatus
import spock.lang.Specification

class BHLControllerSpec extends Specification implements ControllerUnitTest<BHLController> {

    BHLController controller

    def "pageLookup takes a page id and retrieves a title from the biodiversity library"() {
        setup:
        controller = new BHLController()
        BiodiversityLibraryService mockLibrary = Mock(BiodiversityLibraryService)
        controller.biodiversityLibraryService = mockLibrary

        when:
        params.pageId = 1
        controller.pageLookup()

        then:
        // this is a 3-step process:
        // 1. Retrieve the page metadata from the library
        // 2. Take the itemId from the page metadata and fetch the item metadata
        // 3. Take the titleId from the item metadata and fetch the title metadata
        1 * mockLibrary.lookupPage(1) >> [Result: [ItemID: 2]]
        1 * mockLibrary.lookupItem(2) >> [Result: [PrimaryTitleID: 3]]
        1 * mockLibrary.lookupTitle(3) >> [text: "titleText"]
        assert response.json.text == "titleText"
    }

    def "pageLookup should add a 'thumbnailUrl' attribute to the response"() {
        setup:
        controller = new BHLController()
        BiodiversityLibraryService mockLibrary = Mock(BiodiversityLibraryService)
        controller.biodiversityLibraryService = mockLibrary
        grailsApplication.config.biodiv.library.thumb.url = "biodiv.heritage.thumb.url/"

        when:
        params.pageId = 1
        controller.pageLookup()

        then:
        // this is a 3-step process:
        // 1. Retrieve the page metadata from the library
        // 2. Take the itemId from the page metadata and fetch the item metadata
        // 3. Take the titleId from the item metadata and fetch the title metadata
        1 * mockLibrary.lookupPage(1) >> [Result: [ItemID: 2]]
        1 * mockLibrary.lookupItem(2) >> [Result: [PrimaryTitleID: 3]]
        1 * mockLibrary.lookupTitle(3) >> [text: "titleText"]
        assert response.json.thumbnailUrl == "biodiv.heritage.thumb.url/1"
    }

    def "pageLookup should return a HTTP 404 if the library service returns a null or blank"() {
        setup:
        controller = new BHLController()
        BiodiversityLibraryService mockLibrary = Mock(BiodiversityLibraryService)
        controller.biodiversityLibraryService = mockLibrary

        when:
        params.pageId = 1
        controller.pageLookup()

        then:
        // this is a 3-step process:
        // 1. Retrieve the page metadata from the library
        // 2. Take the itemId from the page metadata and fetch the item metadata
        // 3. Take the titleId from the item metadata and fetch the title metadata
        // Step 3 should not be invoked if step 2 returns null (or blank)
        1 * mockLibrary.lookupPage(1) >> [Result: [ItemID: 2]]
        1 * mockLibrary.lookupItem(2) >> null
        0 * mockLibrary.lookupTitle(3) >> [text: "titleText"]
        assert response.status == HttpStatus.SC_NOT_FOUND
    }
}
