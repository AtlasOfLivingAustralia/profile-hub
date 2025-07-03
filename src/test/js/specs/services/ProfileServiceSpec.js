/**
 * The primary purpose of these tests is to ensure that the correct urls are being constructed based on the provided parameters.
 */
describe("ProfileService tests", function () {
    var service;
    var http;
    var mockUtil = {
        contextRoot: function () {
            return "/someContext"
        },
        toStandardPromise: function() {
            return {then: function() {}};
        },
        isUuid: function() {
            return true;
        }
    };

    beforeAll(function () {
        console.log("****** Profile Service Tests ******")
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(function () {
        module("profileEditor", function ($provide) {
            $provide.value("util", mockUtil);
        });
    });

    beforeEach(inject(function (_profileService_, _$httpBackend_) {
        service = _profileService_;
        http = _$httpBackend_;
    }));

    afterEach(function () {
        http.flush();
        http.verifyNoOutstandingExpectation();
        http.verifyNoOutstandingRequest();
    });

    it("should invoke the get profile as json service on the context root when getProfile is called", function () {
        service.getProfile("opusId1", "profileId1");

        http.expectGET("/someContext/opus/opusId1/profile/profileId1/json?fullClassification=true").respond("bla");
    });

    it("should invoke the delete profile service on the context root when deleteProfile is called", function () {
        service.deleteProfile("opusId", "profileId");

        http.expectDELETE("/someContext/opus/opusId/profile/profileId/delete").respond("bla");
    });

    it("should invoke the createProfile service on the context root when createProfile is called", function() {
        service.createProfile("opusId", "scientificName");

        http.expectPUT("/someContext/opus/opusId/profile/create", {opusId: "opusId", scientificName: "scientificName"}).respond("bla");
    });

    it("should invoke the updateProfile service on the context root when udateProfile is called", function() {
        var data = {primaryImage: "one"};
        service.updateProfile("opusId", "profileId", data);

        http.expectPOST("/someContext/opus/opusId/profile/profileId/update", data).respond("bla");
    });

    it("should invoke the get opus as json service on the context root when getOpus is called", function () {
        service.getOpus("opusId");

        http.expectGET("/someContext/opus/opusId/json").respond("bla");
    });

    it("should invoke the list opus service on the context root when listOpus is called", function() {
        service.listOpus();

        http.expectGET("/someContext/opus/list").respond("bla");
    });

    it("should invoke the update opus as json service on the context root when saveOpus is called", function () {
        var data = {opusId: "opusId", dataResourceConfig:{imageSources: ["one", "two"], imageResourceOption: "RESOURCES"}};
        service.saveOpus("opusId", data);

        http.expectPOST("/someContext/opus/opusId/update", data).respond("bla");
    });

    it("should invoke the create opus service on the context root when saveOpus is called with no opusid", function () {
        var data = {dataResourceConfig: {imageSources: ["one", "two"], imageResourceOption: "RESOURCES"}};
        service.saveOpus(null, data);

        http.expectPUT("/someContext/opus/create", data).respond("bla");
    });

    it("should invoke the delete opus operation on the context root when deleteOpus is called", function() {
        service.deleteOpus("opus1");

        http.expectDELETE("/someContext/opus/opus1/delete").respond("bla");
    });

    it("should invoke the get opus vocab service on the context root when getOpusVocabulary is called", function () {
        service.getOpusVocabulary("opusId", "vocabId1");

        http.expectGET("/someContext/opus/opusId/vocab/vocabId1").respond("bla")
    });

    it("should invoke the update vocab service on the context root when updateVocabulary is called", function () {
        var data = {name: "vocab1", "strict": "true", "terms": []};
        service.updateVocabulary("opusId", "vocabId1", data);

        http.expectPOST("/someContext/opus/opusId/vocab/vocabId1/update", data).respond("bla")
    });

    it("should invoke the find term usages service on the context root when findUsagesOfVocabTerm is called", function () {
        service.findUsagesOfVocabTerm("opusId", "vocabId1", "termName");

        http.expectGET("/someContext/opus/opusId/vocab/vocabId1/findUsages?termName=termName").respond("bla")
    });

    it("should invoke the get opus vocab service on the context root when getOpusVocabulary is called", function () {
        var replacements = [{vocabId: "vocab1", existingTermName: "old name", newTermName: "new name"}];
        service.replaceUsagesOfVocabTerm("opusId", "vocabId", replacements);

        http.expectPOST("/someContext/opus/opusId/vocab/vocabId/replaceUsages", replacements).respond("bla")
    });

    it("should invoke the get object audit service on the context root when getAuditHistory is called", function () {
        service.getAuditHistory("attrId1");

        http.expectGET("/someContext/audit/object/attrId1").respond("bla");
    });

    it("should invoke the delete attribute service on the context root when deleteAttribute is called", function () {
        service.deleteAttribute("opusId", "profileId1", "attrId1");

        http.expectDELETE("/someContext/opus/opusId/profile/profileId1/attribute/attrId1/delete").respond("bla");
    });

    it("should invoke the update attribute service on the context root when saveAttribute is called", function () {
        var data = "{attribute data}";
        service.saveAttribute("opusId", "profileId1", "attrId1", data);

        http.expectPOST("/someContext/opus/opusId/profile/profileId1/attribute/attrId1/update", data).respond("bla");
    });

    it("should invoke the retrieve images service on the context root when retrieveImages is called", function () {
        service.retrieveImages("opusId", "profileId", "searchId1", "sourceList", true);

        http.expectGET("/someContext/opus/opusId/profile/profileId/images?searchIdentifier=searchId1&imageSources=sourceList&readonlyView=true").respond("bla");
    });

    it("should invoke the retrieve lists service on the context root when retrieveLists is called", function () {
        service.retrieveLists("opusId", "profileId", "guid1");

        http.expectGET("/someContext/opus/opusId/profile/profileId/lists?guid=guid1").respond("bla");
    });

    it("should invoke the retrieve species profile service on the context root when getSpeciesProfile is called", function () {
        service.getSpeciesProfile("opusId", "profileId", "guid1");

        http.expectGET("/someContext/opus/opusId/profile/profileId/speciesProfile?guid=guid1").respond("bla");
    });

    it("should invoke the update links service on the context root when updateLinks is called", function() {
        var data = "list of links";
        service.updateLinks("opusId", "profileId", data);

        http.expectPOST("/someContext/opus/opusId/profile/profileId/links/update", data).respond("bla");
    });

    it("should invoke the update BHL links service on the context root when updateBhlLinks is called", function() {
        var data = "list of links";
        service.updateBhlLinks("opusId", "profileId", data);

        http.expectPOST("/someContext/opus/opusId/profile/profileId/bhllinks/update", data).respond("bla");
    });

    it("should invoke the BHL lookup service on the context root when lookupBhlPage is called", function() {
        service.lookupBhlPage("pageId");

        http.expectGET("/someContext/bhl/pageId").respond("bla");
    });

    it("should invoke the collectory data resource service on the context root when getResource ", function() {
        service.getResource("resId");

        http.expectGET("/someContext/dataResource/resId").respond("bla");
    });

    it("should invoke the list collectory data resource service on the context root when listResources", function() {
        service.listResources();

        http.expectGET("/someContext/dataResource").respond("bla");
    });

    it("should invoke the profile search operation on the context root when profileSearch is called ", function() {
        service.profileSearch("opusId", "scientificName");

        http.expectGET('/someContext/profile/search/scientificName?autoCompleteScientificName=false&opusId=opusId&scientificName=scientificName&sortBy=name&useWildcard=true').respond("bla");
    });

    it("should invoke the profile search operation on the context root with wildcard=false if false is passed in when profileSearch is called ", function() {
        service.profileSearch("opusId", "scientificName", false);

        http.expectGET("/someContext/profile/search/scientificName?autoCompleteScientificName=false&opusId=opusId&scientificName=scientificName&sortBy=name&useWildcard=false").respond("bla");
    });

    it("should invoke the profile search operation on the context root with the sort by value provided when profileSearch is called ", function() {
        service.profileSearch("opusId", "scientificName", false, "sortme");

        http.expectGET("/someContext/profile/search/scientificName?autoCompleteScientificName=false&opusId=opusId&scientificName=scientificName&sortBy=sortme&useWildcard=false").respond("bla");
    });

    it("should invoke the profile search operation on the context root when wildcardsearch profileSearch on autoCompleteScientificName is called ", function() {
        service.profileSearch("opusId", "scientificName", true, "sortme", true);

        http.expectGET("/someContext/profile/search/scientificName?autoCompleteScientificName=true&opusId=opusId&scientificName=scientificName&sortBy=sortme&useWildcard=true").respond("bla");
    });

    it("should invoke the taxon level search service on the context root when profileSearchByTaxonLevel is invoked", function() {
        service.profileSearchByTaxonLevel("opusId", "taxonName", undefined, 10, 5);

        http.expectGET("/someContext/profile/search/taxon/level?max=10&offset=5&opusId=opusId&taxon=taxonName").respond("bla");
    });

    it("should invoke the taxon level search service on the context root with the provided filter term when profileSearchByTaxonLevel is invoked", function() {
        service.profileSearchByTaxonLevel("opusId", "taxonName", "something", 10, 5);

        http.expectGET("/someContext/profile/search/taxon/level?filter=something&max=10&offset=5&opusId=opusId&taxon=taxonName").respond("bla");
    });

    it("should invoke the taxon level and name search service on the context root when profileSearchByTaxonLevelAndName is invoked", function() {
        service.profileSearchByTaxonLevelAndName("opusId", "taxonName", "sciName", 10, 5);

        http.expectGET("/someContext/profile/search/taxon/name?countChildren=false&immediateChildrenOnly=false&max=10&offset=5&opusId=opusId&scientificName=sciName&sortBy=name&taxon=taxonName").respond("bla");
    });

    it("should invoke the taxon level and name search service on the context root with a sort param if provided when profileSearchByTaxonLevelAndName is invoked", function() {
        service.profileSearchByTaxonLevelAndName("opusId", "taxonName", "sciName", 10, 5, {sortBy: "sortme"});

        http.expectGET("/someContext/profile/search/taxon/name?countChildren=false&immediateChildrenOnly=false&max=10&offset=5&opusId=opusId&scientificName=sciName&sortBy=sortme&taxon=taxonName").respond("bla");
    });

    it("should invoke the taxon levels search service on the context root when getTaxonLevels is invoked", function() {
        service.getTaxonLevels("opusId");

        http.expectGET("/someContext/profile/search/taxon/levels?opusId=opusId").respond("bla");
    });

    it("shold invoke the getImmediateChildren service on the context root with all provided parameters when getImmediateChildren is invoked", function() {
        service.profileSearchGetImmediateChildren("opus1", "rank", "name", 10, 20, "filter");

        http.expectGET("/someContext/profile/search/children?filter=filter&max=10&name=name&offset=20&opusId=opus1&rank=rank").respond("bla");
    });

    it("shold not include the filter param when getImmediateChildren is invoked with a null, empty or undefined filter term", function() {
        service.profileSearchGetImmediateChildren("opus1", "rank", "name", 10, 20, " ");

        http.expectGET("/someContext/profile/search/children?max=10&name=name&offset=20&opusId=opus1&rank=rank").respond("bla");

        service.profileSearchGetImmediateChildren("opus1", "rank", "name", 10, 20, null);

        http.expectGET("/someContext/profile/search/children?max=10&name=name&offset=20&opusId=opus1&rank=rank").respond("bla");

        service.profileSearchGetImmediateChildren("opus1", "rank", "name", 10, 20, undefined);

        http.expectGET("/someContext/profile/search/children?max=10&name=name&offset=20&opusId=opus1&rank=rank").respond("bla");
    });

    it("should invoke the user search operation on the context root when userSearch is called ", function() {
        service.userSearch("fred");

        http.expectGET("/someContext/user/search?userName=fred").respond("bla");
    });

    it("should invoke the update user operation on the context root when updateUser is called ", function() {
        service.updateUsers("opus1", "authorities");

        http.expectPOST("/someContext/opus/opus1/users/update", "authorities").respond("bla");
    });

    it("should invoke the upload glossary operation on the context root when uploadGlossary is called", function() {
        var formData = new FormData();
        service.uploadGlossary("opus1", formData);

        http.expectPOST("/someContext/opus/opus1/glossary/upload", formData).respond("bla");
    });

    it("should invoke the get glossary operation on the PROFILE SERVICE when getGlossary is called", function() {
        service.getGlossary("opus1", "prefix");

        http.expectGET("/someContext/opus/opus1/glossary/prefix").respond("bla");
    });

    it("should invoke the delete glossary item operation on the context root when deleteGlossaryItem is called", function() {
        service.deleteGlossaryItem("opus1", "item1");

        http.expectDELETE("/someContext/opus/opus1/glossary/item/item1/delete").respond("bla");
    });

    it("should invoke the create glossary item operation on the context root when saveGlossaryItem is called with no item id", function() {
        var data = {term: "something"};
        service.saveGlossaryItem("opus1", null, data);

        http.expectPUT("/someContext/opus/opus1/glossary/item/create", data).respond("bla");
    });

    it("should invoke the create glossary item operation on the context root when saveGlossaryItem is called with no item id", function() {
        var data = {term: "something"};
        service.saveGlossaryItem("opus1", "item1", data);

        http.expectPOST("/someContext/opus/opus1/glossary/item/item1/update", data).respond("bla");
    });

    it("should invoke the add comment operation on the context root when addComment is invoked", function() {
        service.addComment("opusId", "profileId");

        http.expectPUT("/someContext/opus/opusId/profile/profileId/comment/create").respond("bla");
    });

    it("should invoke the update comment operation on the context root when updateComment is invoked", function() {
        var data = {text: "something"};
        service.updateComment("opusId", "profileId", "commentId", data);

        http.expectPOST("/someContext/opus/opusId/profile/profileId/comment/commentId/update", data).respond("bla");
    });

    it("should invoke the delete comment operation on the context root when deleteComment is invoked", function() {
        service.deleteComment("opusId", "profileId", "commentId");

        http.expectDELETE("/someContext/opus/opusId/profile/profileId/comment/commentId/delete").respond("bla");
    });

    it("should invoke the get comments operation on the context root when getComments is invoked", function() {
        service.getComments("opusId", "profileId");

        http.expectGET("/someContext/opus/opusId/profile/profileId/comment").respond("bla");
    });

    it("should invoke the save authorship operation on the context root when saveAuthorship is invoked", function() {
        var data = {category: "Author", text: "Fred, Jill"};
        service.saveAuthorship("opusId", "profileId", data);

        http.expectPOST("/someContext/opus/opusId/profile/profileId/authorship/update", data).respond("bla");
    });

    it("should invoke publication webservice using GET method", function() {
        var data = "123";
        service.getPublicationsFromId(data);

        http.expectGET("/someContext/publication/123/json").respond("bla");
    });

    it("should invoke the archive profile service when archiveProfile is invoked", function() {
        service.archiveProfile("opusId", "profileId", "archive comment");

        http.expectPOST("/someContext/opus/opusId/profile/profileId/archive", {archiveComment: "archive comment"}).respond("bla");
    });

    it("should invoke the restore archived profile service when restoreArchivedProfile is invoked", function() {
        service.restoreArchivedProfile("opusId", "profileId");
        http.expectPOST("/someContext/opus/opusId/profile/profileId/restore", {newName: null}).respond("bla");

        service.restoreArchivedProfile("opusId", "profileId", undefined);
        http.expectPOST("/someContext/opus/opusId/profile/profileId/restore", {newName: null}).respond("bla");

        service.restoreArchivedProfile("opusId", "profileId", null);
        http.expectPOST("/someContext/opus/opusId/profile/profileId/restore", {newName: null}).respond("bla");

        service.restoreArchivedProfile("opusId", "profileId", "new name");
        http.expectPOST("/someContext/opus/opusId/profile/profileId/restore", {newName: "new name"}).respond("bla");
    });

    it("should invoke the updateSupportingCollections service when updateSupportingCollections is invoked", function() {
        service.updateSupportingCollections("opusId", {supportingCollections: "abc"});

        http.expectPOST("/someContext/opus/opusId/supportingCollections/update", {supportingCollections: "abc"}).respond("bla");
    });

    it("should invoke the respondToSupportingCollectionRequests service when respondToSupportingCollectionRequests is invoked", function() {
        service.respondToSupportingCollectionRequest("opus1", "opus2", true);

        http.expectPOST("/someContext/opus/opus1/supportingCollections/respond/opus2/true").respond("bla");
    });

    it("should construct the correct url when delete attachment is called with no profile id", function() {
        service.deleteAttachment("opusId", undefined, "attachmentId");

        http.expectDELETE("/someContext/opus/opusId/attachment/attachmentId").respond("bla");

        service.deleteAttachment("opusId", null, "attachmentId");

        http.expectDELETE("/someContext/opus/opusId/attachment/attachmentId").respond("bla");

        service.deleteAttachment("opusId", "", "attachmentId");

        http.expectDELETE("/someContext/opus/opusId/attachment/attachmentId").respond("bla");
    });

    it("should construct the correct url when delete attachment is called with a profile id", function() {
        service.deleteAttachment("opusId", "profileId", "attachmentId");

        http.expectDELETE("/someContext/opus/opusId/profile/profileId/attachment/attachmentId").respond("bla");
    });

    it("should construct the correct url when getAttachmentMetadata is called with no profile id", function() {
        service.getAttachmentMetadata("opusId", undefined, "attachmentId");

        http.expectGET("/someContext/opus/opusId/attachment/attachmentId").respond("bla");
    });

    it("should construct the correct url when getAttachmentMetadata is called with a profile id", function() {
        service.getAttachmentMetadata("opusId", "profileId", "attachmentId");

        http.expectGET("/someContext/opus/opusId/profile/profileId/attachment/attachmentId").respond("bla");
    });

    it("should construct the correct url when getAttachmentMetadata is called with no attachment id", function() {
        service.getAttachmentMetadata("opusId", "profileId", undefined);

        http.expectGET("/someContext/opus/opusId/profile/profileId/attachment").respond("bla");
    });

    it("should construct the correct url when getAttachmentMetadata is called with a profile id", function() {
        service.getAttachmentMetadata("opusId", "profileId", "attachmentId");

        http.expectGET("/someContext/opus/opusId/profile/profileId/attachment/attachmentId").respond("bla");
    });

    it("should invoke the updateLocalImageMetadata service on the context root when saveImageMetadata is called", function() {
        var data = {creator: "one", createdDate: new Date(), rights: "rights", licence: "licence"};
        service.saveImageMetadata('opusId', 'abcdefghijlkmnop', data);

        http.expectPOST("/someContext/opus/opusId/image/abcdefghijlkmnop/metadata", data).respond("bla");
    });

    it("should invoke GET request when getImageMetadata is called", function() {
        service.getImageMetadata('abcdefghijlkmnop', true);

        http.expectGET("/someContext/ws/image/abcdefghijlkmnop").respond("bla");
    });

    it("should invoke GET request when trackService is called", function() {
        window.fathom = {
            trackPageview: function(payload) {

                http.get(payload.url);
            }
        };

        spyOn(window.fathom, 'trackPageview');
        service.trackPageview('/opus/xyz/profile/abc/pdf');

        expect(window.fathom.trackPageview).toHaveBeenCalledWith({url: '/opus/xyz/profile/abc/pdf'});

        // Ignore below lines. added to prevent call to http.flush from throwing an error
        service.getImageMetadata('abcdefghijlkmnop', true);
        http.expectGET("/someContext/ws/image/abcdefghijlkmnop").respond("bla");
        // end ignore
    });
});