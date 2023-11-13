package au.org.ala.profile.hub

import au.org.ala.profile.security.PrivateCollectionSecurityExempt
import au.org.ala.profile.security.Secured
import au.org.ala.web.AuthService
import grails.converters.JSON
import groovy.json.JsonSlurper
import org.grails.web.json.JSONArray
import org.grails.web.json.JSONObject
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.multipart.MultipartHttpServletRequest
import org.springframework.web.multipart.support.AbstractMultipartHttpServletRequest

import javax.validation.constraints.NotNull

import static au.org.ala.profile.security.Role.*

class ProfileController extends BaseController {

    AuthService authService
    ProfileService profileService
    BiocacheService biocacheService
    ImageService imageService
    MapService mapService
    FlorulaCookieService florulaCookieService

    def index() {}

    @Secured(role = ROLE_PROFILE_EDITOR)
    def edit() {
        if (!params.opusId || !params.profileId) {
            badRequest "opusId and profileId are required parameters"
        } else {
            boolean latest = params.isOpusReviewer || params.isOpusAuthor || params.isOpusAdmin || params.isOpusEditor
            Map profileAndOpus = profileService.getProfile(params.opusId as String, params.profileId as String, latest)

            if (!profileAndOpus || !profileAndOpus.profile) {
                notFound()
            } else if (profileAndOpus.profile.archivedDate) {
                // archived profiles cannot be edited by anyone
                notAuthorised()
            } else {
                profileAndOpus.profile.mapSnapshot = mapService.getSnapshotImageUrlWithUUIDs(request.contextPath, profileAndOpus.opus.uuid, profileAndOpus.profile.uuid)
                profileAndOpus << commonModelEntries(profileAndOpus.opus, profileAndOpus.profile, true)
                profileAndOpus << [
                          usePrivateRecordData: profileAndOpus.opus.usePrivateRecordData,
                          displayMap          : true,
                          helpLink            : profileAndOpus.opus?.help?.profileEditLink]
                render view: "edit", model: profileAndOpus
            }
        }
    }

    def show() {
        if (!params.profileId) {
            badRequest "profileId is a required parameter"
        } else {
            boolean latest = params.isOpusReviewer || params.isOpusAuthor || params.isOpusAdmin || params.isOpusEditor
            Map profileAndOpus = profileService.getProfile(params.opusId as String, params.profileId as String, latest)

            if (!profileAndOpus) {
                notFound()
            } else {
                profileAndOpus.profile.mapSnapshot = mapService.getSnapshotImageUrlWithUUIDs(request.contextPath, profileAndOpus.opus.uuid, profileAndOpus.profile.uuid)
                String profileUrl = getProfileUrl(profileAndOpus.opus, profileAndOpus.profile)
                Map model = profileAndOpus
                model << commonModelEntries(profileAndOpus.opus, profileAndOpus.profile, false)
                model << [
                          usePrivateRecordData: profileAndOpus.opus.usePrivateRecordData,
                          displayMap          : profileService.hasMatchedName(model.profile),
                          citation            : profileService.getCitation(profileAndOpus.opus, profileAndOpus.profile, profileUrl),
                          helpLink            : profileAndOpus.opus?.help?.profileViewLink
                ]
                render view: "show", model: model
            }
        }
    }

    @Secured(role = ROLE_PROFILE_AUTHOR)
    def createProfile() {
        def jsonRequest = request.getJSON();

        if (!jsonRequest) {
            badRequest()
        } else {
            def response = profileService.createProfile(params.opusId as String, jsonRequest)

            handle response
        }
    }

    @Secured(role = ROLE_PROFILE_AUTHOR)
    def duplicateProfile() {
        def jsonRequest = request.getJSON();

        if (!params.profileId || !jsonRequest) {
            badRequest "An existing profileId and a json body must be provided"
        } else {
            def response = profileService.duplicateProfile(params.opusId as String, params.profileId as String, jsonRequest)

            handle response
        }
    }

