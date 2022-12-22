/**
 * Attributes controller
 */
profileEditor.controller('AttributeEditor', ['profileService', 'util', 'messageService', '$window', '$filter', '$modal', function (profileService, util, messageService, $window, $filter, $modal) {
    var self = this;
    var self = this;

    self.attributes = [];
    self.attributeTitles = [];
    self.allowedVocabulary = [];
    self.historyShowing = {};
    self.vocabularyStrict = false;
    self.supportingAttributes = {};
    self.showSupportingData = false;
    self.currentUser = util.currentUser();
    self.supportingAttributeTitles = [];

    var capitalize = $filter("capitalize");
    var orderBy = $filter("orderBy");
    var filterBy = $filter("filter");

    self.insertImage = function(callback) {
        var popup = $modal.open({
            templateUrl: "/profileEditor/attributeImage.htm",
            controller: "AttributeImageController",
            controllerAs: "attrImgCtrl",
            size: "md",
            resolve: {
                opus: function () {
                    return self.opus;
                },
                profile: function () {
                    return self.profile;
                }
            }
        });

        popup.result.then(function (imageMetadata) {
            var title = imageMetadata.metadata && imageMetadata.metadata.title
            var imageElement = "<img src='" + imageMetadata.thumbnailUrl + "' class='thumbnail inline-attribute-image " + imageMetadata.size + " "  + imageMetadata.position + "' alt='" + title + "'/>";
            var image = {
                "url":  imageMetadata.thumbnailUrl,
                "position": imageMetadata.position,
                "class": "thumbnail inline-attribute-image " + imageMetadata.size + " "  + imageMetadata.position,
                "alt": title
            }

            callback(image);
        });
    };

    self.init = function (edit) {
        self.readonly = edit != 'true';

        self.profileId = util.getEntityId("profile");
        self.opusId = util.getEntityId("opus");

        var profilePromise = profileService.getProfile(self.opusId, self.profileId);
        messageService.info("Loading profile data...");
        profilePromise.then(function (data) {
                self.profile = data.profile;
                self.opus = data.opus;
                self.attributes = data.profile.attributes;
                self.showSupportingData = data.profile.showLinkedOpusAttributes;

                angular.forEach(self.attributes, function(attribute) {
                    attribute.key = util.toKey(attribute.title);
                });

                if (self.opus.supportingOpuses && self.opus.supportingOpuses.length > 0) {
                    self.loadAttributesFromSupportingCollections();
                }

                loadVocabulary();
            },
            function () {
                messageService.alert("An error occurred while retrieving the profile.");
            }
        );
    };

    self.isValid = function (attributeTitle) {
        return !self.vocabularyStrict || (self.vocabularyStrict && self.allowedVocabulary.indexOf(attributeTitle) > -1)
    };

    self.showAttribute = function (attribute) {
        return (self.readonly && !attribute.matchedAsName && self.hasContent(attribute) &&
            (!attribute.fromCollection ||
            (attribute.fromCollection && self.opus.showLinkedOpusAttributes && self.showSupportingData)))
            || (!self.readonly &&
            attribute.fromCollection && self.opus.allowCopyFromLinkedOpus && self.showSupportingData)
    };

    self.addNumber = function (attribute) {
        if(!attribute.numbers) {
            attribute.numbers = [];
        }

        attribute.numbers.push(0);
    };

    self.removeNumber = function (attribute, form, index) {
        if(!attribute.numbers) {
            return
        }

        attribute.numbers.splice(index, 1);
        form.$setDirty();
    };

    self.hasContent = function(attribute) {
        var show = false
        switch (attribute.dataType) {
            case 'number':
                show = attribute.numbers != null;
                break;
            case 'range':
                show = attribute.numberRange && (attribute.numberRange.to != null) && (attribute.numberRange.from != null);
                break;
            case 'singleselect':
            case 'list':
                show = attribute.constraintList && (attribute.constraintList.length > 0);
                break;
            case 'text':
            default:
                show = !!attribute.text;
        }

        return show
    }

    self.getContent = function(attribute) {
        var content
        switch (attribute.dataType) {
            case 'number':
                content = attribute.numbers;
                break;

            case 'range':
                content = attribute.numberRange;
                break;
            case 'singleselect':
            case 'list':
                if(attribute.constraintList) {
                    var list = orderBy(attribute.constraintListExpanded, 'order');
                    var names = [];
                    angular.forEach(attribute.constraintListExpanded, function(item) {names.push(item.name)});
                    content = names.join(', ');
                }
                break;
            case 'text':
            default:
                content = attribute.text;
        }

        return content;
    }

    self.isName = function(attribute) {
        attribute.matchedAsName = util.isNameAttribute(attribute);
    };

    self.attributeChanged = function (attribute) {
        self.isName(attribute)
        attachTermToAttribute(attribute.title, attribute);
    }

    self.showTitleGroup = function (title) {
        var show = false;

        angular.forEach(self.attributes, function (attribute) {
            show = show || (attribute.title == title && self.showAttribute(attribute));
        });

        return show;
    };

    self.isFirstAttributeInGroup = function(title) {
        var show = false;
        if(self.showTitleGroup(title)) {
            var attribute = getAttributeFromTitle(title);
            if (attribute) {
                if (attribute.groupBy) {
                    var itemsInGroup = getGroupAttributes(attribute);
                    show = itemsInGroup.indexOf(attribute) == 0;
                }
            }
        }

        return show;
    }

    self.isLastAttributeInGroup = function(title) {
        var show = false;
        if(self.showTitleGroup(title)) {
            var attribute = getAttributeFromTitle(title);
            if (attribute) {
                if (attribute.groupBy) {
                    var itemsInGroup = getGroupAttributes(attribute);
                    show = itemsInGroup.indexOf(attribute) == (itemsInGroup.length - 1);
                }
            }
        }

        return show;
    }


    function getAttributeFromTitle (title) {
        // get attribute from title
        var attribute = filterBy(self.attributes, function (attribute) {
            return attribute.title == title;
        });

        return attribute && attribute.length > 0 ? attribute[0] : null
    }

    function getGroupAttributes (attribute) {
        if (attribute.groupBy) {
            var itemsInGroup = filterBy(self.attributes, function( item ) {
                return item.groupBy && (item.groupBy.uuid == attribute.groupBy.uuid) && self.showAttribute(item);
            }) || [];

            return itemsInGroup;
        }
    }

    function loadVocabulary() {
        if (self.opus.attributeVocabUuid != null) {
            var vocabPromise = profileService.getOpusVocabulary(self.opusId, self.opus.attributeVocabUuid);
            vocabPromise.then(function (data) {
                self.attributeTitles = [];
                self.allowedVocabulary = [];
                self.attributeVocabTerms = data.terms;
                angular.forEach(data.terms, function (term) {
                    var title = {name: term.name, order: term.order, key: util.toKey(term.name), groupBy: term.groupBy, constraintListVocab: term.constraintListVocab, dataType: term.dataType};
                    if (self.attributeTitles.map(function(t) { return t.name; }).indexOf(title.name) == -1) {
                        self.attributeTitles.push(title);
                        loadConstraintList(title);
                        var attributes = findAttributesByTitle(term.name);
                        attributes.forEach(function(attribute){
                            attribute.titleTerm = title;
                            attribute.constraintList = attribute.constraintList || [];
                        })
                    }
                    if (self.allowedVocabulary.indexOf(term.name) == -1) {
                        self.allowedVocabulary.push(term.name);
                    }
                });

                self.attributeTitles.sort(compareTitles);

                self.vocabularyStrict = data.strict;

                loadMandatoryAttributes(data.terms);
            });
        }
    }

    function attachTermToAttribute(name, attribute){
        var titleTerm = null;

        angular.forEach(self.attributeTitles, function(title){
            if(title.name == name) {
                titleTerm = title;
            }
        });

        attribute.dataType = titleTerm.dataType;
        attribute.titleTerm = titleTerm;
        attribute.constraintList = []
        attribute.numbers = []
        attribute.numberRange = undefined;
    }

    function loadConstraintList(title) {
        if(title.constraintListVocab) {
            // var attribute = findAttributeByTitle(title.name)
            var vocabPromise = profileService.getOpusVocabulary(self.opusId, title.constraintListVocab);
            vocabPromise.then(function (data) {
                title.constraintList = data.terms;
            });
        }
    }

    function getSetConstraintList(attribute, title) {
        console.log(attribute);
        console.log(title);
        debugger;
        var singleselect = title.dataType == 'singleselect'
        return function(){
            debugger;
            var termId = this.termId;
            if(arguments.length == 0) {
                if (attribute.constraintList.indexOf(termId) >= 0){
                    return termId;
                }
                else {
                    return;
                }
            }
            else {
                switch(title.dataType) {
                    case 'singleselect':
                        if(attribute.constraintList.indexOf(termId) == -1) {
                            attribute.constraintList.splice(0, attribute.constraintList.length);
                            attribute.constraintList.push(termId);
                        }
                        break;
                    case 'list':
                        var indexOf = attribute.constraintList.indexOf(termId)
                        if(indexOf == -1) {
                            attribute.constraintList.push(termId);
                        } else {
                            attribute.constraintList.splice(indexOf, 1);
                        }
                        break;
                }
            }
        }
    }

    function loadMandatoryAttributes(vocabularyTerms) {
        if (!self.readonly) {
            var templateAttributes = [];
            angular.forEach(vocabularyTerms, function (term) {
                if (term.required === "true" || term.required == true) {
                    var attribute = findAttributeByTitle(term.name);
                    if (!attribute || attribute.fromCollection) {
                        templateAttributes.push({uuid: "", title: term.name, text: "", order: term.order});
                    }
                }
            });

            self.attributes = orderBy(self.attributes.concat(templateAttributes), 'order');
        }
    }

    function findAttributeByTitle(title) {
        var attribute = null;

        angular.forEach(self.attributes, function(attr) {
            if (attr.title === title) {
                attribute = attr;
            }
        });

        return attribute;
    }

    function findAttributesByTitle(title) {
        var attributes = [];

        angular.forEach(self.attributes, function(attr) {
            if (attr.title === title) {
                attributes.push(attr);
            }
        });

        return attributes;
    }

    function findAttributeVocabByTitle(title) {
        var vocabTerm = null;

        angular.forEach(self.attributeVocabTerms, function(term) {
            if (term.name === title) {
                vocabTerm = term;
            }
        });

        return vocabTerm;
    }


    function compareTitles(left, right) {
        var compare = -1;
        if (left.groupBy || right.groupBy) {
            if (left.groupBy && right.groupBy) {
                if (left.groupBy.order == right.groupBy.order) {
                    compare = left.order < right.order ? -1 : 1;
                } else {
                    compare = left.groupBy.order < right.groupBy.order ? -1 : 1;
                }
            } else if (left.groupBy) {
                compare = -1;
            } else if (right.groupBy) {
                compare = 1;
            }
        } else if (left.order == right.order) {
            compare = left.name.toLowerCase() < right.name.toLowerCase() ? -1 : left.name.toLowerCase() > right.name.toLowerCase();
        } else {
            compare = left.order < right.order ? -1 : 1;
        }
        return compare;
    }

    function NumberRange(){
        this.to = null;
        this.from = null;
        this.toInclusive = true;
        this.fromInclusive = true;
    }

    self.getSetConstraintList = function (attribute, label) {
        return function() {
            var termId = label.termId;

            if(arguments.length == 0) {
                switch(attribute.dataType) {
                    case 'singleselect':
                        return attribute.constraintList.length > 0 ? attribute.constraintList[0] : undefined;
                        break;
                    case 'list':
                        if (attribute.constraintList.indexOf(termId) >= 0) {
                            return termId;
                        } else {
                            return;
                        }
                        break;
                }
            }
            else {
                switch(attribute.dataType) {
                    case 'singleselect':
                        if(attribute.constraintList.indexOf(termId) == -1) {
                            attribute.constraintList.splice(0, attribute.constraintList.length);
                            attribute.constraintList.push(termId);
                        }
                        break;
                    case 'list':
                        var indexOf = attribute.constraintList.indexOf(termId)
                        if(indexOf == -1) {
                            attribute.constraintList.push(termId);
                        } else {
                            attribute.constraintList.splice(indexOf, 1);
                        }
                        break;
                }
            }
        }
    }

    self.addNumberRange = function(attribute, form){
        if (!attribute.numberRange) {
            attribute.numberRange = new NumberRange();
            form.$setDirty();
        }
    }

    self.removeNumberRange = function(attribute, form){
        if (attribute.numberRange) {
            attribute.numberRange = null;
            form.$setDirty();
        }
    }

    self.isContentValid = function(attribute, form){
        var valid = false;
        switch (attribute.dataType) {
            case 'number':
                valid = !!attribute.numbers;
                break;
            case 'range':
                valid = self.isNumberRangeValid(attribute, form);
                break;
            case 'singleselect':
            case 'list':
            case 'text':
            default:
                valid = true;
        }

        return valid;
    }

    self.isNumberRangeValid = function(attribute, form) {
        if(attribute.numberRange && (attribute.dataType == 'range')) {
            if(attribute.numberRange.from >= attribute.numberRange.to) {
                form.$setValidity('fromgreaterthanto', false);
                return false;
            }
            else {
                form.$setValidity('fromgreaterthanto', true);
                return true;
            }
        }
    }

    self.getName = function(attribute){
        return attribute.title.replaceAll(" ", "_")
    }

    self.revertAttribute = function (attributeIdx, auditIdx, form) {
        self.attributes[attributeIdx].title = self.attributes[attributeIdx].audit[auditIdx].object.title;
        self.attributes[attributeIdx].text = self.attributes[attributeIdx].audit[auditIdx].object.text;
        form.$setDirty();
    };

    self.showAudit = function (idx) {
        var future = profileService.getAuditHistory(self.attributes[idx].uuid);
        future.then(function (audit) {
                audit = audit.items; // return value includes items and total to support pagination.
                var d = new diff_match_patch();

                for (var i = 0; i < audit.length - 1; i++) {
                    if (audit[i + 1].object.plainText && audit[i].object.plainText) {
                        var diff = d.diff_main(audit[i + 1].object.plainText, audit[i].object.plainText);
                        audit[i].diff = d.diff_prettyHtml(diff);
                    }
                }

                self.attributes[idx].audit = audit;
                self.attributes[idx].auditShowing = true;
            },
            function () {
                messageService.alert("An error occurred while retrieving the audit history.")
            }
        );
    };

    self.hideAudit = function (idx) {
        self.attributes[idx].auditShowing = false;
    };

    self.deleteAttribute = function (idx) {
        var confirmed = util.confirm("Are you sure you wish to delete this attribute?");

        confirmed.then(function () {
            if (self.attributes[idx].uuid !== "") {
                var future = profileService.deleteAttribute(self.opusId, self.profileId, self.attributes[idx].uuid);
                future.then(function () {
                        self.attributes.splice(idx, 1);
                    },
                    function () {
                        messageService.alert("An error occurred while deleting the record.");
                    }
                );
            } else {
                self.attributes.splice(idx, 1);
            }
        });
    };

    self.addAttribute = function (form) {
        self.attributes.unshift(
            {"uuid": "", "title": "", "text": "", contributor: []}
        );
        if (form) {
            form.$setDirty();
        }
    };

    self.copyAttribute = function (index, form) {
        var copy = angular.copy(self.attributes[index]);
        copy.fromCollection = null;
        copy.original = self.attributes[index];
        copy.source = copy.original.fromCollection.opusTitle;
        copy.uuid = "";
        self.attributes[index] = copy;
        if (self.isValid(copy.title)) {
            self.saveAttribute(index, form);
        }
    };

    self.saveAttribute = function (idx, attributeForm) {
        var attribute = self.attributes[idx];
        self.attributes[idx].saving = true;
        if(!self.attributes[idx].title){
            messageService.alertStayOn( "Attribution title field is mandatory.");
            return;
        }

        var data = {
            profileId: self.profile.uuid,
            uuid: attribute.uuid,
            title: capitalize(attribute.title),
            text: attribute.text || '',
            numbers: attribute.numbers,
            numberRange: attribute.numberRange,
            unit: attribute.unit,
            constraintList: attribute.constraintList
        };

        if (attribute.source) {
            data.source = attribute.source;
        }
        if (attribute.attributeTo) {
            data.attributeTo = attribute.attributeTo;
        }
        if (attribute.original) {
            data.original = attribute.original;
        }
        if (attribute.creators) {
            data.creators = attribute.creators;
        }
        if (attribute.editors) {
            data.editors = attribute.editors;
        }
        data.significantEdit = attribute.significantEdit ? attribute.significantEdit : false;

        var future = profileService.saveAttribute(self.opusId, self.profileId, attribute.uuid, data);

        future.then(function (attribute) {
                self.attributes[idx].saving = false;
                messageService.success(self.attributes[idx].title + " successfully updated.");

                self.attributes[idx].uuid = attribute.attributeId;
                self.attributes[idx].auditShowing = false;
                self.attributes[idx].audit = null;
                attributeForm.$setPristine();
            },
            function () {
                self.attributes[idx].saving = false;
                messageService.alert("An error has occurred while saving.");
            }
        );
    };

    self.loadAttributesFromSupportingCollections = function () {
        var profileAttributeMap = [];
        angular.forEach(self.attributes, function (attribute) {
            profileAttributeMap.push(attribute.title.toLowerCase())
        });

        var supportingOpusList = [];
        angular.forEach(self.opus.supportingOpuses, function (opus) {
            supportingOpusList.push(opus.uuid)
        });

        if (supportingOpusList) {
            var searchResult = profileService.profileSearch(supportingOpusList.join(","), self.profile.scientificName, false);
            searchResult.then(function (searchResults) {
                    angular.forEach(searchResults, function (result) {
                        var profilePromise = profileService.getProfile(result.opus.uuid, result.profileId);
                        profilePromise.then(function (supporting) {

                            angular.forEach(supporting.profile.attributes, function (attribute) {
                                if (profileAttributeMap.indexOf(attribute.title.toLowerCase()) == -1) {
                                    attribute.fromCollection = {
                                        opusId: supporting.opus.uuid,
                                        opusTitle: supporting.opus.title,
                                        opusShortName: supporting.opus.shortName,
                                        profileId: supporting.profile.uuid
                                    };

                                    attribute.key = util.toKey(attribute.title);

                                    self.attributes.push(attribute);
                                    var title = {name: attribute.title};

                                    self.supportingAttributeTitles.push(attribute.title);

                                    if (self.attributeTitles.map(function(t) { return t.name.toLowerCase(); }).indexOf(title.name.toLowerCase()) == -1) {
                                        self.attributeTitles.push(title);
                                    }
                                }

                                if (!self.supportingAttributes[attribute.title.toLowerCase()]) {
                                    self.supportingAttributes[attribute.title.toLowerCase()] = [];
                                }

                                self.supportingAttributes[attribute.title.toLowerCase()].push({
                                    opusId: supporting.opus.uuid,
                                    opusTitle: supporting.opus.title,
                                    profileId: supporting.profile.uuid,
                                    title: attribute.title,
                                    text: attribute.text,
                                    numbers: attribute.numbers
                                });
                            });
                        });
                    });
                }
            );
        }
    };

    self.viewInOtherCollections = function (title) {
        var supporting = self.supportingAttributes[title.toLowerCase()];

        $modal.open({
            templateUrl: "/profileEditor/supportingCollections.htm",
            controller: "AttributePopupController",
            controllerAs: "attrModalCtrl",
            size: "lg",
            resolve: {
                supporting: function () {
                    return supporting;
                }
            }
        });
    };

    self.toggleShowSupportingData = function(supportingAttributesForm) {

        profileService.updateProfile(self.opusId, self.profileId, {showLinkedOpusAttributes:self.showSupportingData}).then(
            function() {
                supportingAttributesForm.$setPristine();
            },
            function() {
                messageService.alert("An error has occurred while updating the 'Show information from supporting collections' setting.");
            });
    };

    self.parseInt = function(number) {
        return parseInt(number, 10);
    }
}]);


/**
 * Attributes Popup controller
 */
profileEditor.controller('AttributePopupController', function ($modalInstance, supporting) {
    var self = this;

    self.supporting = supporting;

    self.close = function () {
        $modalInstance.dismiss();
    };
});