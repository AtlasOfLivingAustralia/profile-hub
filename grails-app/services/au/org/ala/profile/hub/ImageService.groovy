package au.org.ala.profile.hub

import au.org.ala.images.thumb.ImageThumbnailer
import au.org.ala.images.thumb.ThumbDefinition
import au.org.ala.images.tiling.ImageTiler
import au.org.ala.images.tiling.ImageTilerConfig
import au.org.ala.ws.service.WebService
import groovy.json.JsonSlurper
import org.apache.commons.io.FileUtils
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.apache.http.entity.ContentType

import static au.org.ala.profile.hub.Utils.encPath
import static groovy.json.JsonOutput.*
import javax.imageio.ImageIO
import java.awt.*
import java.awt.image.BufferedImage
import java.util.List

import static au.org.ala.profile.hub.Utils.getExtension
import static au.org.ala.profile.hub.Utils.isHttpSuccess
import static org.apache.http.HttpStatus.SC_OK

/**
 * Provides support to "local" private and staged images, publishing of uploaded images to BioCache and retrieval of
 * images from BioCache.
 *
 * The on disk directory structure for private images is:
 * /data/profile-hub/private_images/collectionId/profileUUID/imageID/imageID.jpg.
 *
 * The on disk directory structure for staged images is:
 * /data/profile-hub/staged_images/collectionId/profileUUID/imageID/imageID.jpg.
 *
 * The deprecated methods in this class are retained to support users using a previous version that has a different
 * file storage structure for private and staged images
 *
 */

class ImageService {
    ProfileService profileService
    BiocacheService biocacheService
    WebService webService
    def grailsApplication

    static final String separator = File.separator
    static final Integer THUMBNAIL_MAX_SIZE = 300

    private getMetadataFromAlaImageService(String imageId) {
        webService.get("${grailsApplication.config.images.service.url}/ws/image/${imageId}", [:], ContentType.APPLICATION_JSON, false, true)
    }

    String constructImageUrl(String contextPath, String opusId, String profileId, String imageId, String extension, String imageType, ImageUrlType urlType) {
        String url =  "${contextPath}/opus/${opusId}/profile/${profileId}/image/"

        switch (urlType) {
            case ImageUrlType.FULL:
                url += "${imageId}${extension}"
                break
            case ImageUrlType.THUMBNAIL:
                url += "thumbnail/${imageId}${extension}"
                break
            case ImageUrlType.TILE:
                url += "${imageId}/tile/{z}/{x}/{y}"
                break
        }

        url += "?type=${imageType}"

        url
    }

    /**
     * When you click on an image in the UI, this method retrieves the image
     * @param imageId
     * @param contextPath
     * @param includeFile
     * @return details required by ALA image plugin
     */
    Map getImageDetails(String imageId, String contextPath, boolean localImage = true, boolean includeFile = false) {
        Map imageDetails = [:]

        Map response = localImage ? profileService.getImageMetadata(imageId) : getMetadataFromAlaImageService(imageId)

        if (isHttpSuccess(response.statusCode as int)) {
            Map<String, String> imageProperties = response.resp as Map

            if (localImage) {
                String dir = imageProperties.type as ImageType == ImageType.PRIVATE ? "${grailsApplication.config.image.private.dir}" : "${grailsApplication.config.image.staging.dir}"
                String extension = getExtension(imageProperties.originalFileName)
                String imageUrl
                String thumbnailUrl
                int tileZoomLevels
                String tileUrlPattern

                File file = getLocalImageFile(dir, imageProperties.opusId, imageProperties.profileId, imageId, extension)

                if (file?.exists()) {
                    String tileLocation = buildFilePath(dir, imageProperties.opusId, imageProperties.profileId, imageId) + separator + imageId + '_tiles/'
                    imageUrl = constructImageUrl(contextPath, imageProperties.opusId, imageProperties.profileId, imageId, extension, imageProperties.type, ImageUrlType.FULL)
                    thumbnailUrl = constructImageUrl(contextPath, imageProperties.opusId, imageProperties.profileId, imageId, extension, imageProperties.type, ImageUrlType.THUMBNAIL)
                    tileZoomLevels = new File(tileLocation)?.listFiles()?.size()
                    tileUrlPattern = constructImageUrl(contextPath, imageProperties.opusId, imageProperties.profileId, imageId, extension, imageProperties.type, ImageUrlType.TILE)

                } else {  //provide support for previously used file directory structure
                    file = getLocalImageFile(dir, imageProperties.profileId, imageId, extension)
                    imageUrl = "${contextPath}/opus/${imageProperties.opusId}/profile/${imageProperties.profileId}/image/${imageId}${extension}?type=${imageProperties.type}"
                    thumbnailUrl = "${contextPath}/opus/${imageProperties.opusId}/profile/${imageProperties.profileId}/image/${imageId}${extension}?type=${imageProperties.type}"
                    tileZoomLevels = new File("${dir}/${imageProperties.profileId}/${imageId}_tiles/")?.listFiles()?.size()
                    tileUrlPattern = "${contextPath}/profile/${imageProperties.profileId}/image/${imageId}/tile/{z}/{x}/{y}?type=${imageProperties.type}"
                }
                BufferedImage bufferedImage = ImageIO.read(file)
                // additional metadata about the physical image, required by the image client plugin
                imageDetails = [
                        success       : true,
                        imageUrl      : imageUrl,
                        thumbnailUrl  : thumbnailUrl,
                        width         : bufferedImage.getWidth(),
                        height        : bufferedImage.getHeight(),
                        tileZoomLevels: tileZoomLevels,
                        tileUrlPattern: tileUrlPattern
                ]

                if (includeFile) {
                    imageDetails.bufferedImage = bufferedImage
                    imageDetails.file = file
                }
            } else {
                imageProperties << [thumbnailUrl: imageProperties.imageUrl.replace("/original", "/thumbnail")]
            }

            if (!imageProperties.metadata) {
                // extract the metadata from the image service response and place it in a 'metadata' map so we have the
                // same format as for local images
                Map metadata = [:]
                metadata.rightsHolder = imageProperties.rightsHolder
                metadata.dateTaken = imageProperties.dateTaken
                metadata.creator = imageProperties.creator
                metadata.license = imageProperties.license
                metadata.description = imageProperties.description
                metadata.title = imageProperties.title
                metadata.rights = imageProperties.rights
                imageProperties.metadata = metadata
            }

            imageDetails.putAll(imageProperties)
            imageDetails.imageId = imageId
        }

        imageDetails
    }

