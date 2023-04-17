profileEditor.directive('vocabularyEditor', function ($browser) {
    return {
        restrict: 'AE',
        require: [],
        scope: {
            vocabId: '=',
            vocabType: '=',
            groupVocabId: '=',
            vocabName: '@',
            allowReordering: '@',
            allowMandatory: '@',
            allMandatory: '@',
            allowCategories: '@',
            allowStrictSelection: '@',
            allowReplacement: '@',
            allowGrouping: '@',
            allowDataType: '@',
            helpUrl: '@',
            sharedObject: '='
        },
        templateUrl: '/profileEditor/vocabularyEditor.htm',
        controller: ['$scope', 'profileService', 'util', 'messageService', '$modal', '$filter', '$rootScope', function ($scope, profileService, util, messageService, $modal, $filter, $rootScope) {

            $scope.opusId = util.getEntityId("opus");
            $scope.saving = false;
            $scope.newVocabTerm = null;
            $scope.vocabulary = null;
            $scope.groupVocabulary = null;
            $scope.constraintListVocab = null;
            $scope.replacements = [];
            $scope.allowReordering = true;
            $scope.allowMandatory = true; // allow the user to choose whether a term is mandatory or optional
            $scope.allowCategories = true; // allow the user to categorise terms as Name, Summary, etc
            $scope.allowStrictSelection = true; // show or hide vocab's strict selector
            $scope.allowReplacement = true;
            $scope.allowGrouping = false;
            $scope.allowDataType = false;
            $scope.allMandatory = false; // force all terms to be mandatory
            $scope.dataTypes = ['text', 'number', 'range', 'list'];
            if($scope.sharedObject)
                $scope.sharedObject.directiveScope = $scope;

            var capitalize = $filter("capitalize");
            var orderBy = $filter("orderBy");

            $scope.addVocabTerm = function (form) {
                if ($scope.newVocabTerm) {
                    if (termExists($scope.newVocabTerm)) {
                        messageService.alert("The specified term already exists. Terms must be unique across the attribute vocabulary.");
                    } else {
                        $scope.vocabulary.terms.push({termId: "",
                            name: capitalize($scope.newVocabTerm),
                            order: $scope.vocabulary.terms.length,
                            required: $scope.allMandatory ? true : false,
                            containsName: false,
                            summary: false
                        });
                        $scope.newVocabTerm = "";
                        sortVocabTerms();
                        form.$setDirty();
                    }
                }
            };

            $scope.removeVocabTerm = function (index, form) {
                var promise = profileService.findUsagesOfVocabTerm($scope.opusId, $scope.vocabId, $scope.vocabulary.terms[index].termId);
                promise.then(function (data) {
                        if (data.usageCount == 0 &&
                                $filter('filter')($scope.replacements, {'newTermName':$scope.vocabulary.terms[index].name}).length == 0) {
                            var deletedItemOrder = $scope.vocabulary.terms[index].order;
                            $scope.vocabulary.terms.splice(index, 1);

                            angular.forEach($scope.vocabulary.terms, function(term) {
                                if (term.order > deletedItemOrder) {
                                    term.order = term.order - 1;
                                }
                            });

                            sortVocabTerms();

                            form.$setDirty();
                        } else {
                            if($scope.allowReplacement) {
                                showRemoveTermPopup(data, index, form)
                            }
                            else {
                                messageService.alert("Cannot delete term since it is used at least once. Remove linkage to delete the term.");
                            }
                        }
                    },
                    function() {
                        messageService.alert("An error occurred while checking if the term is in use.");
                    });
            };

            function showRemoveTermPopup(data, existingTermIndex, form) {
                var popup = $modal.open({
                    templateUrl: "/profileEditor/removeTermPopup.htm",
                    controller: "RemoveTermController",
                    controllerAs: "removeTermCtrl",
                    size: "md",
                    resolve: {
                        usageData: function() {
                            return data
                        },
                        existingTerm: function() {
                            return $scope.vocabulary.terms[existingTermIndex];
                        },
                        terms: function() {
                            var terms = [];
                            var itemToDel = $scope.vocabulary.terms[existingTermIndex];
                            var deletedItemOrder = $scope.vocabulary.terms[existingTermIndex].order;
                            angular.forEach($scope.vocabulary.terms, function(term) {
                                if ($filter('filter')($scope.replacements, {'existingTermId':term.termId}).length == 0 &&
                                    term.termId != itemToDel.termId) {
                                    terms.push(term);
                                }
                            });

                            angular.forEach(terms, function(term) {
                                if (term.order > deletedItemOrder) {
                                    term.order = term.order - 1;
                                }
                            });
                            angular.forEach($scope.vocabulary.terms, function(term) {
                                if (term.order > deletedItemOrder) {
                                    term.order = term.order - 1;
                                }
                            });
                            return terms;
                        },
                        form: function() {
                            return form;
                        }
                    }
                });

                popup.result.then(function(data) {
                    $scope.replacements.push({vocabId: $scope.vocabId, existingTermId: data.existing.termId, newTermName: data.new.name});

                    form.$setDirty();
                });
            }

            $scope.showConstraintListVocab = function(term, form) {
                var popup = $modal.open({
                    templateUrl: "/profileEditor/addVocabularyPopup.htm",
                    controller: "AddVocabularyPopupController",
                    controllerAs: "addVocabularyPopupCtrl",
                    size: "md",
                    resolve: {
                        vocabId: function() {
                            return term.constraintListVocab;
                        }
                    }
                });

                popup.result.then(function(data) {
                    term.constraintListVocab = data.vocabId;

                    form.$setDirty();
                });
            }

            $scope.termIsInReplacementList = function(term) {
                var match = false;
                angular.forEach($scope.replacements, function(item) {
                    if (item.existingTermId == term.termId) {
                        match = true;
                    }
                });
                return match
            };

            $scope.editVocabTerm = function(index, form) {
                var popup = $modal.open({
                    templateUrl: "/profileEditor/editTermPopup.htm",
                    controller: "VocabModalController",
                    controllerAs: "vocabModalCtrl",
                    size: "md",
                    resolve: {
                        term: function() {
                            return angular.copy($scope.vocabulary.terms[index]);
                        }
                    }
                });

                popup.result.then(function(updatedTerm) {
                    if (termExists(updatedTerm.name)) {
                        messageService.alert("The specified term already exists. Terms must be unique across the attribute vocabulary.");
                    } else {
                        $scope.vocabulary.terms[index] = updatedTerm;
                        form.$setDirty();
                    }
                });
            };

            function termExists(termToCheck) {
                var result = false;
                for (var i = $scope.vocabulary.terms.length - 1; i >= 0; i--) {
                    if ($scope.vocabulary.terms[i].name === capitalize(termToCheck)) {
                        result = true;
                        break;
                    }
                }
                return result;
            }

            $scope.initVocab = function(){
                $scope.vocabulary = {
                    name: 'Vocab constraint list',
                    terms: []
                }
            }

            $scope.saveVocabulary = function (form) {
                var promise;
                if ($scope.vocabId) {
                    promise = profileService.updateVocabulary($scope.opusId, $scope.vocabId, $scope.vocabulary);
                } else {
                    promise = profileService.createVocabulary($scope.opusId, $scope.vocabulary);
                    promise.then(function(data){
                        $scope.vocabId = data.vocabId;
                    });
                }

                promise.then(function () {
                        if ($scope.replacements.length > 0) {
                            var promise = profileService.replaceUsagesOfVocabTerm($scope.opusId, $scope.vocabId, $scope.replacements);
                            promise.then(function() {
                                console.log("Replacements saved");

                                $scope.loadVocabulary(form);
                                messageService.success("Vocabulary successfully updated.");
                            })
                        } else {
                            $scope.loadVocabulary(form);
                            messageService.success("Vocabulary successfully updated.");
                        }

                        $rootScope.$emit('refresh-group-vocab');
                    },
                    function () {
                        messageService.alert("An error occurred while updating the vocabulary.");
                    }
                );

                return promise;
            };

            $scope.loadVocabulary = function(form) {
                messageService.info("Loading vocabulary...");
                $scope.replacements = [];

                var promise = profileService.getOpusVocabulary($scope.opusId, $scope.vocabId);
                promise.then(function (data) {
                        $scope.vocabulary = data;

                        sortVocabTerms();

                        if (form) {
                            form.$setPristine()
                        }
                    },
                    function () {
                        messageService.alert("An error occurred while loading the vocabulary.");
                    }
                );
            };

            $scope.loadGroupVocabulary = function(form) {
                if ($scope.groupVocabId) {
                    messageService.info("Loading group by vocabulary...");
                    $scope.replacements = [];

                    var promise = profileService.getOpusVocabulary($scope.opusId, $scope.groupVocabId);
                    promise.then(function (data) {
                            data.terms = sortTerms(data.terms, true);
                            $scope.groupVocabulary = data;
                        },
                        function () {
                            messageService.alert("An error occurred while loading the group by vocabulary.");
                        }
                    );
                }
            };

            $scope.summaryChanged = function(selectedIndex) {
                $scope.vocabulary.terms.forEach(function (term, index) {
                    if (index != selectedIndex) {
                        term.summary = false;
                    }
                });
            };

            $scope.moveTermUp = function(index, form) {
                if (index > 0) {
                    $scope.vocabulary.terms[index].order = $scope.vocabulary.terms[index].order - 1;
                    $scope.vocabulary.terms[index - 1].order = $scope.vocabulary.terms[index - 1].order + 1;

                    sortVocabTerms();

                    form.$setDirty();
                }
            };

            $scope.moveTermDown = function(index, form) {
                if (index < $scope.vocabulary.terms.length) {
                    $scope.vocabulary.terms[index].order = $scope.vocabulary.terms[index].order + 1;
                    $scope.vocabulary.terms[index + 1].order = $scope.vocabulary.terms[index + 1].order - 1;

                    sortVocabTerms();

                    form.$setDirty();
                }
            };

            function sortVocabTerms() {
                $scope.vocabulary.terms = sortTerms($scope.vocabulary.terms, $scope.allowReordering);
            }

            function sortTerms(terms, allowReordering) {
                if (allowReordering) {
                    terms = orderBy(terms, "order");
                } else {
                    terms = orderBy(terms, "name");
                }
                angular.forEach(terms, function(term, index) {
                    term.order = index;
                });

                return terms
            }

            $scope.sortAlphabetically = function(form) {
                $scope.vocabulary.terms = orderBy($scope.vocabulary.terms, "name");
                angular.forEach($scope.vocabulary.terms, function(term, index) {
                    term.order = index;
                });

                form.$setDirty();
            };
            $rootScope.$on('refresh-group-vocab', $scope.loadGroupVocabulary);
        }],
        link: function (scope, element, attrs, ctrl) {
            scope.$watch("vocabId", function(newValue) {
                if (newValue !== undefined && newValue !== null) {
                    scope.loadVocabulary();
                } else {
                    scope.initVocab();
                }
            });
            scope.$watch("groupVocabId", function(newValue) {
                if (newValue !== undefined && newValue !== null) {
                    scope.loadGroupVocabulary();
                }
            });
            scope.$watch("allowMandatory", function(newValue) {
                scope.allowMandatory = isTruthy(newValue);
            });
            scope.$watch("allowCategories", function(newValue) {
                scope.allowCategories = isTruthy(newValue);
            });
            scope.$watch("allowStrictSelection", function(newValue) {
                scope.allowStrictSelection = isTruthy(newValue);
            });
            scope.$watch("allowGrouping", function(newValue) {
                scope.allowGrouping = isTruthy(newValue);
            });
            scope.$watch("allowReplacement", function(newValue) {
                scope.allowReplacement = isTruthy(newValue);
            });
            scope.$watch("allowDataType", function(newValue) {
                scope.allowDataType = isTruthy(newValue);
            });
            scope.$watch("allowReordering", function(newValue) {
                scope.allowReordering = isTruthy(newValue);
            });

            function isTruthy(str) {
                return str == true || str === "true"
            }
        }
    }
});


