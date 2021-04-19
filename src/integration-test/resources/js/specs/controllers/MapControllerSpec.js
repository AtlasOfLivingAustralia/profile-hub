describe("MapController tests", function () {
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
        LAST: "last"
    };
    var messageService;
    var profileService;
    var profileDefer, popupDefer;
    var http;
    var html = "<div id='occurrenceMap' data-leaflet-img='pathToLeafletImages'/>";

    var getProfileResponse = '{"profile": {"guid": "guid1", "scientificName":"profileName", "occurrenceQuery":"q=lsid%3Aguid1", "links":[{},{}]}, "opus": {"imageSources": ["source1", "source2"],  "mapConfig": {"mapDefaultLatitude": "123", "mapDefaultLongitude": "987", "mapZoom": "2", "mapAttribution":"mapAttr1"}}}';

    beforeAll(function () {
        console.log("****** Map Controller Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($controller, $rootScope, _profileService_, $q, _messageService_, _$httpBackend_) {
        var mapElem = jQuery('#occurrenceMap');
        if (_.isUndefined(mapElem)) {
            mapElem.remove();
        }
        jQuery(document.body).html(html);

        scope = $rootScope.$new();
        profileService = _profileService_;

        profileDefer = $q.defer();
        popupDefer = $q.defer();

        spyOn(profileService, "getProfile").and.returnValue(profileDefer.promise);

        messageService = jasmine.createSpyObj('_messageService_', ["success", "info", "alert", "pop"]);

        controller = $controller("MapController as mapCtrl", {
            $scope: scope,
            profileService: profileService,
            util: mockUtil,
            config: {map: {mapId: "123", token: "123"}, biocacheServiceUrl: "http://biocacheWmsUrl"},
            messageService: messageService
        });

        http = _$httpBackend_;
    }));

    it("should set the profile attribute of the current scope when init is called", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));

        scope.mapCtrl.init();
        scope.$apply();

        expect(scope.mapCtrl.profile).toBeDefined();
    });

    it("should set the opus attribute of the current scope when init is called", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));

        scope.mapCtrl.init();
        scope.$apply();

        expect(scope.mapCtrl.opus).toBeDefined();
    });

    it("should specify the overlay layer for the profile when init is called", function () {
        profileDefer.resolve(JSON.parse(getProfileResponse));

        scope.mapCtrl.init();
        scope.$apply();

        var layers = [];
        scope.mapCtrl.map.getMapImpl().eachLayer(function (layer) { layers.push(layer) });

        expect(layers.length).toBe(3); // 2 base layers plus the occurrence layer

        expect(layers[2]._url).toBe("http://biocacheWmsUrl/ws/mapping/wms/reflect?q=lsid%3Aguid1");
        expect(layers[2].options.attribution).toBe("mapAttr1");
    });

    it("should raise an alert message when the call to getProfile fails", function () {
        profileDefer.reject();

        scope.mapCtrl.init();
        scope.$apply();

        expect(messageService.alert).toHaveBeenCalledWith("An error occurred while retrieving the map information.");
    });

});