    File getTile(String collectionId, String profileId, String imageId, String type, int zoom, int x, int y) {
        String baseDir = type as ImageType == ImageType.PRIVATE ? "${grailsApplication.config.image.private.dir}" : "${grailsApplication.config.image.staging.dir}"
        String fileLocation = buildFilePath(baseDir, collectionId, profileId, imageId)
        new File(fileLocation + "/${imageId}_tiles/${zoom}/${x}/${y}.png")
    }

    def uploadImage(String contextPath, String opusId, String profileId, String dataResourceId, Map metadata, Transferrable file) {
        Map profileAndOpus = profileService.getProfile(opusId, profileId, true)

        metadata.scientificName = profileAndOpus.profile.scientificName
        metadata.contentType = file.contentType

        def response

        boolean imageIsStoredLocally

        if (profileAndOpus.profile.privateMode && !profileAndOpus.opus.keepImagesPrivate) {
            // if the collection is public and the profile is in draft mode, then stage the image: it will be
            // uploaded to the biocache when the profile's draft is released
            try {
                storeLocalImage(profileAndOpus.opus, profileAndOpus.profile, metadata, file, "${grailsApplication.config.image.staging.dir}")
            } catch (IOException exception) {
                log.error("Error saving local staged image ", exception)
            }
            response = profileService.recordStagedImage(opusId, profileId, metadata)
            imageIsStoredLocally = true
        } else if (profileAndOpus.opus.keepImagesPrivate) {
            // if the admin has elected not to publish images, then store the image in the local image dir
            try {
                storeLocalImage(profileAndOpus.opus, profileAndOpus.profile, metadata, file, "${grailsApplication.config.image.private.dir}")
            } catch (IOException exception) {
                log.error("Error saving local private image ", exception)
            }
            response = profileService.recordPrivateImage(opusId, profileId, metadata)
            imageIsStoredLocally = true
        } else {
            // if the profile is not in draft mode, upload the image to the biocache immediately
            response = biocacheService.uploadImage(opusId, profileAndOpus.profile.uuid, dataResourceId, file, metadata, profileAndOpus.opus.usePrivateRecordData)
            metadata.imageId = response?.resp?.images ? sanitiseId( response.resp.images[0]) : null
            imageIsStoredLocally = false
        }

        if (response && isHttpSuccess(response.statusCode as int)) {
            response.resp = getImageDetails(metadata.imageId, contextPath, imageIsStoredLocally)
        }

        response
    }

    void storeLocalImage(Map opus, Map profile, Map metadata, Transferrable file, String directory) throws IOException {
        String extension = file.fileExtension ?: metadata.extension
        metadata.imageId = metadata.imageId ?: UUID.randomUUID().toString()
        metadata.action = "add"
        String fileLocation = buildFilePath(directory, opus.uuid, profile.uuid, metadata.imageId)
        File localDir = new File(fileLocation)
        localDir.mkdirs()

        File imageFile = new File(localDir, "${metadata.imageId}${extension}")
        file.transferTo(imageFile)

        // create tiles
        File tileDir = new File(localDir, "${metadata.imageId}_tiles")
        tileDir.mkdirs()
        ImageTiler tiler = new ImageTiler(new ImageTilerConfig())
        tiler.tileImage(imageFile, tileDir)

        List<ThumbDefinition> thumbDefinitionList = new ArrayList<ThumbDefinition>(1)
        thumbDefinitionList.add(new ThumbDefinition(THUMBNAIL_MAX_SIZE, false, Color.white, "${metadata.imageId}_thumbnail${extension}"))
        makeThumbNails(localDir, "${metadata.imageId}_thumbnails", imageFile, thumbDefinitionList)

    }

