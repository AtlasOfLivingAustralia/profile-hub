describe('Directive: FallbackDatePicker', function () {

  var elm,
      scope;

  beforeEach(module('profileEditor'));

  beforeEach(inject(function ($compile, $rootScope) {
    scope = $rootScope.$new();
    scope.testModel = {
      someDate: null
    };
  }));

  function compileDirective(tpl) {
    // function to compile a fresh directive with the given template, or a default one
    // compile the tpl with the $rootScope created above
    // wrap our directive inside a form to be able to test
    // that our form integration works well (via ngModelController)
    // our directive instance is then put in the global 'elm' variable for further tests
    // note: use format="yyyy-MM-dd" so that we can set the <input> value using the same format for both html5 and uib-datepicker
    if (!tpl) tpl = '<fallback-date-picker ng-model="testModel.someDate" format="yyyy-MM-dd"></fallback-date-picker>';
    tpl = '<div><form name="form">' + tpl + '</form></div>';
    // inject allows you to use AngularJS dependency injection
    // to retrieve and use other services
    inject(function($compile) {
      var form = $compile(tpl)(scope);
      elm = form.find('fallback-date-picker');
    });
    // $digest is necessary to finalize the directive generation
    scope.$digest();
  }

  describe('initialisation', function() {
    // before each test in this block, generates a fresh directive
    beforeEach(function() {
      compileDirective();
    });
    // a single test example, check the produced DOM
    it('should produce 1 input', function() {
      expect(elm.find('input').length).toEqual(1);
    });
    it('should check validity on init', function() {
      expect(scope.form.$valid).toBeTruthy();
    });
    it('should add a fallback button if date inputs are not supported', function() {
      var expectedButtons = Modernizr.inputtypes.date ? 0 : 1;
      expect(elm[0].querySelectorAll('.input-group-btn > button').length).toEqual(expectedButtons);
    });
  });

  describe('data binding', function() {
    // before each test in this block, generates a fresh directive
    beforeEach(function() {
      compileDirective();
    });

    it('should update the element', function() {
      var date = new Date('2015-01-31T00:00:00Z');
      scope.testModel.someDate = date;
      scope.$digest();
      var value = elm.find('input')[0].value;
      expect(value).toEqual('2015-01-31');
    });

    it('should update the model', function() {
      var date = new Date(2015,0,31,0,0,0);
      var input = elm.find('input');
      input[0].value = '2015-01-31'; // html date input only accepts this format
      input.triggerHandler('input');
      scope.$digest();
      // hack the equality comparison because phantom is doing a UTC conversion at some point.
      expect(scope.testModel.someDate.getYear()).toEqual(date.getYear());
      expect(scope.testModel.someDate.getMonth()).toEqual(date.getMonth());
      expect(scope.testModel.someDate.getDay()).toEqual(date.getDay());
    });
  });

});