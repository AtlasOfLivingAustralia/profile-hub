// Karma configuration
// Generated on Mon Feb 23 2015 15:47:55 GMT+1100 (AEDT)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        plugins: [
            'karma-chrome-launcher',
            // 'karma-jquery',
            'karma-jasmine',
            // 'karma-jasmine-jquery',
            'karma-ng-html2js-preprocessor',
            'karma-coverage',
            // 'karma-firefox-launcher',
            'karma-phantomjs-launcher'
        ],


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'grails-app/assets/javascripts/profileEditor/**/*.js': ['coverage'],
            'grails-app/assets/javascripts/profileEditor/templates/*.tpl.htm': ['ng-html2js']
        },

        ngHtml2JsPreprocessor: {
            cacheIdFromPath: function(filepath) {
                // The URL defined in the template is /profileEditor/ (because there is an asset pipeline plugin that automatically adds them to the cache under this name).
                // This function rewrites the requested URL to the actual relative path to the template files
                return filepath.replace(/grails\-app\/assets\/javascripts\/profileEditor\/templates\/(.*)\.tpl\.htm/, "/profileEditor/$1.htm");
            },

            // setting this option will create only a single module that contains templates
            // from all the files, so you can load them all with module('foo')
            moduleName: 'profileEditor'
        },

        // list of files / patterns to load in the browser
        files: [
            'node_modules/jasmine-data_driven_tests/src/all.js',
            'https://cdn.jsdelivr.net/gh/AtlasOfLivingAustralia/ala-map-plugin/web-app/vendor/jquery-2.1.4/jquery-2.1.4.min.js',
            'https://cdn.jsdelivr.net/gh/AtlasOfLivingAustralia/ala-map-plugin/web-app/vendor/leaflet-0.7.7/leaflet.js',
            'https://cdn.jsdelivr.net/gh/AtlasOfLivingAustralia/ala-map-plugin/web-app/vendor/Leaflet.Coordinates-0.1.5/Leaflet.Coordinates-0.1.5.min.js',
            'https://cdn.jsdelivr.net/gh/AtlasOfLivingAustralia/ala-map-plugin/web-app/vendor/Leaflet.loading-0.1.16/Control.Loading.js',
            'https://cdn.jsdelivr.net/gh/AtlasOfLivingAustralia/ala-map-plugin/web-app/vendor/Leaflet.EasyButton-1.2.0/easy-button.js',
            'https://cdn.jsdelivr.net/gh/AtlasOfLivingAustralia/ala-map-plugin/web-app/vendor/urijs-1.18.0/URI.js',
            'https://cdn.jsdelivr.net/gh/AtlasOfLivingAustralia/ala-map-plugin/web-app/js/layers/SmartWmsLayer.js',
            'https://cdn.jsdelivr.net/gh/AtlasOfLivingAustralia/ala-map-plugin/web-app/js/Map.js',
            'https://cdn.jsdelivr.net/gh/AtlasOfLivingAustralia/ala-map-plugin/web-app/js/OccurrenceMap.js',
            'grails-app/assets/thirdparty/modernizr/modernizer.js',
            'grails-app/assets/thirdparty/angular/angular-1.3.20.js',
            'grails-app/assets/thirdparty/angular/angular-sanitize-1.3.20.js',
            'grails-app/assets/thirdparty/angular/angular-animate-1.3.20.js',
            'src/test/js/thirdparty/angular-mocks-1.3.20.js',
            'grails-app/assets/thirdparty/angular/ui-bootstrap-tpls-0.14.3.js',
            'grails-app/assets/thirdparty/angular-bootstrap-colorpicker-3.0.11/js/bootstrap-colorpicker-module.min.js',
            'grails-app/assets/thirdparty/angular-bootstrap-show-errors/showErrors.js',
            'grails-app/assets/thirdparty/ng-file-upload/ng-file-upload-shim-5.0.7.min.js',
            'grails-app/assets/thirdparty/ng-file-upload/ng-file-upload-5.0.7.min.js',
            'grails-app/assets/thirdparty/angular-leaflet/angular-leaflet-directive.min.js',
            'grails-app/assets/thirdparty/angular-loading-bar/loading-bar-0.7.1.min.js',
            'grails-app/assets/thirdparty/ckeditor/ng-ckeditor-0.2.1.js',
            'grails-app/assets/thirdparty/ckeditor/ckeditor.js',
            'grails-app/assets/thirdparty/google-diff-match-patch/diff_match_patch.js',
            'grails-app/assets/thirdparty/angular-scroll/angular-scroll.min.js',
            'grails-app/assets/thirdparty/checklist-model/checklist-model-0.2.4.js',
            'grails-app/assets/thirdparty/angular-truncate/truncate.js',
            'grails-app/assets/thirdparty/angular-inview/angular-inview-1.5.6.js',
            'grails-app/assets/thirdparty/ngStorage/ngStorage-0.3.10.min.js',
            'grails-app/assets/thirdparty/underscore/underscore-1.8.3.min.js',
            'grails-app/assets/thirdparty/dualMultiselect/dualmultiselect.min.js',
            'grails-app/assets/javascripts/profileEditor/profiles.js',
            'grails-app/assets/javascripts/profileEditor/utils/*.js',
            'grails-app/assets/javascripts/profileEditor/services/*.js',
            'grails-app/assets/javascripts/profileEditor/controllers/*.js',
            'grails-app/assets/javascripts/profileEditor/templates/*.tpl.htm',
            'grails-app/assets/javascripts/profileEditor/directives/*.js',
            'src/test/js/specs/MockConfigModule.js',
            'src/test/js/specs/**/*.js'
        ],
        crossOriginAttribute: true,


        // list of files to exclude
        exclude: [],


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_DEBUG,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            'Chrome',
            // 'Firefox',
            'PhantomJS'
        ],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Testing whether phantomjs travis tests are more reliable...
        browserNoActivityTimeout: 30000,
        browserDisconnectTolerance: 2
    });
};