    private
    static makeThumbNails(File parentDirectory, String thumbDir, File imageFile, List<ThumbDefinition> definitionList) throws IOException {
        File thumbnailDirectory = new File(parentDirectory, thumbDir)
        if (!thumbnailDirectory.exists()) {
            thumbnailDirectory.mkdir()
        }
        ImageThumbnailer imageThumbnailer = new ImageThumbnailer()
        byte[] imageBytes = FileUtils.readFileToByteArray(imageFile)
        imageThumbnailer.generateThumbnails(imageBytes, thumbnailDirectory, definitionList)
    }

    File getLocalImageFile(String directory, String collectionId, String profileId, String imageId, String extension) {
        new File("${directory}/$collectionId/${profileId}/${imageId}/${imageId}${extension}")
    }

    def deleteStagedImage(String opusId, String profileId, String imageId) {
        boolean deleted = false;

        def profile = profileService.getProfile(opusId, profileId, true)

        if (profile && profile.profile.stagedImages) {
            deleted = deleteLocalImage(profile.profile.stagedImages, opusId, profile.profile.uuid, imageId, "${grailsApplication.config.image.staging.dir}")

            if (deleted) {
                profileService.recordStagedImage(opusId, profileId, [imageId: imageId, action: "delete"])
            } else {
                log.warn("Failed to delete staged image ${imageId}")
            }
        }

        deleted
    }

    def deletePrivateImage(String opusId, String profileId, String imageId) {
        boolean deleted = false;

        def profile = profileService.getProfile(opusId, profileId, true) //profileId is its name, not its uuid

        if (profile && profile.profile.privateImages) {
            deleted = deleteLocalImage(profile.profile.privateImages, opusId, profile.profile.uuid, imageId, "${grailsApplication.config.image.private.dir}")
            if (deleted) {
                profileService.recordPrivateImage(opusId, profileId, [imageId: imageId, action: "delete"])
            } else {
                log.warn("Failed to delete private image ${imageId}")
            }
        }

        deleted
    }

    def deleteSnapshotImage(String directory, String opusId, String profileId, String imageId) {
        def dirPath = buildFilePath(directory, opusId, profileId, imageId);
        File dir = new File(dirPath)
        deleteDirectoryAndContents(dir)
    }

