package au.org.ala.profile.hub

class MapService {

    private static final String DEFAULT_POINT_COLOUR = "00ff85"
    private static final String DEFAULT_EXTENTS = "96.173828125,-47.11468820158343,169.826171875,-2.5694811631203973"
    private static final String MAP_SNAPSHOT_IMAGE_NAME = "mapSnapshot"
    private static final String MAP_FILE_TYPE = "jpg"

    def grailsApplication

    ImageService imageService
    ProfileService profileService

    String constructMapImageUrl(String occurrenceQuery, boolean useSandbox = false, String pointColor = DEFAULT_POINT_COLOUR, String extents = DEFAULT_EXTENTS) {
        Map params = [
                extents      : extents ?: DEFAULT_EXTENTS,
                outlineColour: 0x000000,
                dpi          : 300,
                scale        : "off",
                baselayer    : "aus1",
                fileName     : "occurrencemap.jpg",
                format       : MAP_FILE_TYPE,
                outline      : true,
                popacity     : 1,
                pradiuspx    : 5,
                pcolour      : pointColor ?: DEFAULT_POINT_COLOUR
        ]

        String url
        if (useSandbox) {
            url = "${grailsApplication.config.sandbox.biocache.service.url}/mapping/wms/image?${occurrenceQuery}&"
        } else {
            url = "${grailsApplication.config.getProperty('biocache.ws.url')}/ws/mapping/wms/image?${occurrenceQuery}&"
        }

        params.each { k, v -> url += "${k}=${v}&" }

        url = url.trim()

        if (url.endsWith("&")) {
            url = url.substring(0, url.length() - 1)
        }

        url
    }

    void createMapSnapshot(opus, profile, String occurrenceQuery, String extents = DEFAULT_EXTENTS) {
//        Map profileAndOpus = profileService.getProfile(opusId, profileId, true)

        String url = constructMapImageUrl(occurrenceQuery, opus.usePrivateRecordData, opus.mapConfig.mapPointColour, extents)

        deleteMapSnapshot(opus.uuid, profile.uuid)

        UrlTransferrableAdapter transfer = new UrlTransferrableAdapter(url: url.toURL())
        transfer.withCloseable {
            Map metadata = [imageId: MAP_SNAPSHOT_IMAGE_NAME, extension: ".${MAP_FILE_TYPE}"]
            imageService.storeLocalImage(opus, profile, metadata, transfer, grailsApplication.config.image.private.dir)
        }
    }

    void deleteMapSnapshot(String opusUuid, String profileUuid) {
        if (snapshotImageExists(opusUuid, profileUuid)) {
            imageService.deleteSnapshotImage(grailsApplication.config.image.private.dir,
                    opusUuid, profileUuid, MAP_SNAPSHOT_IMAGE_NAME)
        }
    }

    /**
     * Enables skipping the round trip to the profile service to load the profile and opus if you already are
     * sure of the UUIDs
     * @param contextPath
     * @param opusUUID
     * @param profileUUID
     * @return
     */
    String getSnapshotImageUrlWithUUIDs(String contextPath, String opusUUID, String profileUUID) {
        String url = null

        if (snapshotImageExists(opusUUID, profileUUID)) {
            url = imageService.constructImageUrl(contextPath,
                    opusUUID,
                    profileUUID,
                    MAP_SNAPSHOT_IMAGE_NAME,
                    ".${MAP_FILE_TYPE}",
                    ImageType.PRIVATE.toString(),
                    ImageUrlType.THUMBNAIL)
        }

        url
    }

    String getSnapshotImageUrl(String contextPath, String opusId, String profileId) {
        Map profileAndOpus = profileService.getProfile(opusId, profileId, true)
        getSnapshotImageUrlWithUUIDs(contextPath, profileAndOpus.opus.uuid, profileAndOpus.profile.uuid)
    }

    boolean snapshotImageExists(String opusId, String profileId) {
        File mapFile = imageService.getLocalImageFile(grailsApplication.config.image.private.dir, opusId, profileId, MAP_SNAPSHOT_IMAGE_NAME, ".${MAP_FILE_TYPE}")

        mapFile?.exists()
    }
}
