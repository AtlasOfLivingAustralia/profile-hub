describe('Directive: ProfileComparison', function () {
    var scope, compile;
    var validTemplate = '<profile-comparison left="{}" left-title="LeftTitle" right="{}" right-title="RightTitle"></profile-comparison>';

    beforeAll(function () {
        console.log("****** ProfileComparison Directive Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(function () {
        module('profileEditor');

        inject(function ($compile, $rootScope) {
            var testScope = $rootScope.$new();
            compile = $compile;

            var element = angular.element(validTemplate);
            $compile(element)(testScope);
            testScope.$digest();
            scope = element.isolateScope();
        });

    });

    it("should identify newly added items in primitive lists", function() {
        scope.left = {specimenIds: ["new", "existing"]};
        scope.right = {specimenIds: ["existing"]};
        scope.$digest();

        expect(scope.diff.specimenIds.changed).toBeTruthy();
        expect(scope.diff.specimenIds.comp).toBe('<ins style="background:#e6ffe6;">new, </ins><span>existing</span>');
    });

    it("should identify removed items in primitive lists", function() {
        scope.left = {specimenIds: ["existing"]};
        scope.right = {specimenIds: ["existing", "removed"]};
        scope.$digest();

        expect(scope.diff.specimenIds.changed).toBeTruthy();
        expect(scope.diff.specimenIds.comp).toBe('<span>existing</span><del style="background:#ffe6e6;">, removed</del>');
    });

    it("should not detect changes in identical primitive lists", function() {
        scope.left = {specimenIds: ["existing1", "existing2"]};
        scope.right = {specimenIds: ["existing1", "existing2"]};
        scope.$digest();

        expect(scope.diff.specimenIds.changed).toBeFalsy();
        expect(scope.diff.specimenIds.comp).toBe('<span>existing1, existing2</span>');
    });

    it("should identify newly added items in object lists", function() {
        scope.left = {bibliography: [{uuid: "1", plainText: "existing"}, {uuid: "2", plainText: "new"}]};
        scope.right = {bibliography: [{uuid: "1", plainText: "existing"}]};
        scope.$digest();

        expect(scope.diff.bibliography.changed).toBeTruthy();
        expect(scope.diff.bibliography.comp[0].plainText.changed).toBeFalsy();
        expect(scope.diff.bibliography.comp[0].plainText.comp).toBe('<span>existing</span>');
        expect(scope.diff.bibliography.comp[1].plainText.changed).toBeTruthy();
        expect(scope.diff.bibliography.comp[1].plainText.comp).toBe('<ins style="background:#e6ffe6;">new</ins>');
    });

    it("should identify removed items in object lists", function() {
        scope.left = {bibliography: [{uuid: "1", plainText: "existing"}]};
        scope.right = {bibliography: [{uuid: "1", plainText: "existing"}, {uuid: "2", plainText: "removed"}]};
        scope.$digest();

        expect(scope.diff.bibliography.changed).toBeTruthy();
        expect(scope.diff.bibliography.comp[0].plainText.changed).toBeFalsy();
        expect(scope.diff.bibliography.comp[0].plainText.comp).toBe('<span>existing</span>');
        expect(scope.diff.bibliography.comp[1].plainText.changed).toBeTruthy();
        expect(scope.diff.bibliography.comp[1].plainText.comp).toBe('<del style="background:#ffe6e6;">removed</del>');
    });

    it("should not detect changes in identical primitive lists", function() {
        scope.left = {bibliography: [{uuid: "1", plainText: "existing1"}, {uuid: "2", plainText: "existing2"}]};
        scope.right = {bibliography: [{uuid: "1", plainText: "existing1"}, {uuid: "2", plainText: "existing2"}]};
        scope.$digest();

        expect(scope.diff.specimenIds.changed).toBeFalsy();
    });

    it("should identify edited items in object lists", function() {
        scope.left = {bibliography: [{uuid: "1", plainText: "existing1"}, {uuid: "2", plainText: "changed"}]};
        scope.right = {bibliography: [{uuid: "1", plainText: "existing1"}, {uuid: "2", plainText: "existing2"}]};
        scope.$digest();

        expect(scope.diff.bibliography.changed).toBeTruthy();
        expect(scope.diff.bibliography.comp[0].plainText.changed).toBeFalsy();
        expect(scope.diff.bibliography.comp[1].plainText.changed).toBeTruthy();
    });


    it("should identify edited items in lists of objects with multiple properties", function() {
        scope.left = {links: [{uuid: "1", title: "title1", description: "changed"}]};
        scope.right = {links: [{uuid: "1", title: "title1", description: "original"}]};
        scope.$digest();

        expect(scope.diff.links.changed).toBeTruthy();
        expect(scope.diff.links.comp[0].title.changed).toBeFalsy();
        expect(scope.diff.links.comp[0].description.changed).toBeTruthy();
    });
});