    def retrieveImagesPaged(String opusId, String profileId, boolean latest, String searchIdentifier, boolean useInternalPaths = false, boolean readonlyView = true, int pageSize, int startIndex) {
        Map response = [:]
        List combinedImages = []
        Integer numberOfLocalImages = 0
        Integer numberOfPublishedImages = 0
        Map model = profileService.getProfile(opusId, profileId, latest)
        Map profile = model.profile
        Map opus = model.opus
        String includeExcludeQuery = ""
        ImageOption opusDefaultOption = ImageOption.byName(opus.approvedImageOption, ImageOption.INCLUDE)
        Integer numberOfIncludedLocalImages = 0;


        switch (opusDefaultOption) {
            case ImageOption.INCLUDE:
                List excluded = profile?.imageSettings.findAll { isExcluded(opusDefaultOption, it?.displayOption?.toString()) }*.imageId
                //find all private images from profile imageSettings with same imageId from profile privateImages because there is no private info in imageSettings
                List privateImages = profile?.imageSettings.findAll {profile?.privateImages?.imageId.contains(it?.imageId?.toString())}
                if (privateImages?.size() > 0) {
                    List excludedPrivateImages = privateImages?.findAll { isExcluded(opusDefaultOption, it?.displayOption?.toString()) }*.imageId
                    if (excludedPrivateImages?.size() > 0) {
                        numberOfIncludedLocalImages = privateImages.size() - excludedPrivateImages.size()
                    } else {
                        numberOfIncludedLocalImages = privateImages.size()
                    }
                }

                if ((excluded?.size() > 0) && readonlyView) {
                    includeExcludeQuery = excluded.collect { "-image_url:$it" }.join(' AND ')
                }
                break
            case ImageOption.EXCLUDE:
                List included = profile?.imageSettings.findAll { isIncluded(opusDefaultOption, it?.displayOption?.toString()) }*.imageId
                //find all private images from profile imageSettings with same imageId from profile privateImages because there is no private info in imageSettings
                List privateImages = profile?.imageSettings.findAll {profile?.privateImages?.imageId.contains(it?.imageId?.toString())}
                List includedPrivateImages = privateImages?.findAll { isIncluded(opusDefaultOption, it?.displayOption?.toString()) }*.imageId
                numberOfIncludedLocalImages = (includedPrivateImages)? includedPrivateImages.size() : 0
                if ((included?.size() > 0) && readonlyView) {
                    includeExcludeQuery = "(" + included.collect { "image_url:$it" }.join(' OR ') + ")"
                }
                break
        }

        Map numberOfPublishedImagesMap = biocacheService.imageCount(searchIdentifier, opus, includeExcludeQuery)
        if (numberOfPublishedImagesMap && numberOfPublishedImagesMap?.resp && numberOfPublishedImagesMap?.resp?.totalRecords > 0) {
            numberOfPublishedImages = numberOfPublishedImagesMap?.resp?.totalRecords
        }

        //1.PRIVATE IMAGES
        // The collection may now, or may have been at some point, private, so look for any private images that may exist.
        // When a collection is changed from private to public, existing private images are NOT published automatically.
        // A public collection can also have private images depending on the settings of "Image Visibility" in the Image Options section of the collection admin page
        if (profile.privateImages) {
            if (profile.privateImages?.size() > 0) {
                numberOfLocalImages = profile.privateImages.size()
            }
            List privateImagesPaged = pageImages(profile.privateImages, startIndex, pageSize)
            if (privateImagesPaged && privateImagesPaged.size() > 0) {
                combinedImages.addAll(convertLocalImages(privateImagesPaged, opus, profile, ImageType.PRIVATE, useInternalPaths, readonlyView))
            }
        }

        //2.STAGED IMAGES
        //we want to display the images in a specific order - private, staged, published
        if (profile.privateMode && profile.stagedImages) {
            numberOfLocalImages += profile.stagedImages.size()
            if (combinedImages.size() < pageSize && profile.stagedImages.size() > 0) {
                Integer newPageSize = pageSize - combinedImages.size() //partial page of private images
                Integer newStartIndex = startIndex - profile.privateImages.size() + combinedImages.size()
                List stagedImagesPaged = pageImages(profile.stagedImages, newStartIndex, newPageSize)
                if (stagedImagesPaged && stagedImagesPaged.size() > 0) {
                    combinedImages.addAll(convertLocalImages(stagedImagesPaged, opus, profile, ImageType.STAGED, useInternalPaths, readonlyView))
                }
            }

        }

        Map publishedImagesMap = [:]
        //3.PUBLISHED IMAGES
        if (combinedImages.size() < Integer.valueOf(pageSize) && numberOfPublishedImagesMap && numberOfPublishedImagesMap?.size() > 0) {
            Integer newPageSize = Integer.valueOf(pageSize) - combinedImages.size() //partial page of private images
//            Integer newStartIndex = Integer.valueOf(startIndex) - numberOfLocalImages + combinedImages.size()
            Integer newStartIndex = Integer.valueOf(startIndex) - ((numberOfIncludedLocalImages > 0)? numberOfIncludedLocalImages : numberOfLocalImages) + combinedImages.size()
            if (newStartIndex < 0) newStartIndex = 0

            List publishedImageList = []

            if (readonlyView) {
                publishedImagesMap = biocacheService.retrieveImages(searchIdentifier, opus, newPageSize, newStartIndex, "&fl=id,image_url", includeExcludeQuery)
            } else {
                publishedImagesMap = biocacheService.retrieveImages(searchIdentifier, opus, newPageSize, newStartIndex)
            }
            if (publishedImagesMap?.resp?.occurrences?.size() > 0) {
                publishedImageList = prepareImagesForDisplay(publishedImagesMap, opus, profile, readonlyView)
            }
            if (publishedImageList && publishedImageList.size() > 0) {
                combinedImages.addAll(publishedImageList)
            }
        }
        response.statusCode = SC_OK
        //we don't have support for JSON objects or serialization so this is a workaround
        response.resp = [:]
        response.resp.images = combinedImages
        response.resp.count = numberOfPublishedImages + numberOfLocalImages

        if (!readonlyView) {
            response.resp.availImagesCount = publishedImagesMap?.resp?.totalRecords + numberOfLocalImages
        } else {
            response.resp.count = numberOfPublishedImages + ((numberOfIncludedLocalImages > 0)? numberOfIncludedLocalImages : 0)
            response.resp.availImagesCount   = response.resp.count
        }

        if (profile.primaryImage) {
            response.resp.primaryImage = getPrimaryImageMetaData(opus, profile, combinedImages)
        }
        response
    }

    List pageImages(List privateImages, Integer offset, Integer pageSize) {
        List imagesPage = []
        Integer totalNumberOfImages = privateImages.size()
        if (offset < totalNumberOfImages) {
            Integer start = offset
            if (start >= totalNumberOfImages) {
                start = totalNumberOfImages - 1
            }
            Integer end = pageSize + offset - 1
            if (end >= totalNumberOfImages) {
                end = totalNumberOfImages - 1
            }
            imagesPage = privateImages[start..end]
        }
        imagesPage
    }

