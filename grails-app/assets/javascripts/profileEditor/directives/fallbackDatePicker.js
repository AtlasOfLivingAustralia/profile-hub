profileEditor.directive('fallbackDatePicker', function () {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      'ngModel': '=',
      'ngRequired': '=?',
      'dateOptions': '=?fallbackOptions',
      'size': '@',
      'format': '@',
      'fieldId': '@'
    },
    bindToController: true,
    templateUrl: '/profileEditor/fallbackDatePicker.htm',
    controllerAs: 'ctrl',
    controller: function() {

      var self = this;

      self.format = self.format || "dd/MM/yyyy"; // TODO user locale -> date format.
      self.size = self.size || '';
      self.dateOptions = self.dateOptions || {};
      self.dateOptions.type = self.dateOptions.type || 'date';
      if (angular.isUndefined(self.dateOptions.datepickerAppendToBody) || self.dateOptions.datepickerAppendToBody === null) { self.dateOptions.datepickerAppendToBody = false; }
      if (angular.isUndefined(self.dateOptions.showButtonBar) || self.dateOptions.showButtonBar === null) { self.dateOptions.showButtonBar = true; }

      switch (self.size) {
        case 'small':
          self.inputClass = 'form-control-sm';
          self.btnClass = 'btn-sm';
          break;
        default:
          self.inputClass = '';
          self.btnClass = '';
      }

      self.datePopupOpen = false;

      self.openDatePicker = function($event) {
        if ($event) {
          $event.preventDefault();
          $event.stopPropagation();
        }
        self.datePopupOpen = true;
      };

      self.isDateInputSupported = Modernizr.inputtypes.date;
    }
  };
});
/* Add a formatter for date inputs that transforms the input from a string to a Date object */
profileEditor.directive("input", function() {
  return {
    require: '^?ngModel',
    link: function(scope, elem, attr, modelCtrl) {
      if (attr['type'] === 'date'){
        modelCtrl.$formatters.push(function(modelValue) {
          if (modelValue instanceof Date) {
            return modelValue;
          } else if (modelValue){
            return new Date(Date.parse(modelValue));
          } else {
            return null;
          }
        });
      }

    }
  };
});