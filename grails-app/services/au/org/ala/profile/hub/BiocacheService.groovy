package au.org.ala.profile.hub

import au.org.ala.ws.service.WebService
import grails.converters.JSON
import groovyx.net.http.RESTClient
import org.apache.http.HttpStatus
import org.apache.http.entity.ContentType
import org.springframework.web.multipart.MultipartFile

import java.nio.file.Files
import java.nio.file.Path

import static au.org.ala.profile.hub.Utils.encPath
import static java.nio.file.StandardCopyOption.COPY_ATTRIBUTES
import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;


class BiocacheService {

    static final int DEFAULT_BIOCACHE_PAGE_SIZE = 20 // used when NOT paging the images. The biocache default is only 10

    WebService webService
    def grailsApplication

    /**
     * The total number of published images for a profile
     * @param searchIdentifier - the taxon
     * @param imageSources - the drd resources
     * @return Map conforming to ALA response structure containing image count and http status code
     */
    Map imageCount(String searchIdentifier, Map opus, String minusQuery = "") {
        // In the lower (non-production) environments, images should be uploaded to the SANDBOX instance of the biocache
        // that is install with the Profiles application (see the uploadImage method of this class). This means that any
        // image that is uploaded during testing will be handled by the local biocache instance, NOT the production
        // instance.
        // However, you probably still want to retrieve images from the production image service so you have sufficient
        // test data.
        // Therefore, we need to query both the production biocache AND the local sandbox biocache for images. In the
        // production environment, there should never be any sandbox images, but in lower environments there might be.

        String biocacheImageSearchUrl = "${grailsApplication.config.biocache.base.url}/ws/occurrences/search.json"
        String sandboxImageSearchUrl = "${grailsApplication.config.sandbox.biocache.service.url}/occurrences/search.json"

        int biocacheImages = countImages(biocacheImageSearchUrl, searchIdentifier, opus, minusQuery)
        int sandboxImages = grailsApplication.config.sandbox.biocache.service.url ? countImages(sandboxImageSearchUrl, searchIdentifier, opus, minusQuery) : 0

        [statusCode: HttpStatus.SC_OK, resp: [totalRecords: biocacheImages + sandboxImages]]
    }

    private int countImages(String imageSearchUrl, String searchIdentifier, Map opus, String minusQuery = "") {
        String imagesQuery = constructQueryString(searchIdentifier, opus, minusQuery)
        Map result = webService.get("${imageSearchUrl}?q=${imagesQuery}&facets=multimedia&flimit=0&foffset=0&fq=multimedia:Image&pageSize=0")
        int count = result?.resp?.totalRecords ?: 0

        count
    }

    def retrieveImages(String searchIdentifier, Map opus, int pageSize = DEFAULT_BIOCACHE_PAGE_SIZE, int startIndex = 0, relevantFacets = "", minusQuery = "") {
        // In the lower (non-production) environments, images should be uploaded to the SANDBOX instance of the biocache
        // that is install with the Profiles application (see the uploadImage method of this class). This means that any
        // image that is uploaded during testing will be handled by the local biocache instance, NOT the production
        // instance.
        // However, you probably still want to retrieve images from the production image service so you have sufficient
        // test data.
        // Therefore, we need to query both the production biocache AND the local sandbox biocache for images. In the
        // production environment, there should never be any sandbox images, but in lower environments there might be.
        // This makes paging the results more complicated, but ensures the integrity of the production image service data.

        Map result = [:]
        if (searchIdentifier) {
            String imagesQuery = constructQueryString(searchIdentifier, opus, minusQuery)
            log.debug("Fetching images for ${searchIdentifier} using query ${imagesQuery}")

            String biocacheImageSearchUrl = "${grailsApplication.config.biocache.base.url}/ws/occurrences/search.json"
            int totalBiocacheImageCount = countImages(biocacheImageSearchUrl, searchIdentifier, opus)

            if (totalBiocacheImageCount > startIndex - 1) {
//                result = webService.get("${biocacheImageSearchUrl}?fq=multimedia:Image&format=json&sort=images&im=true&pageSize=${pageSize}&startIndex=${startIndex}" + relevantFacets, [q: imagesQuery])
                result = webService.get("${biocacheImageSearchUrl}?q=${imagesQuery}&fq=multimedia:Image&format=json&sort=images&im=true&pageSize=${pageSize}&startIndex=${startIndex}" + relevantFacets)
                int biocacheImageCount = result?.resp?.occurrences?.size() ?: 0
                if (biocacheImageCount < pageSize) {
                    if (grailsApplication.config.sandbox.biocache.service.url) {
                        String sandboxImageSearchUrl = "${grailsApplication.config.sandbox.biocache.service.url}/occurrences/search.json"
                        startIndex = Math.max(0, startIndex - totalBiocacheImageCount)
                        Map sandboxResult = webService.get("${sandboxImageSearchUrl}?q=${imagesQuery}&fq=multimedia:Image&sort=images&format=json&im=true&pageSize=${pageSize - biocacheImageCount}&startIndex=${startIndex}" + relevantFacets)
                        if (sandboxResult?.resp?.occurrences) {
                            if (!result?.resp?.occurrences) {
                                result.resp.occurrences = []
                            }
                            result.resp.occurrences.addAll(sandboxResult.resp.occurrences)
                        }
                    }
                }
            } else {
                String sandboxImageSearchUrl = "${grailsApplication.config.sandbox.biocache.service.url}/occurrences/search.json"
                startIndex = Math.max(0, startIndex - totalBiocacheImageCount)
                result = webService.get("${sandboxImageSearchUrl}?q=${imagesQuery}&fq=multimedia:Image&format=json&sort=images&im=true&pageSize=${pageSize}&startIndex=${startIndex}")
            }
        }

        result
    }