    def retrieveImages(Map opus, Map profile, String searchIdentifier, boolean useInternalPaths = false, boolean readonlyView = true) {
        Map response = [:]
        List allImages = []

        //we want to display the images in a specific order - staged, private, published
        if (profile.privateMode && profile.stagedImages) {
            allImages.addAll(convertLocalImages(profile.stagedImages, opus, profile, ImageType.STAGED, useInternalPaths, readonlyView))
        }

        // The collection may now, or may have been at some point, private, so look for any private images that may exist.
        // When a collection is changed from private to public, existing private images are NOT published automatically.
        if (profile.privateImages) {
            allImages.addAll(convertLocalImages(profile.privateImages ?: [], opus, profile, ImageType.PRIVATE, useInternalPaths, readonlyView))
        }

        def publishedImagesMap = biocacheService.retrieveImages(searchIdentifier, opus)
        if (publishedImagesMap?.resp?.occurrences?.size() > 0) {
            List publishedImageList = prepareImagesForDisplay(publishedImagesMap, opus, profile, readonlyView)
            allImages.addAll(publishedImageList)
        }

        response.statusCode = SC_OK
        response.resp = allImages

        response
    }

    def retrieveImages(String opusId, String profileId, boolean latest, String searchIdentifier, boolean useInternalPaths = false, boolean readonlyView = true) {
        def model = profileService.getProfile(opusId, profileId, latest)
        def profile = model.profile
        def opus = model.opus

        retrieveImages(opus, profile, searchIdentifier, useInternalPaths, readonlyView)
    }

    Map getPrimaryImageMetaData(opus, profile, biocacheImagesList = null) {

        Map image = null
        if (profile.primaryImage && profile.primaryImage != {}) {

            def imageId = profile.primaryImage

            Map imageData = webService.get("${grailsApplication.config.images.service.url}/ws/getImageInfo", [id: imageId, includeMetadata:true], ContentType.APPLICATION_JSON, false, false)

            log.debug ("Obtained imageData map from " + "${grailsApplication.config.images.service.url}/ws/getImageInfo?id=${imageId}&includeMetadata=true ")

            boolean excluded = isExcluded(opus.approvedImageOption, profile.imageSettings ?: null, imageId)

            // If image id doesn't exist in image service, it returned {"success": false}, for eg: http://images-dev.ala.org.au/ws/getImageInfo?id=4552bea3-ca16-46c0-ae03-f2e3e91d2d08&includeMetadata=true
            if (!excluded && (imageData.resp && !imageData.resp.isEmpty()) && !(imageData.resp.containsKey("success") && imageData.resp.success == false)) {

                def occurrenceId = imageData.resp.metadata?.find { it.key == 'occurrenceId' }?.getAt("value")
                def dataResourceId = imageData.resp.dataResourceUid

                Map dataResource = webService.get("${grailsApplication.config.collectory.base.url}/ws/dataResource/${dataResourceId}", [:], ContentType.APPLICATION_JSON, false, false)
                        //getJSON("${grailsApplication.config.collectory.base.url}/ws/dataResource/${dataResourceId}")

                log.debug ("Obtained dataResource map from " + "${grailsApplication.config.collectory.base.url}/ws/dataResource/${dataResourceId}")
                log.debug (toJson(dataResource))

                image = [
                        imageId         : imageId,
                        occurrenceId    : occurrenceId,
                        largeImageUrl   : "${grailsApplication.config.images.service.url}/image/proxyImageThumbnailLarge?imageId=${imageId}", //"largeImageUrl" -> "http://images.ala.org.au/image/proxyImageThumbnailLarge?imageId=e896221a-537f-4b36-95a4-ef29909053d1"
                        thumbnailUrl    : "${grailsApplication.config.images.service.url}/image/proxyImageThumbnail?imageId=${imageId}", //"thumbnailUrl" -> "http://images.ala.org.au/image/proxyImageThumbnail?imageId=e896221a-537f-4b36-95a4-ef29909053d1"
                        dataResourceName: dataResource?.resp?.name,
                        excluded        : excluded,
                        displayOption   : excluded ? ImageOption.EXCLUDE.name() : ImageOption.INCLUDE.name(),
                        caption         : profile.imageSettings.find {
                            it.imageId == imageId
                        }?.caption ?: '',
                        primary         : imageId == profile.primaryImage,
                        metadata        : [creator      : imageData.resp.creator, description: imageData.resp.description, fileSize: imageData.resp.sizeInBytes,
                                           height       : imageData.resp.height, imageId: imageId, imageUrl: imageData.resp.imageUrl,
                                           largeThumbUrl: "${grailsApplication.config.images.service.url}/image/proxyImageThumbnailLarge?imageId=${imageId}",
                                           license      : imageData.resp.license, mimetype: imageData.resp.mimeType, squareThumbUrl: '', thumbHeight: '',
                                           thumbUrl     : "${grailsApplication.config.images.service.url}/image/proxyImageThumbnail?imageId=${imageId}",
                                           thumbWidth   : '', titleZoomLevels: imageData.resp.titleZoomLevels,
                                           title        : imageData.resp.title, created: imageData.resp.created,
                                           rights       : imageData.resp.rights, rightsHolder: imageData.resp.rightsHolder, width: imageData.resp.width], //imageData.imageMetadata && !imageData.imageMetadata.isEmpty() ? imageData.imageMetadata[0] : [:],
                        type            : ImageType.OPEN
                ]

                log.debug ("Printing primary image map")
                log.debug (toJson(image))

            }

        }

        if (!image) {
            //if the primary image has been turned off, then default to the first image in biocache
            if (biocacheImagesList && biocacheImagesList.size() > 0) {
                // get the first image in the list
                image = biocacheImagesList[0]
                log.debug ("Set default primary image to first biocache list image: ")
               // log.debug (toJson(image))
            } else {
                String searchIdentifier = profile.guid ? "lsid:" + profile.guid : profile.scientificName
                List images = retrieveImages(opus, profile, searchIdentifier)?.resp
                if (images && images.size() > 0) {
                    image = images[0]
                    log.debug("Rerieved biocache list from retrieveImages for " + searchIdentifier + " and set default primary image to first list image: ")
               //     log.debug(toJson(image))
                }

            }
        }

        image

    }


