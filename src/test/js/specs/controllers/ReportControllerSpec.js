describe("ReportController tests", function () {
    var controller;
    var scope;
    var messageService;
    var profileService;
    var util = {
        getQueryParameter: function (param) {
        },
        confirm: function (msg) {
        },
        getEntityId: function (entity) {
            return "1234"
        }
    };
    var config;
    var loadReportDefer;

    var getReportResponse = '{"recordCount":10961,"records":[{"editor":"Unknown","scientificName":"Acetosa","profileId":"32a56222-596d-4da3-b299-d9e423f36d51","lastUpdated":"2015-07-03T04:03:04Z"},{"editor":null,"scientificName":"Abelia x grandiflora","profileId":"f9388454-1b1a-4acb-b0f0-c8e25d722ec5","lastUpdated":"2015-07-03T03:51:30Z"}]}';

    beforeAll(function () {
        console.log("****** Report Controller Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module('profileEditor'));

    beforeEach(inject(function ($controller, $rootScope, _profileService_, $q, _messageService_) {
        scope = $rootScope.$new();
        profileService = _profileService_;
        messageService = jasmine.createSpyObj('_messageService_', ["success", "info", "alert", "pop"]);

        loadReportDefer = $q.defer();

        spyOn(profileService, "loadReport").and.returnValue(loadReportDefer.promise);

        controller = $controller("ReportController as reportCtrl", {
            $scope: scope,
            profileService: profileService,
            util: util,
            config: {},
            messageService: messageService
        });

        controller.selectedReport = scope.reportCtrl.reports[2];
    }));

    it("when dates are reset", function () {
        scope.reportCtrl.dates.to = new Date();
        scope.reportCtrl.dates.from = new Date();

        scope.reportCtrl.clearDates();

        expect(scope.reportCtrl.dates.to).toBeUndefined();
        expect(scope.reportCtrl.dates.from).toBeUndefined();
    });

    it("should load recent updates report", function () {
        var reportId = scope.reportCtrl.reports[2].id;

        loadReportDefer.resolve(JSON.parse(getReportResponse))
        scope.reportCtrl.loadReport(reportId, 0);
        // this is a must to have applied the above result
        scope.$apply()

        expect(profileService.loadReport).toHaveBeenCalled();
        expect(scope.reportCtrl.reportData).toBeDefined();
        expect(scope.reportCtrl.reportData['recordCount']).toBe(10961);
    });

    it("when period is today, last30Days or last7Days - should call loadReport", function () {
        var periods = scope.reportCtrl.periods;
        scope.reportCtrl.selectedReport = scope.reportCtrl.reports[2];
        spyOn(scope.reportCtrl, "loadReport");

        loadReportDefer.resolve(JSON.parse(getReportResponse));
        scope.reportCtrl.setPeriod(periods[0]);
        // this is a must to have applied the above result
        scope.$apply();
        expect(scope.reportCtrl.loadReport).toHaveBeenCalled();

        // last7Days
        scope.reportCtrl.loadReport.calls.reset();
        loadReportDefer.resolve(JSON.parse(getReportResponse));
        scope.reportCtrl.setPeriod(periods[1]);
        // this is a must to have applied the above result
        scope.$apply();
        expect(scope.reportCtrl.loadReport).toHaveBeenCalled();

        // last30Days
        scope.reportCtrl.loadReport.calls.reset();
        loadReportDefer.resolve(JSON.parse(getReportResponse));
        scope.reportCtrl.setPeriod(periods[2]);
        // this is a must to have applied the above result
        scope.$apply();
        expect(scope.reportCtrl.loadReport).toHaveBeenCalled();
    });

    it("when period is custom - should only call loadReport when customLoadReport is called", function () {
        var periods = scope.reportCtrl.periods;
        spyOn(scope.reportCtrl, "loadReport");

        loadReportDefer.resolve(JSON.parse(getReportResponse));
        scope.reportCtrl.setPeriod(periods[3]);
        // this is a must to have applied the above result
        scope.$apply();
        expect(scope.reportCtrl.loadReport.calls.count()).toBe(0);

        // now call customLoadReport
        scope.reportCtrl.dates.to = new Date();
        scope.reportCtrl.dates.from = new Date();
        scope.reportCtrl.loadCustomDateReport();
        // this is a must to have applied the above result
        scope.$apply();
        expect(scope.reportCtrl.loadReport).toHaveBeenCalled();
    });
});