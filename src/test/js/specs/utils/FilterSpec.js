describe("'capitalize' filter tests", function () {
    var filter;

    beforeAll(function () {
        console.log("****** Capitalize Filter Tests ******")
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($filter) {
        filter = $filter("capitalize");
    }));

    it("should convert the first letter of the each word to upper case", function () {
        expect(filter("hello world")).toBe("Hello World")
    });

});


describe("'default' filter tests", function () {
    var filter;

    beforeAll(function () {
        console.log("****** Default Filter Tests ******")
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($filter) {
        filter = $filter("default");
    }));

    it("should return the input value unmodified if it is defined", function () {
        expect(filter("input", "hello world")).toBe("input")
    });

    it("should return the default value if the input value is not truthy", function () {
        expect(filter("", "hello world")).toBe("hello world");
        expect(filter("   ", "hello world")).toBe("hello world");
        expect(filter(null, "hello world")).toBe("hello world");
    });
});

describe("'plainText' filter test", function() {
    var filter;

    beforeAll(function () {
        console.log("****** Default Filter Tests ******")
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($filter) {
        filter = $filter("plainText");
    }));

    it("should strip HTML from text", function () {
        expect(filter("<p>hello world</p>")).toBe("hello world");
        expect(filter("<span>hello <hr attribute att2=\"value\"><br />world</span>")).toBe("hello world");
    });

});