/**
 * Edit Vocab Term modal dialog controller
 */
profileEditor.controller('VocabModalController', function ($modalInstance, term) {
    var self = this;

    self.term = term;

    self.ok = function() {
        if (term.name.length > 0) {
            $modalInstance.close(self.term);
        }
    };

    self.cancel = function() {
        $modalInstance.dismiss("cancel");
    }
});

/**
 * Replace Vocab Term modal dialog controller
 */
profileEditor.controller('RemoveTermController', function ($modalInstance, usageData, existingTerm, terms) {
    var self = this;

    self.terms = terms;
    self.usageCount = usageData.usageCount;
    self.existingTerm = existingTerm;
    self.newTerm = null;

    self.ok = function() {
        $modalInstance.close({existing: self.existingTerm, new: self.newTerm});
    };

    self.cancel = function() {
        $modalInstance.dismiss("cancel");
    }
});

profileEditor.controller('AddVocabularyPopupController', function ($modalInstance, $scope, vocabId) {
    var self = this;

    $scope.vocabId = vocabId;
    $scope.sharedObject = {};

    self.ok = function() {
        if ($scope.ListVocabularyForm.$dirty && $scope.sharedObject.directiveScope) {
            var promise = $scope.sharedObject.directiveScope.saveVocabulary($scope.ListVocabularyForm);
            promise.then(function (data) {
                $modalInstance.close({vocabId: data.vocabId});
            });
        } else {
            $modalInstance.close({vocabId: $scope.vocabId});
        }
    };

    self.cancel = function() {
        $modalInstance.dismiss("cancel");
    }
});