    @Secured(role = ROLE_PROFILE_EDITOR)
    def updateProfile() {
        def json = request.getJSON()
        log.debug("updateProfile with json " + json + " for profile " + params.profileId)
        if (!json || !params.profileId) {
            badRequest()
        } else {
            boolean latest = params.isOpusReviewer || params.isOpusAuthor || params.isOpusAdmin || params.isOpusEditor
            log.debug("Saving profile for opus id: " + params.opusId + " profile id: " + params.profileId)
            def response = profileService.updateProfile(params.opusId as String, params.profileId as String, json, latest)

            handle response
        }
    }

    @Secured(role = ROLE_PROFILE_EDITOR)
    def renameProfile() {
        def json = request.getJSON()
        if (!params.opusId || !params.profileId || !json) {
            badRequest()
        } else {
            def response = profileService.renameProfile(params.opusId as String, params.profileId as String, json)

            handle response
        }
    }

    @Secured(role = ROLE_PROFILE_EDITOR)
    def createDraftMode() {
        if (!params.profileId) {
            badRequest()
        } else {
            def response = profileService.toggleDraftMode(params.opusId as String, params.profileId as String)

            handle response
        }
    }

    @PrivateCollectionSecurityExempt
    @Secured(role = ROLE_PROFILE_ADMIN)
    def publishDraft() {
        if (!params.profileId) {
            badRequest()
        } else {
            // if we're already in draft mode and are publishing the changes, then we also need to publish any staged images
            def profile = profileService.getProfile(params.opusId, params.profileId, true)
            if (profile.profile.privateMode) {
                imageService.publishStagedImages(params.opusId, params.profileId)
            }

            def response = profileService.toggleDraftMode(params.opusId as String, params.profileId as String, true)

            handle response
        }
    }

    @Secured(role = ROLE_PROFILE_EDITOR)
    def publishPrivateImage() {
        if (!params.opusId || !params.profileId || !params.imageId) {
            badRequest()
        } else {
            def response = imageService.publishPrivateImage(params.opusId, params.profileId, params.imageId)

            handle response
        }
    }

    @Secured(role = ROLE_PROFILE_EDITOR)
    def updateLocalImageMetadata() {
        def metadata = request.getJSON()
        if (!params.imageId || !metadata) {
            badRequest "imageId or metadata is required"
        } else {
            handle imageService.updateLocalImageMetadata(params.imageId, metadata)
        }
    }

    @Secured(role = ROLE_PROFILE_AUTHOR)
    def discardDraftChanges() {
        if (!params.profileId) {
            badRequest()
        } else {
            def response = profileService.discardDraftChanges(params.opusId as String, params.profileId as String)

            handle response
        }
    }

    def getJson() {
        if (!params.profileId) {
            badRequest "profileId is a required parameter"
        } else {
            response.setContentType(CONTENT_TYPE_JSON)
            boolean latest = params.isOpusReviewer || params.isOpusAuthor || params.isOpusAdmin || params.isOpusEditor
            final fullClassification = params.boolean("fullClassification", false)
            Map profileAndOpus = profileService.getProfile(params.opusId as String, params.profileId as String, latest, fullClassification)

            if (!profileAndOpus) {
                notFound()
            } else {
                profileAndOpus.profile.mapSnapshot = mapService.getSnapshotImageUrlWithUUIDs(request.contextPath, profileAndOpus.opus.uuid, profileAndOpus.profile.uuid)
                render profileAndOpus as JSON
            }
        }
    }

    @Secured(role = ROLE_PROFILE_ADMIN)
    def deleteProfile() {
        if (!params.profileId || !params.opusId) {
            badRequest "profileId and opusId are required parameters"
        } else {
            def response = profileService.deleteProfile(params.opusId as String, params.profileId as String)

            handle response
        }
    }

    @Secured(role = ROLE_PROFILE_AUTHOR)
    def archiveProfile() {
        def json = request.getJSON()
        if (!params.profileId || !params.opusId || !json?.archiveComment) {
            badRequest "profileId, opusId and archiveComment are required parameters"
        } else {

            def response = profileService.archiveProfile(params.opusId as String, params.profileId as String, json.archiveComment as String)

            handle response
        }
    }