    List prepareImagesForDisplay(def retrievedImages, def opus, def profile, boolean readonlyView) {
        List images = []

        if (retrievedImages && isHttpSuccess(retrievedImages.statusCode as int)) {
            List imagesAsMaps = retrievedImages.resp?.occurrences?.findResults { imageData ->

                String imageId = sanitiseId(imageData.image)
                boolean excluded = isExcluded(opus.approvedImageOption, profile.imageSettings ?: null, imageId)

                Map image = [
                        imageId         : imageId,
                        occurrenceId    : imageData.uuid,
                        largeImageUrl   : imageData.largeImageUrl,
                        thumbnailUrl    : imageData.thumbnailUrl,
                        dataResourceName: imageData.dataResourceName,
                        excluded        : excluded,
                        displayOption   : excluded ? ImageOption.EXCLUDE.name() : ImageOption.INCLUDE.name(),
                        caption         : profile.imageSettings.find {
                            it.imageId == imageId
                        }?.caption ?: '',
                        primary         : imageId == profile.primaryImage,
                        metadata        : imageData.imageMetadata && !imageData.imageMetadata.isEmpty() ? imageData.imageMetadata[0] : [:],
                        type            : ImageType.OPEN
                ]

                // only return images that have not been included, unless we are in the edit view, in which case we
                // need to show all available images in order for the editor to decide which to include/exclude
                if ((readonlyView && !excluded) || (!readonlyView)) {
                    image
                }
            }
            if (imagesAsMaps && imagesAsMaps.size() > 0) {
                images.addAll(imagesAsMaps)
            }
        } else {
            log.error("A HTTP status of ${retrievedImages.statusCode} was returned from the biocache image lookup")
        }
        images
    }


    private static boolean deleteLocalImage(List images, String collectionId, String profileId, String imageId, String directory) {
        Log log = LogFactory.getLog(this)
        try {
            String pathToFile = buildFilePath(directory, collectionId, profileId, imageId)
            File localDir = new File(pathToFile)

            if (localDir.exists()) {
                deleteDirectoryAndContents(localDir)
            } else {
                log.warn("Directory [${localDir}] does not exists, trying to delete old image directory structure")
                deleteLocalImage(images, imageId, directory + separator + profileId)
            }
            true
        } catch (Exception e) {
            log.error("Unable to delete local image.", e)
            false
        }
    }

    private static void deleteDirectoryAndContents(File directoryToDelete) {
        Log log = LogFactory.getLog(this)

        log.debug "About to delete [${directoryToDelete}]"
        FileUtils.deleteDirectory(directoryToDelete)
    }

    //RetrieveImages() calls this method and is itself called by ImageService (this class) and ExportService. The
    //latter needs to know the disk location of the images and will send useInternalPaths with a value of true

