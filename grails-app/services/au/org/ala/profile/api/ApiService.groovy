package au.org.ala.profile.api

import au.org.ala.profile.hub.ImageService
import au.org.ala.profile.hub.NslService
import au.org.ala.profile.hub.ProfileService
import au.org.ala.profile.hub.Utils
import grails.web.mapping.LinkGenerator

import static au.org.ala.profile.hub.Utils.encPath
import static org.apache.http.HttpStatus.SC_OK

class ApiService {
    def grailsApplication
    LinkGenerator grailsLinkGenerator
    ImageService imageService
    ProfileService profileService
    NslService nslService

    def getProfiles(String opusId, String startIndex = "", String pageSize = "", String sort = "", String order = "", String taxonName = "", String taxonRank = "", String rankFilter = "") {
        if (taxonName && taxonRank) {
            def profiles = profileService.findByNameAndTaxonLevelAndGetTotalProfilesCount(opusId, taxonRank, taxonName, pageSize, startIndex, sort, false, true, rankFilter)?.resp
            [
                    resp      : profiles,
                    statusCode: 200
            ]
        } else {
            profileService.getProfiles(opusId, startIndex, pageSize, sort, order, rankFilter)
        }
    }

    def supplementProfileData(Map resp, int pageSize = 20, boolean includeImages = false) {
        Map profile = resp.profile
        Map opus = resp.opus

        // add images
        if (includeImages) {
            boolean latest = false
            boolean readonlyView = true
            int startIndex = 0
            String searchIdentifier = profile.guid ? "lsid:${profile.guid}" : ""

            Map images = imageService.retrieveImagesPaged(opus.uuid, profile.uuid, latest, searchIdentifier, false, readonlyView, pageSize, startIndex)
            if (isSuccessful(images.statusCode)) {
                profile.linkedImages = images.resp
            } else {
                profile.linkedImages = [count: 0, images: []]
            }
        }

        if (opus.citationProfile) {
            profile.citationText = profileService.getCitation(opus, profile)
        }

        if (profile.nslNameIdentifier) {
            Map nslOutput = nslService.getNameDetails(profile.nslNameIdentifier)?.resp
            if (nslOutput?.primaryInstance?.size()) {
                profile.nsl = [
                        citationHtml: nslOutput.primaryInstance[0].citationHtml,
                        page        : nslOutput.primaryInstance[0].page
                ]
            }

            profile.nslUrl = "${grailsApplication.config.nsl.base.url}services/apni-format/display/${profile.nslNameIdentifier}"
        }

        if (profile.occurrenceQuery) {
            profile.map = [
                    wmsUrl: "${grailsApplication.config.biocache.ws.url}${grailsApplication.config.biocache.wms.path}${profile.occurrenceQuery}",
                    layers: grailsApplication.config.biocache.wms.layer,
                    color : opus.mapConfig.mapPointColour,
                    env   : "color:${opus.mapConfig.mapPointColour};name:circle;size:4;opacity:1"
            ]
        }

        profile.profileURL = getProfileURL(profile)
        profile.bieURL = getBIEURL(profile)
        addPublicationURL(profile)

        resp
    }

    def retrieveImagesPaged(String opusId, String profileId, int pageSize, int startIndex) {
        Map result
        Map profileAndOpus = profileService.getProfile(opusId, profileId, false, false)
        if (profileAndOpus) {
            String searchIdentifier = profileAndOpus.profile.guid ? "lsid:${profileAndOpus.profile.guid}" : ""
            result = imageService.retrieveImagesPaged(opusId, profileId, false, searchIdentifier, false, true, pageSize, startIndex)
        } else {
            result = [
                    statusCode: 404,
                    resp      : [:]
            ]
        }

        result
    }

    String addPublicationURL(Map profile) {
        profile.publications?.each {
            it.publicationURL = getPublicationURL(it)
            it.publicationFileURL = getPublicationFileURL(it, profile)
        }
    }

    String getPublicationURL(Map publication) {
        if (publication.uuid) {
            return "${grailsApplication.config.grails.serverURL}${getContext()}/publication/${publication.uuid}"
        }
    }

    String getPublicationFileURL(Map publication, Map profile) {
        if (publication.uuid) {
            return "${grailsApplication.config.grails.serverURL}${getContext()}/opus/${profile.opusId}/profile/${profile.uuid}/publication/${publication.uuid}/file"
        }
    }

    String getContext() {
        grailsLinkGenerator.contextPath ? "/${grailsLinkGenerator.contextPath}" : ""
    }

    String getBIEURL(Map profile) {
        if (profile.guid) {
            return "${grailsApplication.config.bie.base.url}/species/${profile.guid}"
        }
    }

    String getProfileURL(Map profile) {
        String opusName = profile.opusShortName ?: profile.opusId
        String profileName = profile.scientificName ?: profile.uuid
        "${grailsApplication.config.grails.serverURL}${getContext()}/opus/${opusName}/profile/${encPath(profileName)}"
    }

    List getAttributes (Map profile, List attributes = []) {
        attributes = attributes*.toLowerCase()
        profile?.attributes?.findAll { attributes?.contains(it.uuid) || attributes?.contains(it.title?.toLowerCase()) }
    }

    /** Returns true for HTTP status codes from 200 to 299 */
    protected isSuccessful(int statusCode) {
        return statusCode >= SC_OK && statusCode <= 299
    }
}