    @Secured(role = ROLE_PROFILE_AUTHOR)
    def restoreArchivedProfile() {
        def json = request.getJSON()

        if (!params.profileId || !params.opusId) {
            badRequest "profileId and opusId are required parameters"
        } else {
            def response = profileService.restoreArchivedProfile(params.opusId as String, params.profileId as String, json?.newName ?: null)

            handle response
        }
    }

    @Secured(role = ROLE_PROFILE_EDITOR)
    def updateBHLLinks() {
        def jsonRequest = request.getJSON()

        if (!jsonRequest || !params.profileId) {
            badRequest()
        } else {
            log.debug "Updating bhl links....."
            def response = profileService.updateBHLLinks(params.opusId as String, params.profileId as String, jsonRequest.links)

            handle response
        }
    }

    @Secured(role = ROLE_PROFILE_EDITOR)
    def updateLinks() {
        def jsonRequest = request.getJSON()

        if (!jsonRequest || !params.profileId) {
            badRequest()
        } else {
            log.debug "Updating links....."

            def response = profileService.updateLinks(params.opusId as String, params.profileId as String, jsonRequest.links)

            handle response
        }
    }

    @Secured(role = ROLE_PROFILE_EDITOR)
    def updateAttribute() {
        log.debug "Updating attribute....."
        def jsonRequest = request.getJSON()

        // the attributeId may be blank (e.g. when creating a new attribute), but the request should still have it
        if (!jsonRequest || !jsonRequest.has("uuid") || !params.profileId) {
            badRequest()
        } else {
            def response = profileService.updateAttribute(params.opusId as String, params.profileId, jsonRequest)

            handle response
        }
    }

    @Secured(role = ROLE_PROFILE_EDITOR)
    def deleteAttribute() {
        if (!params.attributeId || !params.profileId) {
            badRequest "attributeId and profileId are required parameters"
        } else {
            def response = profileService.deleteAttribute(params.opusId as String, params.attributeId, params.profileId)

            handle response
        }
    }

    def getPrimaryImage() {
        if (!params.opusId || !params.profileId) {
            badRequest "opusId and profileId are required parameters"
        } else {
            boolean latest = params.isOpusReviewer || params.isOpusAuthor || params.isOpusAdmin || params.isOpusEditor

            Map model = profileService.getProfile(params.opusId, params.profileId, latest)
            Map profile = model.profile
            Map opus = model.opus

            def imageMetadata = imageService.getPrimaryImageMetaData(opus, profile) ?: [:]

            render imageMetadata as JSON
        }
    }

    def retrieveImagesPaged() {
        if (!params.opusId || !params.profileId || !params.pageSize || !params.startIndex) {
            badRequest "opusId, profileId, pageSize and startIndex are required parameters"
        } else {
            boolean latest = params.isOpusReviewer || params.isOpusAuthor || params.isOpusAdmin || params.isOpusEditor
            boolean readonlyView = params.getBoolean('readonlyView', true)
            def response = imageService.retrieveImagesPaged(params.opusId, params.profileId, latest, params.searchIdentifier, false, readonlyView, params.pageSize as int, params.startIndex as int)
            handle(response)
        }
    }

    def retrieveImages() {
        if (!params.opusId || !params.profileId || !params.imageSources) {
            badRequest "opusId, profileId and imageSources are required parameters"
        } else {

            boolean latest = params.isOpusReviewer || params.isOpusAuthor || params.isOpusAdmin || params.isOpusEditor
            boolean readonlyView = params.getBoolean('readonlyView', true)

            def response = imageService.retrieveImages(params.opusId, params.profileId, latest, params.searchIdentifier, false, readonlyView)

            handle response
        }
    }

