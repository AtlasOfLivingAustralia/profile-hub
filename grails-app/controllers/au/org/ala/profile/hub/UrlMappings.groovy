package au.org.ala.profile.hub

import grails.util.Environment

class UrlMappings {

    static mappings = {

        "/ping" controller: "ping", action: "ping"

        "/tags" controller: "opus", action: "getTags"

        "/speciesList/" controller: "speciesList", action: [GET: "getAllLists"]

        "/user/search" controller: "user", action: [GET: "findUser"]
        "/user/details" controller: "user", action: [GET: "getUserDetails"]

        "/opus/create" controller: "opus", action: [GET: "create", PUT: "createOpus"]
        "/opus/search" controller: "opus", action: [GET: "search"]

        "/opus/list" controller: "opus", action: [GET: "list"]

        "/profile/search" controller: "search", action: [GET: "search"]
        "/profile/search/scientificName" controller: "search", action: [GET: "findByScientificName"]
        "/profile/search/taxon/name" controller: "search", action: "findByNameAndTaxonLevel"
        "/profile/search/taxon/name/count" controller: "search", action: "countByNameAndTaxonLevel"
        "/profile/search/taxon/level" controller: "search", action: "groupByTaxonLevel"
        "/profile/search/taxon/levels" controller: "search", action: "getTaxonLevels"
        "/profile/search/children" controller: "search", action: "getImmediateChildren"

        "/opus/$opusId/profile/create" controller: "profile", action: [PUT: "createProfile"]
        "/opus/$opusId/profile/$profileId/duplicate" controller: "profile", action: [PUT: "duplicateProfile"]
        "/opus/$opusId/profile/$profileId/delete" controller: "profile", action: [DELETE: "deleteProfile"]
        "/opus/$opusId/profile/$profileId/update" controller: "profile", action: [GET: "edit", POST: "updateProfile"]
        "/opus/$opusId/profile/$profileId/rename" controller: "profile", action: [POST: "renameProfile"]
        "/opus/$opusId/profile/$profileId/archive" controller: "profile", action: [POST: "archiveProfile"]
        "/opus/$opusId/profile/$profileId/restore" controller: "profile", action: [POST: "restoreArchivedProfile"]
        "/opus/$opusId/profile/$profileId/createDraftMode" controller: "profile", action: [POST: "createDraftMode"]
        "/opus/$opusId/profile/$profileId/publishDraft" controller: "profile", action: [POST: "publishDraft"]
        "/opus/$opusId/profile/$profileId/discardDraftChanges" controller: "profile", action: [POST: "discardDraftChanges"]
        "/opus/$opusId/profile/$profileId/json" controller: "profile", action: [GET: "getJson"]
        "/opus/$opusId/profile/$profileId/pdf" controller: "export", action: [GET: "getPdf"]
        "/opus/$opusId/profile/$profileId/images" controller: "profile", action: [GET: "retrieveImages"]
        "/opus/$opusId/profile/$profileId/images/paged" controller: "profile", action: [GET: "retrieveImagesPaged"]
        "/opus/$opusId/profile/$profileId/primaryImage" controller: "profile", action: [GET: "getPrimaryImage"]
        "/opus/$opusId/profile/$profileId/image/$imageId" controller: "profile", action: [GET: "getLocalImage"]
        "/opus/$opusId/profile/$profileId/image/thumbnail/$imageId" controller: "profile", action: [GET: "retrieveLocalThumbnailImage"]
        "/opus/$opusId/profile/$profileId/image/$imageId/delete" controller: "profile", action: [DELETE: "deleteLocalImage"]
        "/opus/$opusId/profile/$profileId/image/$imageId/publish" controller: "profile", action: [POST: "publishPrivateImage"]
        "/opus/$opusId/profile/$profileId/file/$fileId" controller: "profile", action: [GET: "downloadTempFile"]
        "/opus/$opusId/profile/$profileId/image/upload" controller: "profile", action: [POST: "uploadImage"]
        "/opus/$opusId/profile/$profileId/lists" controller: "speciesList", action: [GET: "retrieveLists"]
        "/opus/$opusId/profile/$profileId/publication" controller: "profile", action: [GET: "retrievePublication"]
        "/opus/$opusId/profile/$profileId/publication/create" controller: "profile", action: [PUT: "savePublication"]
        "/opus/$opusId/profile/$profileId/publication/$publicationId/file" controller: "profile", action: [GET: "proxyPublicationDownload"]
        "/opus/$opusId/profile/$profileId/publication/$publicationId/update" controller: "profile", action: [POST: "savePublication"]
        "/opus/$opusId/profile/$profileId/speciesProfile" controller: "profile", action: [GET: "retrieveSpeciesProfile"]
        "/opus/$opusId/profile/$profileId/featureList" controller: "profile", action: [GET: "getFeatureLists"]
        "/opus/$opusId/profile/$profileId/attribute/$attributeId/update" controller: "profile", action: [POST: "updateAttribute"]
        "/opus/$opusId/profile/$profileId/attribute/create" controller: "profile", action: [PUT: "updateAttribute"]
        "/opus/$opusId/profile/$profileId/attribute/$attributeId/delete" controller: "profile", action: [DELETE: "deleteAttribute"]
        "/opus/$opusId/profile/$profileId/links/update" controller: "profile", action: [POST: "updateLinks"]
        "/opus/$opusId/profile/$profileId/bhllinks/update" controller: "profile", action: [POST: "updateBHLLinks"]
        "/opus/$opusId/profile/$profileId/comment/" controller: "comment", action: [GET: "getComments"]
        "/opus/$opusId/profile/$profileId/comment/create" controller: "comment", action: [PUT: "addComment"]
        "/opus/$opusId/profile/$profileId/comment/$commentId/update" controller: "comment", action: [POST: "updateComment"]
        "/opus/$opusId/profile/$profileId/comment/$commentId/delete" controller: "comment", action: [DELETE: "deleteComment"]
        "/opus/$opusId/profile/$profileId/authorship/update" controller: "profile", action: [POST: "updateAuthorship"]
        "/opus/$opusId/profile/$profileId/attachment/$attachmentId" controller: "profile", action: [GET: "getAttachmentMetadata", DELETE: "deleteAttachment"]
        "/opus/$opusId/profile/$profileId/attachment/$attachmentId/download" controller: "profile", action: [GET: "proxyAttachmentDownload"]
        "/opus/$opusId/profile/$profileId/attachment/" controller: "profile", action: [GET: "getAttachmentMetadata", POST: "saveAttachment"]
        "/opus/$opusId/profile/$profileId/map/snapshot" controller: "profile", action: [DELETE: "deleteMapSnapshot", POST: "createMapSnapshot"]
        "/opus/$opusId/profile/$profileId/multimedia/$documentId" controller: "profile", action: [DELETE: "documentDelete", POST: "documentUpdate"]
        "/opus/$opusId/profile/$profileId/multimedia" controller: "profile", action: [POST: "documentUpdate"]
        "/opus/$opusId/profile/$profileId/primaryMultimedia" controller: "profile", action: [POST: "setPrimaryMultimedia"]
        "/opus/$opusId/profile/$profileId/status" controller: 'profile', action: [POST: 'setStatus']
        "/opus/$opusId/profile/$profileId" controller: "profile", action: [GET: "show"]
        "/opus/$opusId/data/" controller: "data", action: [GET: "getDataSets"]
        "/opus/$opusId/data/upload" controller: "data", action: [GET: "upload"]
        "/opus/$opusId/data/uploadFile" controller: "sandboxProxy", action: [POST: "uploadFile"]
        "/opus/$opusId/data/$dataResourceId/delete" controller: "data", action: [DELETE: "deleteDataSet"]

        "/opus/$opusId/vocab/$vocabId/update" controller: "vocab", action: [POST: "update"]
        "/opus/$opusId/vocab/create" controller: "vocab", action: [POST: "create"]
        "/opus/$opusId/vocab/$vocabId/findUsages" controller: "vocab", action: [GET: "findUsagesOfTerm"]
        "/opus/$opusId/vocab/$vocabId/replaceUsages" controller: "vocab", action: [POST: "replaceUsagesOfTerm"]
        "/opus/$opusId/vocab/$vocabId" controller: "vocab", action: [GET: "show"]

        "/opus/$opusId/additionalStatuses" controller: "opus", action: [POST: 'updateAdditionalStatuses']
        "/opus/$opusId/about/json" controller: "opus", action: [GET: "getAboutHtml"]
        "/opus/$opusId/about/update" controller: "opus", action: [PUT: "updateAbout"]
        "/opus/$opusId/about" controller: "opus", action: [GET: "about"]
        "/opus/$opusId/masterList" controller: "opus", action: [POST: 'updateMasterList']
        "/opus/$opusId/masterList/keybaseItems" controller: "opus", action: "getMasterListKeybaseItems"
        "/opus/$opusId/masterList/sync" controller: "opus", action: [POST: 'syncMasterList']
        "/opus/$opusId/masterList/isSyncing" controller: "opus", action: [GET: 'isMasterListSyncing']


        "/opus/$opusId/shareRequest/$requestingOpusId/" controller: "opus", action: [GET: "getSupportingCollectionRequest"]
        "/opus/$opusId/supportingCollections/respond/$requestingOpusId/$requestAction" controller: "opus", action: [POST: "respondToSupportingCollectionRequest"]
        "/opus/$opusId/supportingCollections/update" controller: "opus", action: [POST: "updateSupportingCollections"]

        "/opus/$opusId/glossary/json" controller: "glossary", action: [GET: "getGlossary"]
        "/opus/$opusId/glossary/$prefix" controller: "glossary", action: [GET: "getGlossary"]
        "/opus/$opusId/glossary/upload" controller: "glossary", action: [POST: "upload"]
        "/opus/$opusId/glossary/item/create" controller: "glossary", action: [PUT: "saveItem"]
        "/opus/$opusId/glossary/item/$glossaryItemId/update" controller: "glossary", action: [POST: "updateItem"]
        "/opus/$opusId/glossary/item/create" controller: "glossary", action: [PUT: "saveItem"]
        "/opus/$opusId/glossary/item/$glossaryItemId/delete" controller: "glossary", action: [DELETE: "deleteItem"]
        "/opus/$opusId/glossary" controller: "glossary", action: [GET: "view"]

        "/opus/$opusId/attachment/$attachmentId" controller: "opus", action: [GET: "getAttachmentMetadata", DELETE: "deleteAttachment"]
        "/opus/$opusId/attachment/$attachmentId/download" controller: "opus", action: [GET: "proxyAttachmentDownload"]
        "/opus/$opusId/attachment/" controller: "opus", action: [GET: "getAttachmentMetadata", POST: "saveAttachment"]
        "/attachment/categories/" controller: "opus", action: [GET: "getCategories"]

        "/opus/$opusId/florulaList" controller: "opus", action: [POST: "updateFlorulaList"]
        "/opus/$opusId/users/update" controller: "opus", action: [POST: "updateUsers"]
        "/opus/$opusId/access/token" controller: "opus", action: [POST: "generateAccessToken", PUT: "generateAccessToken", DELETE: "revokeAccessToken"]

        "/opus/$opusId/report/$reportId" controller: "report", action: [GET: "loadReport"]

        "/opus/$opusId/statistics" controller: "statistics", action: [GET: "index"]
        "/opus/$opusId/image/$filename" controller: "opus", action: [GET: "downloadImage", DELETE: "deleteImage"]
        "/opus/$opusId/image/$imageId/metadata" controller: "profile", action: [POST: "updateLocalImageMetadata"]
        "/opus/$opusId/image" controller: "opus", action: [POST: "uploadImage", PUT: "uploadImage"]

        "/opus/$opusId/update" controller: "opus", action: [GET: "edit", POST: "updateOpus"]
        "/opus/$opusId/json" controller: "opus", action: [GET: "getJson"]
        "/opus/$opusId/delete" controller: "opus", action: [DELETE: "deleteOpus"]
        "/opus/$opusId" controller: "opus", action: [GET: "show"]
        "/opus/$opusId/search" controller: "opus", action: [GET: "search"]
        "/opus/$opusId/browse" controller: "opus", action: [GET: "browse"]
        "/opus/$opusId/filter" controller: "opus", action: [GET: "filter"]
        "/opus/$opusId/identify" controller: "opus", action: [GET: "identify"]
        "/opus/$opusId/documents" controller: "opus", action: [GET: "documents"]
        "/opus/$opusId/reports" controller: "opus", action: [GET: "reports"]
        "/opus/$opusId/stylesheet" controller: "opus", action: [GET: "getStyleSheet"]
        "/opus" controller: "opus", action: [GET: "index"]

        // g:include tab lib behaves slightly differently in Grails 3. It constructs URL from controller and action
        // parameters before forwarding the request. Adding the below explicit mapping to make sure requests are forwarded to
        // the correct action in a controller.
        "/opus/$action" {
            controller = "opus"
            constraints {
                action in [ 'searchPanel', 'browsePanel', 'opusSummaryPanel', 'editAccessControlPanel', 'editStylingPanel',
                        'editLandingPagePanel', 'editTheme', 'editHelpLinks', 'editOpusDetailsPanel', 'editMapConfigPanel',
                        'editImageSourcesPanel', 'editRecordSourcesPanel', 'editSupportingOpusPanel', 'editVocabPanel',
                        'editGlossaryPanel', 'editApprovedListsPanel', 'editFeatureListPanel', 'editAuthorshipPanel',
                        'editKeyConfigPanel', 'editAboutPanel', 'reportPanel'
                ]
            }
        }
        "/profile/$action" {
            controller = "profile"
            constraints {
                action in [ 'attributesPanel', 'linksPanel', 'bhlLinksPanel', 'taxonPanel', 'imagesPanel', 'mapPanel',
                        'listsPanel', 'publicationsPanel', 'bibliographyPanel', 'specimenPanel', 'commentsPanel',
                        'authorPanel', 'editNamePanel', 'formatNamePanel', 'auditHistoryPanel', 'nomenclaturePanel'
                ]
            }
        }

        "/dataResource/$dataResourceUid" controller: "collectory", action: [GET: "getResource"]
        "/dataResource/" controller: "collectory", action: [GET: "listResources"]
        "/dataHub/$dataHubUid" controller: "collectory", action: [GET: "getHub"]
        "/dataHub/" controller: "collectory", action: [GET: "listHubs"]
        "/licences/" controller: "collectory", action: [GET: "licences"]

        "/keybase/projects" controller: "opus", action: [GET: "retrieveKeybaseProjects"]
        "/keybase/findKey" controller: "keybase", action: [GET: "findKey"]
        "/keybase/keyLookup" controller: "keybase", action: [GET: "keyLookup"]


        "/checkName" controller: "profile", action: [GET: "checkName"]

        "/nsl/listConcepts/$nslNameIdentifier" controller: "NSL", action: [GET: "listConcepts"]
        "/nsl/nameDetails/$nslNameIdentifier" controller: "NSL", action: [GET: "nameDetails"]

        "/bhl/$pageId"(controller: "BHL", action: "pageLookup")

        "/specimen/$specimenId"(controller: "biocache", action: "lookupSpecimen")

        "/audit/object/$id" controller: "audit", action: [GET: "object"]
        "/audit/user/$id" controller: "audit", action: [GET: "user"]

        "/publication/$pubId" controller: "profile", action: [GET: "getPublication"]
        "/publication/$pubId/json" controller: "profile", action: [GET: "getPublicationJson"]

        "/" controller: "opus", action: [GET: "index"]

        "/logout/logout" controller: "logout", action: "logout"

        "/admin/message" controller: "admin", action: [GET: "getMessage", POST: "postMessage"]
        "/admin/reloadConfig" controller: "admin", action: [POST: "reloadConfig"]
        "/admin/reindex" controller: "admin", action: [POST: "reindex"]
        "/admin/listBackupFiles" controller: "admin", action: [GET: "listBackupFiles"]
        "/admin/rematchNames" controller: "admin", action: [POST: "rematchNames"]
        "/admin/backupCollections" controller: "admin", action: [POST: "backupCollections"]
        "/admin/restoreCollections" controller: "admin", action: [POST: "restoreCollections"]
        "/admin/job/$jobType/$jobId" controller: "admin", action: [DELETE: "deleteJob"]
        "/admin/job/" controller: "admin", action: [GET: "listPendingJobs"]
        "/admin/tag/$tagId?" controller: "admin", action: [GET: "getTag", PUT: "createTag", POST: "updateTag", DELETE: "deleteTag"]
        "/admin/cacheManagement" controller: "admin", action: [GET: "cacheManagement"]
        "/admin/clearCache/$id" controller: "admin", action: [GET: "clearCache"]
        "/admin/reloadHelpUrls" controller: "admin", action: [POST: "reloadHelpUrls"]
        "/admin" controller: "admin", action: [GET: "index"]
        "/alaAdmin/index" controller: "admin", action: [GET: "alaIndex"]
        "/alaAdmin" controller: "admin", action: [GET: "alaIndex"]

        "500"(view: "/error")
        "404"(view: "/notFound")
        "403"(view: "/notAuthorised")
        "401"(view: "/notAuthorised")
        "/notAuthorised"(view: "/notAuthorised")
        "/error"(view: "/error")
        "/notFound"(view: "/notFound")

        // The following URLs proxy requests for the Sandbox through Profile Hub.
        // See the project wiki for more info on the Profiles-Sandbox integration.

        // SANDBOX UPLOAD UI: The URL pattern must match the format used by the Sandbox UI, which is embedded in the
        // data upload page via web components.
        "/dataCheck/parseColumns" controller: "sandboxProxy", action: [POST: "parseCsvColumns"]
        "/dataCheck/parseColumnsWithFirstLineInfo" controller: "sandboxProxy", action: [POST: "parseCsvColumnsWithFirstLineInfo"]
        "/dataCheck/processData" controller: "sandboxProxy", action: [POST: "processCsvData"]
        "/dataCheck/upload/parseColumns" controller: "sandboxProxy", action: [POST: "parseFileColumns"]
        "/dataCheck/upload/parseColumnsWithFirstLineInfo" controller: "sandboxProxy", action: [POST: "parseFileColumnsWithFirstLineInfo"]
        "/dataCheck/upload" controller: "sandboxProxy", action: [POST: "sendCsvDataToBiocache"]
        "/dataCheck/upload/processData" controller: "sandboxProxy", action: [POST: "processFileData"]
        "/dataCheck/upload/uploadToSandbox" controller: "sandboxProxy", action: [POST: "sendFileToBiocache"]
        "/dataCheck/uploadStatus" controller: "sandboxProxy", action: [GET: "csvUploadStatus"]
        "/dataCheck/upload/uploadStatus" controller: "sandboxProxy", action: [GET: "fileUploadStatus"]
        "/upload/preview" controller: "sandboxProxy", action: [GET: "previewUpload"]

        // BIOCACHE MAPS (used by MapController.js and the ALA.OccurrenceMap.js from the ala-map-plugin when the
        // collection is configured to use private occurrence data)
        "/opus/$opusId/ws/mapping/wms/reflect" controller: "sandboxBiocacheProxy", action: [GET: "proxy"]
        "/opus/$opusId/ws/occurrences/info" controller: "sandboxBiocacheProxy", action: [GET: "proxy"]
        "/opus/$opusId/ws/mapping/bounds.json" controller: "sandboxBiocacheProxy", action: [GET: "proxy"]
        "/opus/$opusId/ws/occurrence/legend" controller: "sandboxBiocacheProxy", action: [GET: "proxy"]
        "/opus/$opusId/ws/occurrences/search.json" controller: "sandboxBiocacheProxy", action: [GET: "proxy"]
        "/opus/$opusId/ws/search/grouped/facets" controller: "sandboxBiocacheProxy", action: [GET: "proxy"]


        // The following URLs need to match the URLs used by the ala-images-client plugin so that we can view draft
        // and private images (which do not exist in images.ala.org.au) in the plugin as well as ALA images.
        "/ws/image/$imageId" controller: "image", action: [GET: "getImageInfo"]
        "/image/proxyImage/$imageId" controller: "image", action: [GET: "downloadImage"]
        "/profile/$profileId/image/$imageId/tile/$zoom/$x/$y" controller: "image", action: [GET: "getTile"]
        "/opus/$opusId/profile/$profileId/image/$imageId/tile/$zoom/$x/$y" controller: "image", action: [GET: "getTile"]

        "/stylesheet/$id?" controller: "stylesheet", action: "opus"
        "/facets" controller: "resource", action: "facets"
        if (Environment.current == Environment.DEVELOPMENT) {
            "/console/$action?/$id?(.$format)?" controller: 'console'
        }

        // The following are APIs.
        group("/api") {
            get "/opus/$opusId" (version: "1.0", controller: "api", action: "getOpus", namespace: "v1")
            get "/opus/$opusId/profile" (version: "1.0", controller: "api", action: "getProfiles", namespace: "v1")
            get "/opus/$opusId/profile/$profileId" (version: "1.0", controller: "api", action: "get", namespace: "v1")
            get "/opus/$opusId/profile/$profileId/image" (version: "1.0", controller: "api", action: "getImages", namespace: "v1")
            get "/opus/$opusId/profile/$profileId/image/$fileName" (version: "1.0", controller: "api", action: "getLocalImage", namespace: "v1")
            get "/opus/$opusId/profile/$profileId/image/thumbnail/$fileName" (version: "1.0", controller: "api", action: "retrieveLocalThumbnailImage", namespace: "v1")
            get "/opus/$opusId/profile/$profileId/attribute/$attributeId" (version: "1.0", controller: "api", action: "getAttributes", namespace: "v1")
            get "/opus/$opusId/profile/$profileId/draft" (version: "1.0", controller: "api", action: "getDraftProfile", namespace: "v1")
            get "/opus" (version: "1.0", controller: "api", action: "getListCollections", namespace: "v1")
        }

        "/openapi/$action?/$id?(.$format)?"(controller: "openApi")
        name openapiDoc: "/openapi/openapi(.$format)?" {
            controller = 'openApi'
            action = "openapi"
        }
    }
}
