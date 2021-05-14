/*
 * Copyright (C) 2021 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 * 
 * Created by Temi on 13/5/21.
 */
describe('Directive: ckeditor', function () {
    var scope, compile;
    var validTemplate = '<div class="cknode"><textarea ng-model="data" ckeditor="richTextFullToolbar"></textarea><div>';

    var util, element, testScope;

    beforeAll(function () {
        console.log("****** ckeditor Directive Tests ******");
    });
    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(function (done) {
        module('profileEditor');

        inject(function ($compile, $rootScope, _$sessionStorage_, _util_) {
            testScope = $rootScope.$new();
            compile = $compile;
            util = _util_;
            testScope.data = "<p>Test</p>";

            element = angular.element(validTemplate);
            $compile(element)(testScope);

            testScope.$digest();

            element.find("textarea").on("ckeditor:ready", function () {
                done();
            })
        });

    });

    it("toolbar should have all items", function() {
        var ck = element.find(".ck.ck-toolbar__items");
        expect(ck[0].children.length).toBe( testScope.richTextFullToolbar.toolbar.items.length );
    });

    it("editor should be updated when model changes", function (done) {
        element.find("textarea").on("ckeditor:editorupdated", function (event, data) {
            if (data.value == testScope.data) {
                setTimeout(function () {
                    var ck = element.find(".ck.ck-content.ck-editor__editable");
                    expect(ck[0].innerHTML).toBe(testScope.data);
                    done();
                },0)
            }
        });
        testScope.data = "<p>Changed</p>";
    });

    it("adding image should appear on editor in div wrapper", function (done) {
        testScope.data = "<p> a test</p><img src='https://via.placeholder.com/150' alt='test' class='' />";
        element.find("textarea").on("ckeditor:editorupdated", function (event, data) {
            if (data.value == testScope.data) {
                setTimeout(function () {
                    var ck = element.find(".ck.ck-content.ck-editor__editable");
                    var img = ck.find('img');
                    expect(img.length).toBe(1);
                    expect(img[0].parentNode.tagName).toBe("DIV")
                    done();
                },0)
            }
        });
    });

    it("model should be updated when user adds content", function (done) {
        var text = "model updated",
            htmlText = "<p>" + text + "</p>";
        addEditorToPage(element);

        element.find("textarea").on("ckeditor:modelupdated", function (event, data) {
            if(data.value == htmlText) {
                setTimeout(function () {
                    expect(testScope.data).toBe(htmlText);
                    done();
                }, 0);
            }
        });

        setTimeout(function () {
            var editor = element.find(".ck.ck-content.ck-editor__editable:last");
            editor.focus();
            document.execCommand('selectAll');
            document.execCommand('delete');
            document.execCommand('insertText', false, text);
        },0);
    });

    function addEditorToPage(editor) {
        var body = angular.element(document).find("body");
        element.appendTo(body);
    }
});