    List convertLocalImages(List images, Map opus, Map profile, ImageType type, boolean useInternalPaths = false, boolean readonlyView = true) {
        List convertedImages = []
        String imageUrlPrefix = "/opus/${opus.uuid}/profile/${profile.uuid}/image"
        //this is the default, NOT for ExportService

        images?.findResults {
            boolean excluded = isExcluded(opus.approvedImageOption, profile.imageSettings ?: null, it.imageId)

            // only return images that have not been included, unless we are in the edit view, in which case we
            // need to show all available images in order for the editor to decide which to include/exclude
            Map image = null
            String prefix = imageUrlPrefix
            if (!excluded || !readonlyView) {
                String extension = getExtension(it.originalFileName)
                if (useInternalPaths) {
                    //new directory structure include a dir for image, we can have a mix of old and new files
                    prefix = calculatePrefixForFilePath(opus.uuid, profile.uuid, it.imageId)
                }
                image = [
                        imageId         : it.imageId,
                        thumbnailUrl    : "${prefix}/thumbnail/${it.imageId}${extension}?type=${type}",
                        largeImageUrl   : "${prefix}/${it.imageId}${extension}?type=${type}",
                        dataResourceName: opus.title,
                        metadata        : it,
                        excluded        : excluded,
                        displayOption   : excluded ? ImageOption.EXCLUDE.name() : ImageOption.INCLUDE.name(),
                        caption         : profile.imageSettings.find { setting -> setting.imageId == it.imageId }?.caption ?: '',
                        primary         : it.imageId == profile.primaryImage,
                        type            : type
                ]
                convertedImages.add(image)
            }

        }
        convertedImages
    }

    static boolean isCurrentFileStructure(String collectionId, String profileId, String imageId) {
        boolean isNewFileStructure = false
        File imageDir = new File("/data/profile-hub/private-images/${collectionId}/${profileId}/${imageId}")
        if (imageDir.exists()) {
            isNewFileStructure = true
        }
        isNewFileStructure
    }
//we are supporting 2 alternatives for backwards compatibility
    static String calculatePrefixForFilePath(String collectionId, String profileId, String imageId) {
        String prefix = "file:///data/profile-hub/private-images/${collectionId}/${profileId}/${imageId}"
        if (!isCurrentFileStructure(collectionId, profileId, imageId)) {
            prefix = "file:///data/profile-hub/private-images/${profileId}"
        }
        prefix
    }

    private static boolean isExcluded(String defaultOptionStr, List<Map> imageSettings, String imageId) {
        boolean excluded

        ImageOption defaultOption = ImageOption.byName(defaultOptionStr, ImageOption.INCLUDE)
        if (defaultOption == ImageOption.EXCLUDE) {
            excluded = imageSettings?.find {
                it.imageId == imageId && ImageOption.byName(it?.displayOption?.toString()) == ImageOption.INCLUDE
            } == null
        } else {
            excluded = imageSettings?.find {
                it.imageId == imageId && ImageOption.byName(it?.displayOption?.toString()) == ImageOption.EXCLUDE
            } != null
        }

        excluded
    }

    private static boolean isExcluded(ImageOption defaultOption, String displayOptionStr) {
        return ImageOption.byName(displayOptionStr, defaultOption) == ImageOption.EXCLUDE
    }

    private static boolean isIncluded(ImageOption defaultOption, String displayOptionStr) {
        return ImageOption.byName(displayOptionStr, defaultOption) == ImageOption.INCLUDE
    }

    def updateLocalImageMetadata(String imageId, Map metadata) {
        webService.post("${grailsApplication.config.profile.service.url}/image/${encPath(imageId)}/metadata", metadata, [:], ContentType.APPLICATION_JSON, true, false, profileService.getCustomHeaderWithUserId())
    }

    def publishPrivateImage(String opusId, String profileId, String imageId) {
        def model = profileService.getProfile(opusId, profileId, true)

        if (model.profile.privateImages) {
            def image = model.profile.privateImages.find { it.imageId == imageId }

            publishImages(model.opus, model.profile, [(imageId): image], false)
        }
    }

    def publishStagedImages(String opusId, String profileId) {
        def model = profileService.getProfile(opusId, profileId, true)

        if (model.profile.stagedImages) {
            Map images = model.profile.stagedImages?.collectEntries {
                [(it.imageId): it]
            }

            publishImages(model.opus, model.profile, images, true)
        }
    }

