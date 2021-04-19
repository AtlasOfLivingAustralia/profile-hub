describe("MessageService tests", function () {
    var service;
    var rootScope;

    beforeAll(function () {
        console.log("****** Message Service Tests ******")
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(module("profileEditor"));

    beforeEach(inject(function (_messageService_, _$rootScope_) {
        service = _messageService_;
        rootScope = _$rootScope_;
        spyOn(rootScope, '$emit');
    }));

    it("should add a new success message to the root scope when success is called", function () {
        service.success("test success message");

        expect(rootScope.$emit).toHaveBeenCalledWith('displayAlerts', [{ type: 'success', msg: 'test success message' }], undefined);
    });

    it("should add a new success message to the root scope when success is called and keeping previous message", function () {
        service.success("test success message", true);

        expect(rootScope.$emit).toHaveBeenCalledWith('displayAlerts', [{ type: 'success', msg: 'test success message' }], true);
    });

    it("should add a new info message to the root scope when info is called", function () {
        service.info("test info message");

        expect(rootScope.$emit).toHaveBeenCalledWith('displayAlerts', [{ type: 'info', msg: 'test info message' }], undefined);
    });

    it("should add a new alert message to the root scope when alert is called", function () {
        service.alert("test alert message");

        expect(rootScope.$emit).toHaveBeenCalledWith('displayAlerts', [{ type: 'danger', msg: 'test alert message' }], undefined);
    });

    it("should add a new warning message to the root scope when alert is called", function () {
        service.warning("test warning message");

        expect(rootScope.$emit).toHaveBeenCalledWith('displayAlerts', [{ type: 'warning', msg: 'test warning message' }], undefined);
    });
});