    @Secured(role = ROLE_PROFILE_EDITOR)
    def uploadImage() {
        if (!params.opusId || !params.profileId || !params.dataResourceId || !params.title) {
            badRequest "opusId, dataResourceId, title and profileId are mandatory fields"
        } else if (request instanceof AbstractMultipartHttpServletRequest) {
            MultipartFile file = ((AbstractMultipartHttpServletRequest) request).getFile("file")
            doUpload(new MultipartFileTransferrableAdapter(multipartFile: file))
        } else if (params.url) {
            final ut = new UrlTransferrableAdapter(url: params.url.toURL())
            ut.withCloseable { doUpload(ut) }
        } else {
            badRequest "a file or url is required"
        }
    }

    private def doUpload(Transferrable transferrable) {
        List<Map> multimedia = [
                [
                        creator         : params.creator ?: "",
                        rights          : params.rights ?: "",
                        rightsHolder    : params.rightsHolder ?: "",
                        licence         : params.licence ?: "",
                        title           : params.title ?: "",
                        description     : params.description ?: "",
                        created         : params.created ?: "",
                        originalFilename: transferrable.originalFilename
                ]
        ]
        Map metadata = [multimedia: multimedia]

        def response = imageService.uploadImage(request.contextPath, params.opusId, params.profileId, request.getParameter("dataResourceId"), metadata, transferrable)

        handle response
    }

    @Secured(role = ROLE_PROFILE_EDITOR)
    def deleteLocalImage() {
        if (!params.opusId || !params.profileId || !params.imageId || !params.type) {
            badRequest "opusId, profileId, imageId and type are required parameters"
        } else {
            try {
                ImageType imageType = params.type as ImageType

                boolean deleted = false

                if (imageType == ImageType.STAGED) {
                    deleted = imageService.deleteStagedImage(params.opusId, params.profileId, params.imageId)
                } else if (imageType == ImageType.PRIVATE) {
                    deleted = imageService.deletePrivateImage(params.opusId, params.profileId, params.imageId)
                }

                render([success: deleted] as JSON)
            } catch (IllegalArgumentException e) {
                log.warn(e)
                badRequest "Invalid image type ${params.type}"
            }
        }
    }

    @PrivateCollectionSecurityExempt
    def retrieveLocalThumbnailImage() {
        if (!params.type) {
            badRequest "type is a required parameter"
        } else {
            try {
                ImageType type = params.type as ImageType
                //NB this imageId param already has the file extension on it, really the file name on disk
                if (type == ImageType.STAGED) {
                    displayLocalImage("${grailsApplication.config.image.staging.dir}/", params.opusId, params.profileId, params.fileName, true)
                } else if (type == ImageType.PRIVATE) {
                    displayLocalImage("${grailsApplication.config.image.private.dir}/", params.opusId, params.profileId, params.fileName, true)
                }
            } catch (IllegalArgumentException e) {
                log.warn(e)
                badRequest "Invalid image type ${params.type}"
            }
        }
    }
    //We want the full size image
    def getLocalImage() {
        if (!params.type) {
            badRequest "type is a required parameter"
        } else {
            try {
                ImageType type = params.type as ImageType
                //NB this imageId param already has the file extension on it, really the file name on disk
                if (type == ImageType.STAGED) {
                    displayLocalImage("${grailsApplication.config.image.staging.dir}/", params.opusId, params.profileId, params.fileName, false)
                } else if (type == ImageType.PRIVATE) {
                    displayLocalImage("${grailsApplication.config.image.private.dir}/", params.opusId, params.profileId, params.fileName, false)
                }
            } catch (IllegalArgumentException e) {
                log.warn(e)
                badRequest "Invalid image type ${params.type}"
            }
        }
    }

    @PrivateCollectionSecurityExempt
    def downloadTempFile() {
        downloadFile("${grailsApplication.config.temp.file.location}", params.fileId)
    }