    String constructQueryString(String searchIdentifier, Map opus, String minusQuery= "") {
        String query
        if (opus?.dataResourceConfig?.imageResourceOption) {
            Map config = opus.dataResourceConfig
            switch (config.imageResourceOption as DataResourceOption) {
                case DataResourceOption.ALL:
                    query = "${searchIdentifier}"
                    break
                case DataResourceOption.NONE:
                    query = "${searchIdentifier} AND data_resource_uid:${opus.dataResourceUid}"
                    break
                case DataResourceOption.HUBS:
                    query = "${searchIdentifier} AND (data_resource_uid:${opus.dataResourceUid} OR data_hub_uid:${config.imageSources?.join(" OR data_hub_uid:")})"
                    break
                case DataResourceOption.RESOURCES:
                    query = "${searchIdentifier} AND (data_resource_uid:${opus.dataResourceUid} OR data_resource_uid:${config.imageSources?.join(" OR data_resource_uid:")})"
                    break
                default:
                    throw new IllegalArgumentException("${config.imageResourceOption} is not a recognized DataResourceOption")
            }
        } else if (opus?.dataResourceUid) {
            query = "${searchIdentifier} AND data_resource_uid:${opus.dataResourceUid}"
        } else {
            query = "${searchIdentifier}"
        }

        query = enc(query)

        def mQuery = ""
        if (query && minusQuery) {
            mQuery = enc(" AND ${minusQuery}")
        }

        query = query + mQuery

    }

    String copyFileForUpload(String imageId, def file, File tempDir) {
        String filename = ''
        //Images sent directly to central service on upload
        if (file instanceof Transferrable) {
            filename = "$imageId${file.fileExtension}"
            file.transferTo(new File(tempDir, filename))
        }
        else if (file instanceof MultipartFile) {
            String extension = file.originalFilename.substring(file.originalFilename.lastIndexOf("."))
            filename = "${imageId}${extension}"
            file.transferTo(new File(tempDir, filename))
            //Private and staged images are stored relative to this application, and may be sent to central image service later
        } else if (file instanceof File) {
            filename = file.getName()
            //Make defensive copy in case fails
            File fileCopy = new File(tempDir, filename)
            Path target = fileCopy.toPath()
            Path source = file.toPath()
            Files.copy(source, target, REPLACE_EXISTING, COPY_ATTRIBUTES)
        }
        filename
    }

    /**
     * Upload works by sending metadata to a central image service which then comes back to fetch the image based
     *  on information in this metadata??
     *
     * @param opusId - collection
     * @param profileId - the item within the collection
     * @param dataResourceId
     * @param file - can be a File from disk or a MultipartFile streamed directly
     * @param metadata - information about the image
     * @param useSandbox - is the image associatted to a private collection, if so store in private sandbox
     * @return Map response from the webservice including statusCode and resp
     * @deprecated removed since biocache moved to pipelines
     */
    def uploadImage(String opusId, String profileId, String dataResourceId, file, Map metadata, boolean useSandbox = true) {
        String imageId = UUID.randomUUID()
        File tempDir = new File("${grailsApplication.config.temp.file.location}")
        String filename = copyFileForUpload(imageId, file, tempDir)

        String uploadUrl = useSandbox ? grailsApplication.config.sandbox.image.upload.url : grailsApplication.config.image.upload.url


        metadata.multimedia[0].identifier = "${grailsApplication.config.grails.serverURL}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/file/${encPath(filename)}".toString()


        // make sure the spelling of licenSe is US to match the Darwin Core standard
        if (metadata.multimedia[0].containsKey("licence")) {
            metadata.multimedia[0].license = metadata.licence
            metadata.multimedia[0].remove("licence")
        }

        log.debug("Uploading image ${metadata.multimedia[0].identifier} to ${uploadUrl}${dataResourceId} with metadata ${metadata}")

        // In the lower (non-Production) environments, the image.upload.url config property should be set to the url of
        // the SANDBOX instance of the Biocache that is deployed with the Profiles application. In Production, this
        // property should be set to the production biocache instance.
        // This is to ensure that images uploaded during testing are not pushed into the production image service.
        // This assumes that the sandbox config for the lower environment is not pointing at the production image service
        // either (which it should not be).
        // The collectory config property of both the Profiles application and the sandbox biocache instance should be
        // set to the same value (production is ok since it is read-only).

        String url = "${uploadUrl}${dataResourceId}?apiKey=${grailsApplication.config.image.upload.apiKey}"
        webService.post(url, metadata)
    }

    private static enc(String str) {
        URLEncoder.encode(str, "utf-8")
    }

    def lookupSpecimen(String specimenId) {
        webService.get("${grailsApplication.config.biocache.base.url}/ws/occurrences/${specimenId}")
    }
}
