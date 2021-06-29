describe("BrowseController tests", function () {
    var controller;
    var scope;
    var mockUtil = {
        getPathItem: function () {
            return "12345"
        },
        getEntityId: function (str) {
            if (str == "opus") {
                return "opusId1"
            } else if (str == "profile") {
                return "profileId1"
            }
        },
        contextRoot: function() {

        },
        LAST: "last"
    };
    var messageService;
    var profileService;
    var searchDefer, levelsDefer, byNameDefer, byLevelAndNameDefer, getProfileDefer;

    var searchResponse = '[{"guid":"null","scientificName":"Acacia excelsa subsp. angusta","profileId":"e077b602-2a53-44f2-988d-6b54a35f323c"},{"guid":"null","scientificName":"Acacia excelsa subsp. excelsa","profileId":"63155a38-ba7e-4d33-8432-3a9a3556f588"}]';

    beforeAll(function () {
        console.log("****** Browse Controller Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($controller, $rootScope, _profileService_, $q, _messageService_) {
        scope = $rootScope.$new();
        profileService = _profileService_;

        searchDefer = $q.defer();
        levelsDefer = $q.defer();
        byNameDefer = $q.defer();
        byLevelAndNameDefer = $q.defer();
        getProfileDefer = $q.defer();

        spyOn(profileService, "profileSearch").and.returnValue(searchDefer.promise);
        spyOn(profileService, "getTaxonLevels").and.returnValue(levelsDefer.promise);
        spyOn(profileService, "profileSearchByTaxonLevel").and.returnValue(byNameDefer.promise);
        spyOn(profileService, "profileSearchByTaxonLevelAndName").and.returnValue(byLevelAndNameDefer.promise);
        spyOn(profileService, "getProfile").and.returnValue(getProfileDefer.promise);

        messageService = jasmine.createSpyObj('_messageService_', ["success", "info", "alert", "pop"]);

        controller = $controller("BrowseController as browseCtrl", {
            $scope: scope,
            profileService: profileService,
            util: mockUtil,
            messageService: messageService
        });
    }));

    it("should set the search results attribute of the current scope when search is invoked", function () {
        searchDefer.resolve(JSON.parse(searchResponse));
        scope.browseCtrl.searchTerm = "test";
        scope.browseCtrl.searchByScientificName();
        scope.$apply();

        expect(scope.browseCtrl.profiles.length).toBe(2); // there are 2 results in the dummy searchResponse
    });

    it("should read the opusId from the URL and the searchTerm from the current scope to call profileService.search", function () {
        searchDefer.resolve(JSON.parse(searchResponse));

        var searchTerm = "searchValue";
        scope.browseCtrl.searchTerm = searchTerm;

        scope.browseCtrl.searchByScientificName();
        scope.$apply();

        expect(profileService.profileSearch).toHaveBeenCalledWith("opusId1", searchTerm, true, 'taxonomy');
    });

    it("should fetch the list of all available taxon levels for the current opus when getTaxonLevels is invoked", function() {
        scope.browseCtrl.opusId = "opus1";

        var levels = {kingdom: 2, phylum: 3};

        levelsDefer.resolve(levels);
        scope.browseCtrl.getTaxonLevels();
        scope.$apply();

        expect(profileService.getTaxonLevels).toHaveBeenCalledWith("opus1");
        expect(scope.browseCtrl.taxonLevels).toBe(levels);
    });

    it("should raise an alert message if the call to getTaxonLevels fails", function() {
        scope.browseCtrl.opusId = "opus1";

        levelsDefer.reject();
        scope.browseCtrl.getTaxonLevels();
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalled();
    });

    it("should default the offset to 0 if it is not provided to searchByTaxonLevel", function() {
        scope.browseCtrl.searchByTaxonLevel("taxonName");

        expect(profileService.profileSearchByTaxonLevel).toHaveBeenCalledWith("opusId1", "taxonName", undefined, 25, 0);
    });

    it("should use the provided offset to searchByTaxonLevel", function() {
        scope.browseCtrl.searchByTaxonLevel("taxonName", 666);

        expect(profileService.profileSearchByTaxonLevel).toHaveBeenCalledWith("opusId1", "taxonName", undefined, 25, 666);
    });

    it("should use the provided filter when calling searchByTaxonLevel", function() {
        scope.browseCtrl.filters = {taxonName: "something"}; // this is bound to the input field
        scope.browseCtrl.searchByTaxonLevel("taxonName", 666);

        expect(profileService.profileSearchByTaxonLevel).toHaveBeenCalledWith("opusId1", "taxonName", "something", 25, 666);
    });

    it("should raise an alert message if the call to searchByTaxonLevel fails", function() {
        byNameDefer.reject();
        scope.browseCtrl.searchByTaxonLevel("taxonName", 666);
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalled();
    });

    it("should set the taxonResults attribute to the response from searchByTaxonLevels when the call succeeds", function() {
        var results = {species1: 10, species2: 20};

        byNameDefer.resolve(results);
        scope.browseCtrl.searchByTaxonLevel("taxonName");
        scope.$apply();

        expect(scope.browseCtrl.taxonResults).toBeDefined();
        expect(scope.browseCtrl.taxonResults["taxonName"]).toEqual(results);
    });

    it("should MERGE any existing values for the taxonResults attribute with the response from searchByTaxonLevels when the call succeeds", function() {
        scope.browseCtrl.taxonResults = {taxonName: {species1: 10, species2: 20}};
        var results = {species3: 30, species4: 40};

        byNameDefer.resolve(results);
        scope.browseCtrl.searchByTaxonLevel("taxonName");
        scope.$apply();

        expect(scope.browseCtrl.taxonResults).toBeDefined();
        expect(scope.browseCtrl.taxonResults["taxonName"]).toEqual({species1: 10, species2: 20, species3: 30, species4: 40});
    });

    it("should default the offset to 0 if it is not provided to searchByTaxon", function() {
        scope.browseCtrl.searchByTaxon("taxonName", "sciName", 10);

        expect(profileService.profileSearchByTaxonLevelAndName).toHaveBeenCalledWith("opusId1", "taxonName", "sciName", 25, 0, {sortBy: 'taxonomy'});
    });

    it("should use the provided offset to searchByTaxon", function() {
        scope.browseCtrl.searchByTaxon("taxonName", "sciName", 10, 666);

        expect(profileService.profileSearchByTaxonLevelAndName).toHaveBeenCalledWith("opusId1", "taxonName", "sciName", 25, 666, {sortBy: 'taxonomy'});
    });

    it("should raise an alert message if the call to searchByTaxonLevel fails", function() {
        byLevelAndNameDefer.reject();
        getProfileDefer.resolve({});
        scope.browseCtrl.searchByTaxon("taxonName", "sciName", 10, 666);
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalled();
    });

    it("should replace the profiles attribute with the response from profileSearchByTaxonLevelAndName when the call succeeds", function() {
        scope.browseCtrl.profiles = {species3: 30, species4: 40};
        var results = {species1: 10, species2: 20};

        byLevelAndNameDefer.resolve(results);
        getProfileDefer.resolve({});
        scope.browseCtrl.searchByTaxon("taxonName", "sciName", 10, 666);
        scope.$apply();

        expect(scope.browseCtrl.profiles).toEqual(results);
    });

    it("should set profile exists for a selected taxon searchByTaxon", function() {
        var results = {something: 10, species2: 20};
        byLevelAndNameDefer.resolve(results);
        getProfileDefer.resolve({profile: {scientificName: 'something'}});
        scope.browseCtrl.searchByTaxon("taxonName", "something", 10, 555);
        scope.$apply();

        expect(scope.browseCtrl.selectedTaxon.profileExist).toEqual(true);
    });
});
