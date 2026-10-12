/**
 * Utility functions
 */
profileEditor.factory('util', ['$location', '$log', '$q', 'config', '$modal', '$window', 'messageService', function ($location, $log, $q, config, $modal, $window, messageService) {

    var KEYWORDS = ["create", "update", "delete", "search"];
    var UUID_REGEX_PATTERN = "[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
    var UUID_ONLY_REGEX = new RegExp("^" + UUID_REGEX_PATTERN + "$", "i");
    var LAST = "last";
    var FIRST = "first";
    var RANK = {
        KINGDOM: "kingdom",
        PHYLUM: "phylum",
        CLASS: "class",
        SUBCLASS: "subclass",
        ORDER: "order",
        FAMILY: "family",
        GENUS: "genus",
        SPECIES: "species",
        SUBSPECIES: "subspecies",
        VARIETY: "variety",
        FORMA: "forma"
    };

    /**
     * Retrieves a specific item from the path of the current URL. Items are defined as anything between two slashes.
     *
     * NOTE: The path INCLUDES the context root
     *
     * e.g. for the URL http://hostname.com/path/item1/item2/, getPathItem('first') will return 'path',
     * getPathItem(1) will return 'item1', getPathItem('last') will return 'item2'.
     *
     * @param index can be a numeric index or 'first' as an alias for 0 or 'last' as an alias for the last item in the url
     * @returns the specified item in the url
     */
    function getPathItem(index) {
        return getPathItemFromUrl(index, getPath());
    }

    /**
     * Retrieves a specific item from the path of the provided URL. Items are defined as anything between two slashes.
     *
     * NOTE: The path INCLUDES the context root
     *
     * e.g. for the URL http://hostname.com/path/item1/item2/, getPathItem('first') will return 'path',
     * getPathItem(1) will return 'item1', getPathItem('last') will return 'item2'.
     *
     * @param index can be a numeric index or 'first' as an alias for 0 or 'last' as an alias for the last item in the url
     * @param url The URL to parse
     * @returns the specified item in the url
     */
    function getPathItemFromUrl(index, url) {
        var path = url;

        // remove a leading slash so we don't get an empty item at the start of the array
        if (path.indexOf("/") == 0) {
            path = path.substring(1);
        }

        var items = path.split("/");
        var item;

        switch (index) {
            case "first":
                item = items[0];
                break;
            case "last":
                item = items[items.length - 1];
                item = stripQueryString(item);
                break;
            default:
                item = items[index];
                if (index == items.length - 1) {
                    item = stripQueryString(item);
                }
        }

        return decodeURIComponent(item);
    }

    function stripQueryString(item) {
        if (item && item.indexOf("?") > 0) {
            item = item.substring(0, item.indexOf("?"));
        }

        if (item && item.indexOf("#") > 0) {
            item = item.substring(0, item.indexOf("#"));
        }

        return item;
    }

    /**
     * Retrieve the 'path' portion of the current URL. This is everything from the context root (inclusive) up to but not
     * including any request parameters.
     *
     * e.g. for a URL of http://hostname.com/foo/bar/bla?a=b, this method will return '/foo/bar/bla'
     * @returns {string} The path portion of the current URL
     */
    function getPath() {
        var path = $location.path();

        if (!path) {
            var url = $location.absUrl();
            var offset = $location.protocol().length + 3; // ignore the length of the protocol plus ://
            var startIndex = url.indexOf("/", offset);
            var endIndex = url.indexOf("?") == -1 ? url.length : url.indexOf("?");

            path = url.substring(startIndex, endIndex)
        }

        return path;
    }

    /**
     * Retrieves the value of the specified parameter from the query string of the url
     *
     * @param param The query parameter to return
     * @returns {*} The value of the specified param, or null if it does not exist
     */
    function getQueryParameter(param) {
        var queryString = $location.absUrl().substring($location.absUrl().indexOf("?") + 1);
        var queryParams = URI.parseQuery(queryString);

        return queryParams[param] || null;
    }

    /**
     * Get the specified entity id from the URL.
     *
     * Assumes all urls where the opus and/or profile id are required have the form http://.../opusShortName/profileScientificName/...
     */
    function getEntityId(entity) {
        var entityId = null;

        var path = getPath();

        if (path.indexOf(config.contextPath) == 0) {
            path = path.substring(config.contextPath.length);
        }

        if (path.indexOf("/") == 0) {
            path = path.substring(1)
        }

        if (path.charAt(path.length - 1) == "/") {
            path = path.substring(0, path.length - 1)
        }

        path = path.split("/");

        if (path) {
            if (entity == "opus") {
                entityId = path[1];
            } else if (entity == "profile" && path.length > 1) {
                entityId = path[3];
            } else if (entity == "publication" && path.length > 1) {
                entityId = path[1];
            }
        }

        if (entityId && entityId.indexOf(";") > -1) {
            entityId = entityId.substring(0, entityId.indexOf(";"))
        }

        if (KEYWORDS.indexOf(entityId) > -1 || typeof entityId === 'undefined' || entityId === null) {
            entityId = ""; // using empty string instead of null so the value does not convert to the string "null" if put into a url query string
        }
        return decodeURIComponent(entityId);
    }

    /**
     * Take the current URL and work out the context path.
     * $location.path only works when HTML 5 mode is enabled. This approach works in both HTML 5 and HashBang modes.
     *
     * e.g. for a URL of http://hostname.com/contextPath/bla/bla, this method will return '/contextPath'
     * e.g. for a URL of http://hostname.com/, this method will return '/'
     *
     * @returns String the context path of the current URL, with a leading slash but no trailing slash
     */
    function contextRoot() {
        return config.contextPath;
    }

    /**
     * Take the current URL and return the hostname, port and (optionally) the context root.
     *
     * e.g. for a URL of http://hostname.com/contextPath/bla/bla, this method will return 'http://hostname.com/'
     * when withContext = false, and 'http://hostname.com/contextPath' when withContext = true
     *
     * @param withContext True to include the context path in the return value
     * @returns {string} the hostname, port and (optionally) the context root
     */
    function getBaseHref(withContext) {
        return $location.protocol() + "://" + location.host + (withContext ? contextRoot() : "");
    }

    /**
     * Extract the base from the provided url. E.g. given https://blabla.com/foo, return https://blabla.com/
     *
     * @param url The full url to parse
     * @returns {*} The base url (protocol, host, port) with a trailing slash if there is more to the url than just the base
     */
    function getBaseUrl(url) {
        var baseUrl = null;

        if (url.indexOf("http") == 0) {
            baseUrl = url.replace(new RegExp("http(s?):\/\/(.*?)\/(.*)$", "ig"), "http$1://$2/");
        }

        return baseUrl;
    }

    /**
     * Retrieve the current user's name
     * @returns {*}
     */
    function currentUser() {
        return config.currentUser;
    }

    /**
     * The $http service returns an extended promise object which has success and error functions.
     * This introduces inconsistency with other code that deals with promises, and complicates the unit tests.
     * Therefore, we will create a new standard promise (which just uses then()) and return it instead.
     * http://weblog.west-wind.com/posts/2014/Oct/24/AngularJs-and-Promises-with-the-http-Service has a good explanation.
     *
     * TODO Angular 1.4+ $http service returns real promises, so the additional HTTP response logic in this should be converted to an interceptor:
     * https://docs.angularjs.org/api/ng/service/$http
     *
     * @param httpPromise $http extended promise
     * @return standard promise
     */
    function toStandardPromise(httpPromise) {
        if (httpPromise.success) {
            var defer = $q.defer();

            httpPromise.success(function (data) {
                defer.resolve(data);
            });
            httpPromise.error(function (data, status, context, request) {
                var msg = "Failed to invoke URL " + request.url + ": Response code " + status;
                $log.error(msg);
                defer.reject(msg);
                if (status == 403 || status == 401) {
                    console.log("not authorised");
                    redirect(contextRoot() + "/notAuthorised");
                } else if (status >= 400 && (_.isUndefined(request.disableAlertOnFailure) || !request.disableAlertOnFailure)) {
                    messageService.alertStayOn("An error occurred.");
                }

            });

            return defer.promise;
        } else {
            return httpPromise;
        }
    }

    /**
     * Checks if the provided identifier matches the regex pattern for a UUID.
     * @see UUID_ONLY_REGEX
     *
     * @param id the id to check
     * @returns {Array|{index: number, input: string}|*}
     */
    function isUuid(id) {
        var uuid = false;

        if (id && id != null && typeof id !== "undefined") {
            var match = id.match(UUID_ONLY_REGEX);
            uuid = match != null && match.length > 0;
        }

        return uuid;
    }

    /**
     * Displays a confirmation popup
     *
     * @param message The message text to display
     * @returns {Promise}
     */
    function confirm(message, ok, cancel) {
        if (ok === undefined) {
            ok = "OK"
        }
        if (cancel === undefined) {
            cancel = "Cancel"
        }

        var html = '<div class="modal-header confirm">' +
            '<h4 class="modal-title">Confirmation</h4>' +
            '</div>' +
            '<div class="modal-body">' +
            '{{ confirmCtrl.message | default:"Are you sure you wish to continue with this operation?"}}' +
            '</div>' +

            '<div class="modal-footer">' +
            '<button class="btn btn-primary" ng-click="confirmCtrl.ok()">' + ok + '</button>' +
            '<button class="btn btn-outline-secondary" ng-click="confirmCtrl.cancel()">' + cancel + '</button>' +
            '</div>';

        var popup = $modal.open({
            template: html,
            controller: "ConfirmationController",
            controllerAs: "confirmCtrl",
            size: "sm",
            resolve: {
                message: function() {
                    return message
                }
            }
        });

        return popup.result;
    }

    function redirect(url) {
        $window.location = url;
    }

    /**
     * Format a date object as a local date (ignoring the timezone and time components)
     * @param date The date to format
     * @returns {string} the formatted date
     */
    function formatLocalDate(date) {
        if (angular.isDate(date)) {
            return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        } else {
            return date;
        }
    }

    /**
     * Converts the human-readable label to a value suitable for use as a key by removing all spaces and punctuation, and converting to lowercase.
     *
     * @param label the label to convert
     */
    function toKey(label) {
        if (label) {
            return label.replace(/\W/g, '_').toLowerCase();
        }
    }

    /**
     * Formats a profile name: italicises the scientific name, leaves connecting terms and author names as normal text.
     *
     * @param scientificName The name without any author information. Only used if 'fullName' is not provided.
     * @param nameAuthor The author information without the scientific name.
     * @param fullName The combined scientific name and author information.
     * @returns {*} The formatted name
     */
    function formatScientificName(scientificName, nameAuthor, fullName, profileSettings) {
        if (!profileSettings || profileSettings.autoFormatProfileName || !profileSettings.formattedNameText) {
            if (!scientificName && !nameAuthor && !fullName) {
                return null;
            }
            var connectingTerms = ["subsp.", "var.", "f.", "ser.", "subg.", "sect.", "subsect."];

            if (nameAuthor) {
                connectingTerms.unshift(nameAuthor);
            }

            var name = null;
            if (fullName && fullName.trim().length > 0) {
                name = fullName;
            } else if (scientificName && nameAuthor) {
                name = scientificName + " " + nameAuthor;
            } else {
                name = scientificName;
            }

            angular.forEach(connectingTerms, function (connectingTerm) {
                var index = name.indexOf(connectingTerm);
                if (index > -1) {
                    var part1 = name.substring(0, index);
                    var part2 = "<span class='normal-text'>" + connectingTerm + "</span>";
                    var part3 = name.substring(index + connectingTerm.length, name.length);
                    name = part1 + part2 + part3;
                }
            });

            return "<span class='scientific-name'>" + name + "</span>";
        } else {
            return profileSettings.formattedNameText;
        }
    }

    /**
     * Determine if the provided attribute is considered to be a name attribute (e.g. common name, vernacular name, etc)
     * @param attribute the attribute to test
     * @returns {*} true if the attribute is to be treated as a name
     */
    function isNameAttribute(attribute) {
        return _.isBoolean(attribute.containsName) && attribute.containsName;
    }


    /**
     * Generate random sequence of characters
     */
    function getRandomString () {
        return Math.random().toString(36).substring(7);
    };

    /**
     * Translate facets to user readable text
     */
     function getFacetLabel(fieldName) {
        var lookup = {
            "state":"State or Territory",
            "synonym.decade":"occurrence_year",
            "location_id":"Location ID",
            "event_id":"Event ID",
            "elevation_d_rng":"Elevation (in metres)",
            "min_elevation_d_rng":"Minimum elevation (in metres)",
            "cl1048":"IBRA 7 Regions",
            "cl21":"IMCRA Regions",
            "raw_identification_qualifier":"Raw identification qualifier",
            "original_name_usage":"Original name usage",
            "cl2079":"capad 2014 terrestrial",
            "cl2078":"capad 2014 marine",
            "cl925":"Estuary habitat mapping",
            "cl901":"Directory of Important Wetlands",
            "cl958":"Commonwealth Electoral Boundaries",
            "cl1049":"IBRA 7 Subregions",
            "cl1085":"Koppen Climate Classification (All Classes)",
            "cl678":"Land use",
            "cl991":"Geomorphology of the Australian Margin and adjacent seafloor",
            "cl916":"NRM Regions",
            "cl935":"RAMSAR wetland regions",
            "cl1057":"River Regions",
            "cl2013":"ASGS Australian States and Territories",
            "cl927":"States including coastal waters",
            "cl923":"Surface Geology of Australia",
            "cl619":"Vegetation - condition",
            "cl1076":"IGBP Land Cover vegetation classification scheme (2011)",
            "cl918":"National Dynamic Land Cover",
            "occurrence_decade_i":"Year (by decade)",
            "data_resource_uid":"Data resource",
            "data_resource":"Data resource",
            "dataset_name":"Dataset name",
            "species_list_uid":"Species lists",
            "institution_uid":"Institution"
        };

        return  (ALA.OccurrenceMapUtils && ALA.OccurrenceMapUtils.formatFacetName && ALA.OccurrenceMapUtils.formatFacetName( fieldName, lookup)) || "Unknown";
     }

    var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }
    function generateUuid()  {
        var d0 = Math.random()*0xffffffff|0;
        var d1 = Math.random()*0xffffffff|0;
        var d2 = Math.random()*0xffffffff|0;
        var d3 = Math.random()*0xffffffff|0;
        return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
          lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
          lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
          lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
    }

    function rgbaFromNumber(number) {
        var retVal;
        if (isFinite(number)) {
            var red = number >> 24 & 0xFF;
            var green = number >> 16 & 0xFF;
            var blue = number >> 8 & 0xFF;
            var alpha = (number >> 0 & 0xFF) / 255;
            retVal = 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
        } else {
            $log.warn("Can't convert " + number + " to RGBA");
            retVal = 'rgba(0,0,0,0)';
        }
        return retVal;
    }

    function numberFromRgba(rgba) {
        if (!rgba) return null;
        var value = rgba.split('(');
        if (value.length !== 2) {
            $log.debug(rgba + " is not an rgba");
            return 0;
        }
        value = value[1].split(')');
        if (value.length !== 2) {
          $log.debug(rgba + " is not an rgba");
          return 0;
        }
        value = value[0].split(',');
        if (value.length < 3 || value.length > 4) {
          $log.debug(rgba + " is not an rgba");
          return 0;
        }
        var red = parseInt(value[0]);
        var green = parseInt(value[1]);
        var blue = parseInt(value[2]);
        var alpha;
        if (value.length === 4) {
            alpha = parseFloat(value[3]);
        } else {
            alpha = 1.0;
        }
        alpha = Math.round(alpha * 255);

        return ((red & 0xFF) << 24) + ((green & 0xFF) << 16) + ((blue & 0xFF) << 8) + (alpha & 0xFF);
    }

    function isSearchSettingFor(category, searchOptions){
        if(searchOptions){
            switch (category){
                case 'scientificname':
                    return searchOptions.nameOnly && !searchOptions.includeNameAttributes;
                    break;
                case 'commonname':
                    return searchOptions.nameOnly && searchOptions.includeNameAttributes;
                    break;
                case 'text':
                    return !searchOptions.nameOnly;
                    break;
            }
        }
    }

    function setSearchOptions(option, searchOptions) {
        if(searchOptions){
            switch(option){
                case 'scientificname':
                    searchOptions.nameOnly = true;
                    searchOptions.includeNameAttributes = false;
                    break;
                case 'commonname':
                    searchOptions.nameOnly = true;
                    searchOptions.includeNameAttributes = true;
                    break;
                case 'text':
                    searchOptions.nameOnly = false;
                    break;
            }
        }
    }

    function getSearchTypeFromOptions(searchOptions) {
        if(isSearchSettingFor('scientificname', searchOptions)){
            return 'scientificname'
        }

        if(isSearchSettingFor('commonname', searchOptions)){
            return 'commonname'
        }

        if(isSearchSettingFor('text', searchOptions)){
            return 'text'
        }
    }

    /**
     * Public API
     */
    return {
        contextRoot: contextRoot,
        getBaseHref: getBaseHref,
        getBaseUrl: getBaseUrl,
        getPathItem: getPathItem,
        getPathItemFromUrl: getPathItemFromUrl,
        toStandardPromise: toStandardPromise,
        isUuid: isUuid,
        confirm: confirm,
        redirect: redirect,
        getEntityId: getEntityId,
        getQueryParameter: getQueryParameter,
        currentUser: currentUser,
        toKey: toKey,
        formatScientificName: formatScientificName,
        isNameAttribute: isNameAttribute,
        formatLocalDate: formatLocalDate,
        getRandomString: getRandomString,
        getFacetLabel: getFacetLabel,
        generateUuid: generateUuid,
        rgbaFromNumber: rgbaFromNumber,
        numberFromRgba: numberFromRgba,
        isSearchSettingFor: isSearchSettingFor,
        setSearchOptions: setSearchOptions,
        getSearchTypeFromOptions: getSearchTypeFromOptions,
        LAST: LAST,
        FIRST: FIRST,
        RANK: RANK,
        UUID_REGEX_PATTERN: UUID_REGEX_PATTERN
    };

}]);


/**
 * Confirmation modal dialog controller
 */
profileEditor.controller('ConfirmationController', function ($modalInstance, message) {
    var self = this;

    self.message = message;

    self.ok = function() {
        $modalInstance.close({continue: true});
    };

    self.cancel = function() {
        $modalInstance.dismiss("cancel");
    }
});