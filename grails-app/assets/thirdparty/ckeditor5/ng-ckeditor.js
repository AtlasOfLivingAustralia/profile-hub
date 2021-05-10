'use strict';

(function (angular, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['angular', 'ckeditor'], function (angular) {
            return factory(angular);
        });
    } else {
        return factory(angular);
    }
}(angular || null, function (angular) {
    var app = angular.module('ngCkeditor', []);
    var $defer, loaded = false;

    app.run(['$q', '$timeout', function ($q, $timeout) {
        $defer = $q.defer();

        if (angular.isUndefined(ClassicEditor)) {
            throw new Error('CKEDITOR not found');
        }

        loaded = true;
        $defer.resolve();

        // CKEDITOR.disableAutoInline = true;

        // function checkLoaded() {
        //   if (ClassicEditor.state === 'ready') {
        //     loaded = true;
        //     $defer.resolve();
        //   }
        //   else {
        //     $timeout(checkLoaded, 100);
        //   }
        // }
        //
        // ClassicEditor.on('ready', checkLoaded);
        // $timeout(checkLoaded, 100);
    }]);

    app.directive('ckeditor', ['$timeout', '$q', '$log', function ($timeout, $q, $log) {

        return {
            restrict: 'AC',
            require: ['ngModel', '^?form'],
            scope: false,
            link: function (scope, element, attrs, ctrls) {
                var ngModel = ctrls[0];
                var form = ctrls[1] || null;
                var EMPTY_HTML = '<p></p>',
                    data = [];

                var onLoad = function () {
                    var options = {
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
                        },
                        language: 'en',
                        // image: {
                        //     toolbar: [
                        //         'imageTextAlternative',
                        //         'imageStyle:full',
                        //         'imageStyle:side'
                        //     ]
                        // },
                        licenseKey: ''
                    };

                    options = angular.extend(options, scope[attrs.ckeditor]);

                    if (options.plugins && options.plugins.indexOf('SpecialCharacters') > -1) {
                        options.plugins.push(SpecialCharactersForProfiles);
                    }

                    var instance;
                    var instancePromise = ClassicEditor.create(element[0], options).then(function (editor) {
                        instance = editor;
                        setSize(instance, options);
                        instance.setData(ngModel.$viewValue || EMPTY_HTML);
                        instance.model.document.on('change:data', setModelData);

                        // XXX Hack to disallow enter for single line text boxes
                        if (attrs.ckeditor == 'richTextSingleLine') {
                            instance.editing.view.document.on('enter', function (event) {
                                event.stop();
                            });
                        }

                        // XXX Hack work around ngImage plugin using angular.element.scope which is not available outside debug mode.
                        instance.on('insertimage', function(event, data) {
                            if (scope.attrCtrl) {
                                scope.attrCtrl.insertImage(data.callback);
                            } else {
                                $log.debug("insertimage event but not in a scope with attrCtrl available.")
                            }
                        });

                        return editor;
                    })

                    element.bind('$destroy', function () {
                        // instance is the reference to the CHKEditor instance that is to be deleted.
                        if (instance) {
                            instance.destroy();
                        }
                    });

                    var setModelData = function (setPristine) {
                        var data = instance.getData();
                        if (data === '') {
                            data = null;
                        }

                        if (setPristine !== true || data !== ngModel.$viewValue) {
                            ngModel.$setViewValue(data);
                        }

                        if (setPristine === true && form) {
                            form.$setPristine();
                        }
                    }, onUpdateModelData = function (setPristine) {
                        if (!data.length) {
                            return;
                        }

                        instancePromise.then(function (editor) {
                            var item = data.pop() || EMPTY_HTML;
                            editor.setData(item);
                            setModelData(setPristine);
                        })
                    };

                    // instance.on('customConfigLoaded', function() {
                    //   configLoaderDef.resolve();
                    // });

                    ngModel.$render = function () {
                        data.push(ngModel.$viewValue);
                        onUpdateModelData(true);
                    };

                    /**
                     * Add characters needed for content creation.
                     * @param editor
                     * @constructor
                     */
                    function SpecialCharactersForProfiles(editor) {
                        editor.plugins.get('SpecialCharacters').addItems('Characters', [
                            {title: 'Male', character: '\u2642'},
                            {title: 'Female', character: '\u2640'},
                            {title: 'PlusMinus', character: '\u00B1'},
                            {title: 'Endash', character: '\u2013'},
                            {title: 'Degree', character: '\u00B0'},
                            {title: 'Times', character: '\u00D7'}
                        ]);
                    }

                    function setSize(editor, options) {
                        if (editor) {
                            if (angular.isDefined(options.class)) {
                                element[0].parentElement.classList.add( options.class );
                            }
                        }
                    }
                };

                if (angular.isDefined(ClassicEditor)) {
                    loaded = true;
                }
                if (loaded) {
                    onLoad();
                } else {
                    $defer.promise.then(onLoad);
                }
            }
        };
    }]);

    return app;
}));