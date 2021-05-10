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

    // CKEDITOR.plugins.addExternal('alaToolbar', config.contextPath + '/assets/ckeditor/plugins/alaToolbar/');
    //
    // CKEDITOR.plugins.addExternal('ngImage', config.contextPath + '/assets/ckeditor/plugins/ngImage/');
    //
    // // use HTML4 elements for Jasper compatibility.
    // CKEDITOR.config.coreStyles_bold = { element: 'b', overrides: 'strong' };
    // CKEDITOR.config.coreStyles_italic = { element: 'i', overrides: 'em' };
    // CKEDITOR.config.coreStyles_strike = { element: 'strike', overrides: 's' };
    //
    // // CKEditor uses 'Allowed Content Filtering' (ACF), which defines what html elements are allowed in the text, and
    // // what attributes and classes those elements can have. The 'extraAllowedContent' config item lets you add extra
    // // allowed elements on top of the defaults.
    // // Any element, class or attribute not explicitly listed will be removed by the editor.
    // // The format is tag(css classes comma-separated)[attributes].
    // //
    // // Image tags are not allowed unless the images ckeditor plugin in included, but we don't want to use that because
    // // we need to use our own angular controllers/directives to manage images for the whole profile.
    // CKEDITOR.config.extraAllowedContent = 'img(thumbnail,inline-attribute-image,small,medium,large,pull-left,pull-right)[src,class,alt]';

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
        // extraPlugins: 'symbol,alaToolbar,ngImage,autogrow',
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
            // 'Image',
            // 'ImageStyle',
            // 'ImageToolbar',
            // 'ImageTextAlternative',
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
                'redo',
                '|'
            ]
        }
    };
});