    //In the sense that the private or staged images are fetched from disk for display on the profile page
    //note we are supporting 2 possible file locations for backwards compatibility
    private displayLocalImage(String path, String collectionId, String profileId, String fileName, Boolean thumbnail) {
        if (!fileName) {
            badRequest "fileId is a required parameter"
        } else {
            File file
            String imageId = fileName.substring(0, fileName.lastIndexOf("."))
            if (thumbnail) {
                String thumbnailName = makeThumbnailName(fileName)
                file = new File("${path}/${collectionId}/${profileId}/${imageId}/${imageId}_thumbnails/${thumbnailName}")
                if (!file.exists()) {  //use the image if there is no thumbnail
                    file = new File("${path}/${collectionId}/${profileId}/${imageId}/${fileName}")
                }
            } else {
                file = new File("${path}/${collectionId}/${profileId}/${imageId}/${fileName}")
            }

            if (!file.exists()) {  //support for version 1 file locations
                file = new File("${path}/${profileId}/${fileName}")
            }
            if (!file.exists()) {
                notFound "The requested file could not be found"
            } else {
                response.setHeader("Content-disposition", "attachment;filename=${fileName}")
                response.setContentType(Utils.getContentType(file))
                file.withInputStream { response.outputStream << it }
            }
        }
    }

    private downloadFile(String path, String filename) {
        if (!filename) {
            badRequest "fileId is a required parameter"
        } else {
            File file = new File("${path}/${filename}")

            if (!file.exists()) {
                notFound "The requested file could not be found"
            } else {
                response.setHeader("Content-disposition", "attachment;filename=${filename}")
                response.setContentType(Utils.getContentType(file))
                file.withInputStream { response.outputStream << it }
            }
        }
    }

    private String makeThumbnailName(String fileName) {
        String extension = Utils.getExtension(fileName)
        String imageId = fileName.substring(0, fileName.lastIndexOf('.'))
        "${imageId}_thumbnail${extension}"
    }

    def retrieveSpeciesProfile() {
        if (!params.guid) {
            badRequest "GUID is a required parameter"
        } else {
            def response = profileService.getSpeciesProfile(params.guid)

            handle response
        }
    }

    def retrievePublication() {
        if (!params.profileId) {
            badRequest "profileId is a required parameter"
        } else {
            def response = profileService.getPublications(params.opusId as String, params.profileId as String)

            handle response
        }
    }

    def proxyPublicationDownload() {
        final pubId = params.publicationId as String
        if (!pubId) {
            badRequest "Publication Id must be provided"
        } else {
            final opusId = params.opusId as String
            final profileId = params.profileId as String
            log.info("Proxying publication download opus $opusId, $profileId, $pubId")
            profileService.proxyGetPublicationFile(response, opusId, profileId, pubId)
        }
    }

    def getPublication() {
        def pubId = params.pubId;
        if (!pubId) {
            badRequest "Publication Id must be provided";
        } else {
            def pubJson = profileService.getPublications(pubId)
            if (!pubJson) {
                notFound()
            } else {
                boolean latest = params.isOpusReviewer || params.isOpusAuthor || params.isOpusAdmin || params.isOpusEditor
                def profile = profileService.getProfile(pubJson.opusId, pubJson.profileId, latest)

                if (!profile) {
                    notFound()
                } else {
                    Map model = profile
                    model << commonModelEntries(profile.opus, profile, false)
                    model.publications = pubJson.publications

                    render view: "publication", model: model;
                }
            }
        }
    }

    @Secured(role = ROLE_PROFILE_EDITOR)
    def updateAuthorship() {
        def json = request.getJSON()

        if (!params.profileId || !json) {
            badRequest "profileId and a json body are required parameters"
        } else {
            def response = profileService.updateAuthorship(params.opusId as String, params.profileId as String, json)

            handle response
        }
    }

    def getFeatureLists() {
        if (!params.profileId || !params.opusId) {
            badRequest "profile id and opus id must be provided";
        } else {
            def response = profileService.getFeatureLists(params.opusId, params.profileId);
            render response as JSON
        }
    }

    def checkName() {
        if (!params.opusId || !params.scientificName) {
            badRequest "opusId and scientificName are required parameters"
        } else {
            def response = profileService.checkName(params.opusId as String, params.scientificName as String)

            handle response
        }
    }

    def getPublicationJson() {
        if (!params.pubId) {
            badRequest "Publication Id must be provided";
        } else {
            def result = profileService.getPublications(params.pubId);
            handle result;
        }
    }