    private def publishImages(Map opus, Map profile, Map images, boolean staged) {
        Map profileUpdates = [:]
        List<File> imageDirectories = []
        List<File> imageFiles = []
        List<File> imagesToPublish = []
        String localDirPath = staged ? grailsApplication.config.image.staging.dir : grailsApplication.config.image.private.dir
        //Check in old file directory structure
        File localDir = new File("${localDirPath}/${profile.uuid}")
        if (localDir.exists()) {
            imageFiles = localDir.listFiles().collect()
        }
        //Now check new directory structure
        File profileDir = new File("${localDirPath}/${opus.uuid}/${profile.uuid}/")
        if (profileDir.exists()) {
            imageDirectories = profileDir.listFiles()

            if (imageDirectories.size() > 0) {
                //when we get to the profile directory it will contain 1 directory for each image, go into
                //these directories and take the image files without going into the subdirectories containing
                //tiled images and thumbnails
                imageDirectories.each { file ->
                    file.traverse(maxDepth: 0) {
                        if (it.file) {
                            imageFiles << it
                        }
                    }
                }
            }
        }

        imageFiles.each {
            String imageId = imageIdFromFile(it)
            def image = images[imageId]
            if (image) {
                imagesToPublish << it
            }
        }


        imagesToPublish.each {
            String imageId = imageIdFromFile(it)
            List<Map> localImage = [images[imageId]]
            List<Map> multimedia = localImage ? [
                    [
                            creator         : localImage.creator ?: "",
                            rights          : localImage.rights ?: "",
                            rightsHolder    : localImage.rightsHolder ?: "",
                            license         : localImage.licence ?: "",
                            title           : localImage.title ?: "",
                            description     : localImage.description ?: "",
                            created         : localImage.created ?: "",
                            originalFilename: localImage.originalFileName,
                            contentType     : localImage.contentType
                    ]
            ] : []
            Map metadata = [multimedia: multimedia, scientificName: profile.scientificName]

            def uploadResponse = biocacheService.uploadImage(opus.uuid, profile.uuid, opus.dataResourceUid, it, metadata, opus.usePrivateRecordData)

            // Success condition is complex as biocache can return 20X code even when it didn't return an image
            if (uploadResponse?.resp?.images[0]
                    && (uploadResponse?.statusCode?.toInteger() >= 200) && (uploadResponse?.statusCode?.toInteger() <= 299)) {

                String newImageId = sanitiseId(uploadResponse?.resp?.images[0])

                // check if the local image was set as the primary, and swap the local id for the new permanent id
                if (profile.primaryImage == imageId) {
                    profileUpdates.primaryImage = newImageId
                }

                // check for any display options that were set for the local image, and swap the local id for the new permanent id
                //that has been assigned by uploadImage call
                Map imageDisplayOption = profile.imageSettings?.find { it.imageId == imageId }
                if (imageDisplayOption) {
                    imageDisplayOption?.imageId = newImageId
                }

                //don't delete the local images if the upload failed
                if (staged) {
                    deleteStagedImage(opus.uuid, profile.uuid, imageId)
                } else {
                    deletePrivateImage(opus.uuid, profile.uuid, imageId)
                }
            }
        }

        if (profileUpdates) {
            profileService.updateProfile(opus.uuid, profile.uuid, profileUpdates, true)
        }
    }

    /**
     *  Replace '.' and '/' with '-'
     * @param input
     * @return
     */
    private static String sanitiseId(String input) {
        // Workaround. Biocache local storage will return file paths instead of uuid which will break
        // profile data model so let's sanitize the ID
        input.replaceAll($/[\./]/$, '-')
    }

    //Changed directory structure, supporting existing files stored in old structure, use updated method - same name
    @Deprecated
    File getTile(String profileId, String imageId, String type, int zoom, int x, int y) {
        String baseDir = type as ImageType == ImageType.PRIVATE ? "${grailsApplication.config.image.private.dir}" : "${grailsApplication.config.image.staging.dir}"
        new File("${baseDir}/${profileId}/${imageId}_tiles/${zoom}/${x}/${y}.png")
    }

    //Changed directory structure, supporting existing files stored in old structure, use updated method - same name
    @Deprecated
    File getLocalImageFile(String directory, String profileId, String imageId, String extension) {
        new File("${directory}/${profileId}/${imageId}${extension}")
    }

    //Changed directory structure, supporting existing files stored in old structure, use updated method - same name
    @Deprecated
    private static void deleteLocalImage(List images, String imageId, String directory) {
        def image = images.find { it.imageId == imageId }
        String extension = getExtension(image.originalFileName)
        File localDir = new File(directory)
        File file = new File(localDir, "${imageId}${extension}")
        deleteFileAndDirIfEmpty(imageId, file, localDir)
    }

    //Changed directory structure, supporting existing files stored in old structure, use deleteDirectoryAndContents()
    @Deprecated
    private static deleteFileAndDirIfEmpty(String imageId, File file, File localDir) {
        Log log = LogFactory.getLog(this)

        if (file.exists()) {
            FileUtils.forceDelete(file)
        } else {
            log.warn "File [${file}] does not exist, nothing to delete"
        }

        File tileDir = new File(localDir, "${imageId}_tiles")
        if (tileDir.exists()) {
            FileUtils.deleteDirectory(tileDir)
        } else {
            log.warn "Directory [${tileDir}] does not exist, nothing to delete"
        }

        // If the below fails it won't be a show stopper for the whole image deletion
        // We will only leave some unused directories behind.
        if (localDir.exists()) {
            if (localDir.listFiles()?.length == 0) {
                localDir.delete()
            }
        }
    }

    private static String imageIdFromFile(File file) {
        file.name.substring(0, file.name.indexOf("."))
    }

    private static String buildFilePath(String parentDir, String collectionId, String profileId, String imageId) {
        parentDir + separator + collectionId + separator + profileId + separator + imageId
    }

    def enc(String value) {
        value ? URLEncoder.encode(value, "UTF-8") : ""
    }

}
