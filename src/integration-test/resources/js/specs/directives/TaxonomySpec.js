describe('Directive: Taxonomy (Tree Layout)', function () {
    var scope, compile;
    var classification = [
        {rank: "Kingdom", name: "Plantae"},
        {rank: "Phylum", name: "Charophyta"},
        {rank: "Class", name: "Equisetopsida"},
        {rank: "Subclass", name: "Magnoliidae"},
        {rank: "Order", name: "Fabales"},
        {rank: "Family", name: "Fabaceae"},
        {rank: "Genus", name: "Acacia"},
        {rank: "Species", name: "Acacia dealbata"}
    ];
    var validTreeTemplate = '<taxonomy data="profileCtrl.profile.classification" opus-id="opusId" include-rank="true" show-children="true" layout="tree"></taxonomy>';

    var util, profileService;
    var childrenDefer, subordinatesDefer;

    beforeAll(function () {
        console.log("****** Taxonomy Directive (Tree Layout) Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(function () {
        module('profileEditor');

        inject(function ($compile, $rootScope, $q, _util_, _profileService_) {
            var testScope = $rootScope.$new();
            compile = $compile;
            util = _util_;
            profileService = _profileService_;

            childrenDefer = $q.defer();
            subordinatesDefer = $q.defer();

            spyOn(profileService, "profileSearchGetImmediateChildren").and.returnValue(childrenDefer.promise);
            spyOn(profileService, "profileSearchByTaxonLevelAndName").and.returnValue(subordinatesDefer.promise);


            var element = angular.element(validTreeTemplate);
            $compile(element)(testScope);
            testScope.$digest();
            scope = element.isolateScope();
            scope.taxonomyCtrl.taxonomy = classification;
        });

        scope.$digest();
    });

    it("should retrieve subordinate taxa and add them to the 'children' attribute of the taxon when showAllSubordinateTaxaList is invoked", function() {
        scope.taxonomyCtrl.opusId = "opus1";
        var taxon = {rank: "species", name: "Acacia dealbata"};
        subordinatesDefer.resolve([{rank: "subspecies", scientificName: "sub1"}, {rank: "subspecies", scientificName: "sub1"}]);
        scope.taxonomyCtrl.showAllSubordinateTaxaList(taxon);
        scope.$apply();

        expect(profileService.profileSearchByTaxonLevelAndName).toHaveBeenCalledWith("opus1", "species", "Acacia dealbata", 15, 0);
        expect(taxon.children.length).toBe(2);
    });

    it("should collapse the section when loadSubordinateTaxa is invoked with openCloseSection = true", function() {
        var taxon = {expanded: true};
        scope.taxonomyCtrl.loadSubordinateTaxa(0, taxon, true);
        scope.$apply();

        expect(taxon.expanded).toBe(false);
    });

    it("should invoke getImmediateChildren with an offset of 0 when loadSubordinateTaxa in invoked for the first time", function() {
        scope.taxonomyCtrl.opusId = "opus1";
        var taxon = {
            expanded: true,
            rank: "genus",
            name: "acacia",
            offset: 0,
            filter: null
        };

        scope.taxonomyCtrl.loadSubordinateTaxa(0, taxon, false);
        scope.$apply();

        expect(profileService.profileSearchGetImmediateChildren).toHaveBeenCalledWith("opus1", "genus", "acacia", 15, 0, null);
    });

    it("should default the offset to 0 if it is undefined or < 0 when loadSubordinateTaxa is invoked", function() {
        scope.taxonomyCtrl.opusId = "opus1";
        var taxon = {
            expanded: true,
            rank: "genus",
            name: "acacia",
            filter: null
        };

        scope.taxonomyCtrl.loadSubordinateTaxa(undefined, taxon, false);
        scope.$apply();

        expect(profileService.profileSearchGetImmediateChildren).toHaveBeenCalledWith("opus1", "genus", "acacia", 15, 0, null);
    });

    it("should clear the children of the select taxon when filtering if there are no results", function() {
        scope.taxonomyCtrl.opusId = "opus1";
        var taxon = {
            expanded: true,
            rank: "genus",
            name: "acacia",
            offset: 0,
            filter: "nothing",
            children: [{rank: "species", name: "Acacia dealbata"}]
        };

        childrenDefer.resolve([]);

        scope.taxonomyCtrl.loadSubordinateTaxa(0, taxon, false);

        expect(profileService.profileSearchGetImmediateChildren).toHaveBeenCalledWith("opus1", "genus", "acacia", 15, 0, "nothing");
        scope.$apply();

        expect(taxon.children.length).toBe(0);
        expect(taxon.mightHaveMore).toBe(false);
    });

    it("should set the children of the select taxon to the getImmediateChildren result when the offset = 0", function() {
        scope.taxonomyCtrl.opusId = "opus1";
        var taxon = {
            expanded: true,
            rank: "genus",
            name: "acacia",
            offset: 0,
            filter: "acac",
            children: [{rank: "species", name: "Acacia dealbata"}]
        };

        childrenDefer.resolve([{rank: "species", name: "Acacia abbattiana"}, {rank: "species", name: "Acacia abrupta"}]);

        scope.taxonomyCtrl.loadSubordinateTaxa(0, taxon, false);

        expect(profileService.profileSearchGetImmediateChildren).toHaveBeenCalledWith("opus1", "genus", "acacia", 15, 0, "acac");
        scope.$apply();

        expect(taxon.children.length).toBe(2);
        expect(taxon.children[0].name).toBe("Acacia abbattiana");
        expect(taxon.children[1].name).toBe("Acacia abrupta");
        expect(taxon.mightHaveMore).toBe(false);
    });

    it("should append the getImmediateChildren result to the children of the select taxon when the offset > 0", function() {
        scope.taxonomyCtrl.opusId = "opus1";
        var taxon = {
            expanded: true,
            rank: "genus",
            name: "acacia",
            offset: 1,
            filter: "acac",
            children: [{rank: "species", name: "Acacia dealbata"}]
        };

        childrenDefer.resolve([{rank: "species", name: "Acacia abbattiana"}, {rank: "species", name: "Acacia abrupta"}]);

        scope.taxonomyCtrl.loadSubordinateTaxa(1, taxon, false);

        expect(profileService.profileSearchGetImmediateChildren).toHaveBeenCalledWith("opus1", "genus", "acacia", 15, 1, "acac");
        scope.$apply();

        expect(taxon.children.length).toBe(3);
        expect(taxon.children[0].name).toBe("Acacia dealbata");
        expect(taxon.children[1].name).toBe("Acacia abbattiana");
        expect(taxon.children[2].name).toBe("Acacia abrupta");
        expect(taxon.mightHaveMore).toBe(false);
    });

    it("should set showingCurrentProfileOnly to false when there are children", function() {
        scope.taxonomyCtrl.opusId = "opus1";
        var taxon = {
            expanded: true,
            showingCurrentProfileOnly: true,
            rank: "genus",
            name: "acacia",
            offset: 1,
            filter: "acac",
            children: [{rank: "species", name: "Acacia dealbata"}]
        };

        childrenDefer.resolve([{rank: "species", name: "Acacia abbattiana"}, {rank: "species", name: "Acacia abrupta"}]);

        scope.taxonomyCtrl.loadSubordinateTaxa(1, taxon, false);

        expect(profileService.profileSearchGetImmediateChildren).toHaveBeenCalledWith("opus1", "genus", "acacia", 15, 1, "acac");
        scope.$apply();

        expect(taxon.showingCurrentProfileOnly).toBe(false);
    });

    it("should set mightHaveMore to false if the number of children is less than the page size", function() {
        scope.taxonomyCtrl.opusId = "opus1";
        var taxon = {
            expanded: true,
            showingCurrentProfileOnly: true,
            rank: "genus",
            name: "acacia",
            offset: 1,
            filter: "acac",
            children: [{rank: "species", name: "Acacia dealbata"}]
        };

        childrenDefer.resolve([{rank: "species", name: "Acacia abbattiana"}, {rank: "species", name: "Acacia abrupta"}]);

        scope.taxonomyCtrl.pageSize = 20;

        scope.taxonomyCtrl.loadSubordinateTaxa(1, taxon, false);

        expect(profileService.profileSearchGetImmediateChildren).toHaveBeenCalledWith("opus1", "genus", "acacia", 20, 1, "acac");
        scope.$apply();

        expect(taxon.mightHaveMore).toBe(false);
    });

    it("should set mightHaveMore to true if the number of children is equal to the page size", function() {
        scope.taxonomyCtrl.opusId = "opus1";
        var taxon = {
            expanded: true,
            showingCurrentProfileOnly: true,
            rank: "genus",
            name: "acacia",
            offset: 1,
            filter: "acac",
            children: [{rank: "species", name: "Acacia dealbata"}]
        };
        scope.taxonomyCtrl.pageSize = 2;

        childrenDefer.resolve([{rank: "species", name: "Acacia abbattiana"}, {rank: "species", name: "Acacia abrupta"}]);

        scope.taxonomyCtrl.loadSubordinateTaxa(1, taxon, false);

        expect(profileService.profileSearchGetImmediateChildren).toHaveBeenCalledWith("opus1", "genus", "acacia", 2, 1, "acac");
        scope.$apply();

        expect(taxon.mightHaveMore).toBe(true);
    });

    it("should set mightHaveMore to true if the number of children is greater than the page size", function() {
        scope.taxonomyCtrl.opusId = "opus1";
        var taxon = {
            expanded: true,
            showingCurrentProfileOnly: true,
            rank: "genus",
            name: "acacia",
            offset: 1,
            filter: "acac",
            children: [{rank: "species", name: "Acacia dealbata"}]
        };
        scope.taxonomyCtrl.pageSize = 1;

        childrenDefer.resolve([{rank: "species", name: "Acacia abbattiana"}, {rank: "species", name: "Acacia abrupta"}]);

        scope.taxonomyCtrl.loadSubordinateTaxa(1, taxon, false);

        expect(profileService.profileSearchGetImmediateChildren).toHaveBeenCalledWith("opus1", "genus", "acacia", 1, 1, "acac");
        scope.$apply();

        expect(taxon.mightHaveMore).toBe(true);
    });

    it("should set the offset to 0 when the filter term changes", function() {
        var taxon = {offset: 10};

        scope.taxonomyCtrl.filterChanged(taxon);

        expect(taxon.offset).toBe(0);
    });

    it("should reload the subordinate taxa when the filter term is cleared", function() {
        scope.taxonomyCtrl.opusId = "opus1";
        var taxon = {rank: "genus", name: "acacia", offset: 10, filter: "", expanded: true};

        scope.taxonomyCtrl.filterChanged(taxon);

        expect(profileService.profileSearchGetImmediateChildren).toHaveBeenCalledWith("opus1", "genus", "acacia", 15, 0, "");
    });

    it("should leave the section expanded when the filter term is cleared", function() {
        scope.taxonomyCtrl.opusId = "opus1";
        var taxon = {rank: "genus", name: "acacia", offset: 10, filter: "", expanded: true};

        scope.taxonomyCtrl.filterChanged(taxon);

        expect(taxon.expanded).toBe(true);
    });

    it("should construct a hierarchical structure based on the provided classification when hierarchialiseTaxonomy is invoked", function() {
        scope.taxonomyCtrl.hierarchialiseTaxonomy();

        expect(scope.taxonomyCtrl.hierarchy).toBeDefined();
        expect(scope.taxonomyCtrl.hierarchy.length).toBe(1);
        checkHierarchyItem(scope.taxonomyCtrl.hierarchy[0], "Kingdom", "Plantae", 1, true, -1, true, true, null);
        checkHierarchyItem(scope.taxonomyCtrl.hierarchy[0].children[0], "Phylum", "Charophyta", 1, true, -1, true, true, null);
        checkHierarchyItem(scope.taxonomyCtrl.hierarchy[0].children[0].children[0], "Class", "Equisetopsida", 1, true, -1, true, true, null);
        checkHierarchyItem(scope.taxonomyCtrl.hierarchy[0].children[0].children[0].children[0], "Subclass", "Magnoliidae", 1, true, -1, true, true, null);
        checkHierarchyItem(scope.taxonomyCtrl.hierarchy[0].children[0].children[0].children[0].children[0], "Order", "Fabales", 1, true, -1, true, true, null);
        checkHierarchyItem(scope.taxonomyCtrl.hierarchy[0].children[0].children[0].children[0].children[0].children[0], "Family", "Fabaceae", 1, true, -1, true, true, null);
        checkHierarchyItem(scope.taxonomyCtrl.hierarchy[0].children[0].children[0].children[0].children[0].children[0].children[0], "Genus", "Acacia", 1, true, -1, true, true, null);
        checkHierarchyItem(scope.taxonomyCtrl.hierarchy[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0], "Species", "Acacia dealbata");
    });

    function checkHierarchyItem(item, rank, name, childCount, expanded, offset, showingCurrentPorfileOnly, mightHaveMore, filter) {
        expectValueOrUndefined(item.rank, rank);
        expectValueOrUndefined(item.name, name);
        if (_.isUndefined(childCount)) {
            expect(item.children).toBeUndefined();
        } else {
            expect(item.children.length).toBe(childCount);
        }
        expectValueOrUndefined(item.expanded, expanded);
        expectValueOrUndefined(item.offset, offset);
        expectValueOrUndefined(item.showingCurrentProfileOnly, showingCurrentPorfileOnly);
        expectValueOrUndefined(item.mightHaveMore, mightHaveMore);
        expectValueOrUndefined(item.filter, filter);
    }

    function expectValueOrUndefined(field, value) {
        if (_.isUndefined(value)) {
            expect(field).toBeUndefined();
        } else {
            expect(field).toBe(value);
        }
    }

});