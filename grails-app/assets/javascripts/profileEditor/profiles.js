var profileEditor = angular.module('profileEditor', ['app.config', 'ngSanitize', 'ui.bootstrap', 'colorpicker.module', 'angular-loading-bar', 'duScroll', 'ngFileUpload', 'checklist-model', 'ngCkeditor', 'angular-inview', 'ngStorage', 'truncate', 'dualmultiselect', 'ui.bootstrap.showErrors', 'ngAnimate']);

profileEditor.config(function ($rootScopeProvider) {
    // The digest ttl has been bumped to 20 because the taxonomy directive in the sidebar renders
    // the taxonomy tree which uses ng-include to render the taxon nodes.  The number of compile/digest cycles
    // this triggers pushes the count over 10 on the initial display of the component.  Alternatively, inlining
    // one of the ng-includes in taxonomy.html (the 'taxonName.html' template) will bring it back under 10.
    $rootScopeProvider.digestTtl(20);
});

// enabled / disable debug mode
profileEditor.config(function (config, $logProvider, $compileProvider) {
    var debugMode = config.development || false;
    $logProvider.debugEnabled(debugMode);
    $compileProvider.debugInfoEnabled(debugMode);
    // Angular 1.5(?)
    // $compileProvider.commentDirectivesEnabled(false);
    // $compileProvider.cssClassDirectivesEnabled(false);
});

profileEditor.config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
}]);

profileEditor.run(function ($rootScope, config) {
    $rootScope.config = config;

    $rootScope.richTextNoFormatting = {
        language: 'en',
        removePlugins: 'toolbar',
        height: 50
    };
    $rootScope.richTextSingleLine = { // this name is used as a constant to hack in some features
        language: 'en',
        height: 'auto',
        toolbar: {
            items: [
                'bold',
                'italic',
                'underline',
                'subscript',
                'superscript'
            ]
        }
    };
    $rootScope.richTextSmall = {
        language: 'en',
        class: 'single-line',
        toolbar: {
            items: [
                'bold',
                'italic',
                'underline',
                'subscript',
                'superscript'
            ]
        }
    };

    $rootScope.richTextSimpleToolbar = {
        language: 'en',
        class: 'three-line',// font-size 15px * 1.5em line height + 10px margin bottom per <p> for 3 lines
        toolbar: {
            items: [
                'bold',
                'italic',
                'underline',
                'subscript',
                'superscript'
            ]
        }
    };

    $rootScope.richTextFullToolbar = {
        language: 'en',
        class: 'four-line', // font-size 15px * 1.5em line height + 10px margin bottom per <p> for 4 lines
        plugins: [
            'Heading',
            'Bold',
            'Italic',
            'Underline',
            'Strikethrough',
            'Subscript',
            'Superscript',
            'SpecialCharacters',
            'Link',
            'List',
            'Indent',
            'FontBackgroundColor',
            'FontColor',
            'InsertImage',
            'Essentials'
        ],
        toolbar: {
            items: [
                'heading',
                '|',
                'bold',
                'italic',
                'underline',
                'strikethrough',
                'subscript',
                'superscript',
                'specialCharacters',
                'link',
                '|',
                'bulletedList',
                'numberedList',
                'outdent',
                'indent',
                '|',
                'fontBackgroundColor',
                'fontColor',
                '|',
                'insertImage',
                '|',
                'undo',
                'redo'
            ]
        }
    };

    $rootScope.richTextFullToolbarForComment = {
        language: 'en',
        class: 'four-line', // font-size 15px * 1.5em line height + 10px margin bottom per <p> for 4 lines
        plugins: [
            'Heading',
            'Bold',
            'Italic',
            'Underline',
            'Strikethrough',
            'Subscript',
            'Superscript',
            'SpecialCharacters',
            'Link',
            'List',
            'Indent',
            'FontBackgroundColor',
            'FontColor',
            'Essentials'
        ],
        toolbar: {
            items: [
                'heading',
                '|',
                'bold',
                'italic',
                'underline',
                'strikethrough',
                'subscript',
                'superscript',
                'specialCharacters',
                'link',
                '|',
                'bulletedList',
                'numberedList',
                'outdent',
                'indent',
                '|',
                'fontBackgroundColor',
                'fontColor',
                '|',
                'undo',
                'redo'
            ]
        }
    };
});