    def getAttachmentMetadata() {
        if (!params.opusId || !params.profileId) {
            badRequest "opusId and profileId are required parameters"
        } else {
            boolean latest = params.isOpusReviewer || params.isOpusAuthor || params.isOpusAdmin || params.isOpusEditor

            def result = profileService.getAttachmentMetadata(params.opusId, params.profileId, params.attachmentId ?: null, latest)

            handle result
        }
    }

    @Secured(role = ROLE_PROFILE_EDITOR)
    def saveAttachment() {
        if (!params.opusId || !params.profileId || !(request instanceof MultipartHttpServletRequest) || !request.getParameter("data")) {
            badRequest "opusId and profile are required parameters, a JSON data paramaeter must be provided, and the request must be a multipart request"
        } else if (request instanceof AbstractMultipartHttpServletRequest) {
            if (request.fileNames && request.getFile(request.fileNames[0]).contentType != "application/pdf") {
                badRequest "Invalid file type - must be one of [PDF]"
            } else {
                Map attachment = new JsonSlurper().parseText(request.getParameter("data"))

                if (!attachment.uuid && !attachment.url) {
                    attachment.filename = request.getFile("file").originalFilename
                }

                def result = profileService.saveAttachment(params.opusId, params.profileId, attachment, request)

                handle result
            }
        } else {
            badRequest "Request is not multipart"
        }
    }

    @Secured(role = ROLE_PROFILE_EDITOR)
    def deleteAttachment() {
        if (!params.opusId || !params.profileId || !params.attachmentId) {
            badRequest "opusId, profileId and attachmentId are required parameters"
        } else {
            def result = profileService.deleteAttachment(params.opusId, params.profileId, params.attachmentId)

            handle result
        }
    }

    def proxyAttachmentDownload() {
        final attachmentId = params.attachmentId as String
        if (!attachmentId) {
            badRequest "Attachment Id must be provided"
        } else {
            final opusId = params.opusId as String
            final profileId = params.profileId as String
            log.info("Proxying attachment download opus: $opusId, profile: $profileId, attachment: $attachmentId")
            profileService.proxyAttachmentDownload(response, opusId, profileId, attachmentId)
        }
    }


    @Secured(role = ROLE_PROFILE_EDITOR)
    def createMapSnapshot(@NotNull String opusId, @NotNull String profileId) {
        Map json = request.getJSON()
        String occurrenceQuery = json?.occurrenceQuery
        String extents = json?.extents
        if (!occurrenceQuery) {
            badRequest "A json body with an occurrenceQuery property are required"
        } else {
            def opusAndProfile = profileService.getProfile(opusId, profileId, true)
            mapService.createMapSnapshot(opusAndProfile.opus, opusAndProfile.profile, occurrenceQuery,
                    extents)
            success([mapSnapshotUrl: mapService.getSnapshotImageUrlWithUUIDs(
                    request.contextPath, opusAndProfile.opus.uuid, opusAndProfile.profile.uuid)])
        }
    }

    @Secured(role = ROLE_PROFILE_EDITOR)
    def deleteMapSnapshot(@NotNull String opusId, @NotNull String profileId) {
        def opusAndProfile = profileService.getProfile(opusId, profileId)
        if (!opusAndProfile || !opusAndProfile.profile) {
            notFound "The requested profile does not exist"
        } else {
            mapService.deleteMapSnapshot(opusAndProfile.opus.uuid, opusAndProfile.profile.uuid)
            success([:])
        }
    }

    def attributesPanel = {
        render template: "attributes"
    }

    def linksPanel = {
        render template: "links"
    }

    def bhlLinksPanel = {
        render template: "bhlLinks"
    }

    def taxonPanel = {
        render template: "taxon"
    }

    def imagesPanel = {
        render template: "images"
    }

    def mapPanel = {
        render template: "map"
    }

    def listsPanel = {
        render template: "lists"
    }

    def bibliographyPanel = {
        render template: "bibliography"
    }

