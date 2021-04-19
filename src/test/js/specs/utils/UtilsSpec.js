describe("Util tests", function () {
    var service;
    var location;
    var browser;

    beforeAll(function () {
        console.log("****** Util Tests ******")
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function (_util_, _$location_, _$browser_) {
        service = _util_;
        location = _$location_;
        browser = _$browser_;
    }));

    it("should return the first item in the path if given 0 OR FIRST", function () {
        location.path("/part1/part2/part3");

        expect(service.getPathItem(0)).toBe("part1");
        expect(service.getPathItem(service.FIRST)).toBe("part1");
    });

    it("should return the last item in the path if given the last index OR LAST", function () {
        location.path("/part1/part2/part3");

        expect(service.getPathItem(2)).toBe("part3");
        expect(service.getPathItem(service.LAST)).toBe("part3");
    });

    it("should ignore the query string", function () {
        location.path("/part1/part2/part3?foo=baa");

        expect(service.getPathItem(2)).toBe("part3");
        expect(service.getPathItem(service.LAST)).toBe("part3");
    });

    it("should extract the opus identifier from the URL when getEntityId is invoked with 'opus'", function() {
        location.path("/opus/opusId1");

        expect(service.getEntityId("opus")).toBe("opusId1");

        location.path("/opus/opusId2/");

        expect(service.getEntityId("opus")).toBe("opusId2");

        location.path("/opus/opusId3/profile/profileId1");

        expect(service.getEntityId("opus")).toBe("opusId3");
    });

    it("should extract the profile identifier from the URL when getEntityId is invoked with 'profile'", function() {
        location.path("/opus/opusId1");

        expect(service.getEntityId("profile")).toBe('');

        location.path("/opus/opusId2/profile/");

        expect(service.getEntityId("profile")).toBe('');

        location.path("/opus/opusId3/profile/profileId1");

        expect(service.getEntityId("profile")).toBe("profileId1");

        location.path("/opus/opusId3/profile/profileId2/update");

        expect(service.getEntityId("profile")).toBe("profileId2");

        location.path("/opus/opusId3/profile/profileId3/");

        expect(service.getEntityId("profile")).toBe("profileId3");

        location.path("/opus/opusId3/profile/profileId3;jsessionid=349845g4g4");

        expect(service.getEntityId("profile")).toBe("profileId3");
    });

    it("should replace all punctuation and whitespace with underscores, and convert to lowercase, when toKey is called", function() {
        expect(service.toKey("Hello World")).toBe("hello_world");
        expect(service.toKey("Hello: World!")).toBe("hello__world_");
    });

    it("should return false when a null value is passed to isUuid", function() {
        expect(service.isUuid(null)).toBe(false);
    });

    it("should return false when an undefined value is passed to isUuid", function() {
        expect(service.isUuid(undefined)).toBe(false);
    });

    it("should return false when an empty string is passed to isUuid", function() {
        expect(service.isUuid("")).toBe(false);
    });

    it("should return false when a string of whitespace is passed to isUuid", function() {
        expect(service.isUuid("     ")).toBe(false);
    });

    it("should return false when a non-uuid string is passed to isUuid", function() {
        expect(service.isUuid("this is not a uuid")).toBe(false);
    });

    it("should return true when a valid uuid is passed to isUuid", function() {
        expect(service.isUuid("e0fd3aca-7b21-44de-abe4-6b392cd32aae")).toBe(true);
    });

    it("should format autonyms correctly", function() {
        expect(service.formatScientificName(
            "Adenanthos cygnorum subsp. cygnorum", "Diels", "Adenanthos cygnorum Diels subsp. cygnorum"))
        .toBe("<span class='scientific-name'>Adenanthos cygnorum <span class='normal-text'>Diels</span> <span class='normal-text'>subsp.</span> cygnorum</span>");
    });
});