    def specimenPanel = {
        render template: "specimens"
    }

    def commentsPanel = {
        render template: "comments"
    }

    def authorPanel = {
        render template: "authorship"
    }

    def editNamePanel = {
        render template: "editNamePanel"
    }

    def formatNamePanel = {
        render template: "formatNamePanel"
    }

    def auditHistoryPanel = {
        render template: "profileAuditHistory"
    }

    def nomenclaturePanel = {
        render template: "nomenclaturePanel"
    }

    private String modelAsJavascript(def model) {

        if (!(model instanceof JSONObject) && !(model instanceof JSONArray)) {
            model = model as JSON

        }
        def json = (model ?: [:] as JSON)
        def modelJson = json.toString()
        modelJson.encodeAsJavaScript()
    }

    /**
     * Proxies to the profile services profile controller to create or update a document.
     * @param documentId the documentId of the document to update (if not supplied, a create operation will be assumed).
     * @return the result of the update.
     */
    @Secured(role = ROLE_PROFILE_EDITOR)
    def documentUpdate(String documentId) {

        log.debug("In documentUpdate for ID: ${documentId}")

        String opusId = params.opusId
        String profileId = params.profileId

        log.debug("opusId: ${opusId}")
        log.debug("profileId: ${profileId}")


        Map document = request.getJSON()

        def result = profileService.updateDocument(opusId, profileId, document)

        if (result.error) {
            response.sendError(500, "Couldn't update document")
        } else {
            def respondObj = result.resp
            respond(respondObj)
        }
    }

    /**
     * Proxies to the profile services profile controller to delete the document with the supplied documentId.
     * @param documentId the documentId of the document to delete.
     * @return the result of the deletion.
     */
    @Secured(role = ROLE_PROFILE_EDITOR)
    def documentDelete(String documentId) {
        log.debug("In documentDelete for ID: ${documentId}")

        String opusId = params.opusId
        String profileId = params.profileId

        log.debug("opusId: ${opusId}")
        log.debug("profileId: ${profileId}")

        def result = profileService.deleteDocument(opusId, profileId, documentId)
        render status: result.statusCode
    }

    @Secured(role = ROLE_PROFILE_EDITOR)
    def setPrimaryMultimedia() {
        log.debug("setPrimaryMultimedia()")

        String opusId = params.opusId
        String profileId = params.profileId

        log.debug("opusId: ${opusId}")
        log.debug("profileId: ${profileId}")

        Map doc = request.getJSON()

        def result = profileService.setPrimaryMultimedia(opusId, profileId, doc)

        if (result.error) {
            response.sendError(500, "Couldn't update primary multimedia")
        } else {
            response.sendError(204)
        }
    }

    @Secured(role = ROLE_PROFILE_EDITOR)
    def setStatus() {
        log.debug('setStatus()')

        String opusId = params.opusId
        String profileId = params.profileId

        Map doc = request.getJSON()
        def result = profileService.setStatus(opusId, profileId, doc)

        if (result.error) {
            response.sendError(500, "Couldn't update status")
        } else {
            response.sendError(204)
        }
    }

    def commonModelEntries(opus, profile, boolean edit) {
        [
                edit                : edit,

                aboutPageUrl        : getAboutUrl(opus, profile),
                bannerItems         : getBannerItems(opus, false, true),
                browseUrl           : getBrowseUrl(opus),
                contact             : opus.contact,
                currentUser         : authService.getDisplayName(),
                documentsUrl        : getDocumentsUrl(opus),
                filterUrl           : getFilterUrl(opus),
                footerText          : opus.footerText,
                glossaryUrl         : getGlossaryUrl(opus),
                hasFilter           : authService.userId ? opus.florulaListId : florulaCookieService.getFlorulaListIdForOpusId(request, opus.uuid),
                identifyUrl         : getIdentifyUrl(opus),
                opusUrl             : getOpusUrl(opus),
                reportsUrl          : getReportsUrl(opus),
                searchUrl           : getSearchUrl(opus),
        ]
    }
}

