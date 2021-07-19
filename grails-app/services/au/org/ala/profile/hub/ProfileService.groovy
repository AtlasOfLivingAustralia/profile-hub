package au.org.ala.profile.hub

import au.org.ala.profile.hub.util.ReportType
import au.org.ala.web.AuthService
import au.org.ala.ws.service.WebService
import org.apache.commons.lang.BooleanUtils
import org.apache.http.entity.ContentType
import org.springframework.web.multipart.support.AbstractMultipartHttpServletRequest

import javax.servlet.http.HttpServletResponse
import java.text.SimpleDateFormat

import static au.org.ala.profile.hub.Utils.*
import static au.org.ala.profile.hub.util.HubConstants.*

class ProfileService {

    def grailsApplication
    BieService bieService
    WebService webService
    WebServiceWrapperService webServiceWrapperService
    AuthService authService
    UtilService utilService

    def getOpus(String opusId = "") {
        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}")?.resp
    }

    def updateOpus(String opusId, Map json) {
        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}", json)
    }

    def updateSupportingCollections(String opusId, Map json) {
        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/supportingCollections/update", json)
    }

    def respondToSupportingCollectionRequest(String opusId, String requestingOpusId, String action) {
        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/supportingCollections/respond/${requestingOpusId}/${action}", [:])
    }

    def updateOpusUsers(String opusId, Map json) {
        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/updateUsers", json)
    }

    def getUserDetails(String opusId) {
        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/user/details?opusId=${enc(opusId)}")?.resp
    }

    def createOpus(json) {
        webService.put("${grailsApplication.config.profile.service.url}/opus/", json)
    }

    def deleteOpus(String opusId) {
        log.debug("Deleting opus ${opusId}")
        webService.delete("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}")
    }

    def getOpusAboutContent(String opusId) {
        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/about")
    }

    def generateAccessTokenForOpus(String opusId) {
        webService.put("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/access/token", [:])
    }

    def revokeAccessTokenForOpus(String opusId) {
        webService.delete("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/access/token")
    }

    def updateOpusAboutContent(String opusId, String aboutHtml, String citationHtml) {
        webService.put("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/about", [opusId: opusId, aboutHtml: aboutHtml, citationHtml: citationHtml])
    }

    def getVocab(String opusId, String vocabId = "") {
        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/vocab/${encPath(vocabId)}")
    }

    def updateOpusAdditionalStatuses(String opusId, additionalStatuses) {
        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/additionalStatuses", [addtionalStatuses: additionalStatuses])
    }

    def updateOpusMasterList(String opusId, masterListUid) {
        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/masterList", masterListUid)
    }

    def syncOpusMasterList(String opusId, boolean regen) {
        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/masterList/sync?regenerateStubs=${regen}", [:])
    }

    def isMasterListSyncing(String opusId) {
        webService.get("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/masterList/isSyncing")
    }


    def createProfile(String opusId, json) {
        webService.put("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/", json)
    }

    def duplicateProfile(String opusId, String profileId, Map json) {
        webService.put("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${profileId}/duplicate", json)
    }

    def updateProfile(String opusId, String profileId, json, boolean latest = false) {
        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}?latest=${latest}", json)
    }

    def toggleDraftMode(String opusId, String profileId, boolean publish = false) {
        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/toggleDraftMode?publish=${publish}", null)
    }

    def discardDraftChanges(String opusId, String profileId) {
        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/discardDraftChanges", null)
    }

    def getListMetadata(String drid) {
        webService.get("${grailsApplication.config.lists.base.url}/ws/speciesList/${drid}")?.resp
    }

    def getListItems(String drid) {
        webService.get("${grailsApplication.config.lists.base.url}/ws/speciesListItems/${drid}?includeKVP=true")?.resp
    }

    def getPublications(String pubId) {
        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/publication/${encPath(pubId)}")?.resp
    }

    def getProfile(String opusId, String profileId, boolean latest = false, Boolean fullClassification = false) {
        log.debug("Loading profile " + profileId)

        Map result

        try {
            String encodedProfileId = encPath(profileId)
            def profile = webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encodedProfileId}?latest=${latest}&fullClassification=${fullClassification}")?.resp

            if (!profile) {
                return null
            }

            injectThumbnailUrls(profile)

            def opus = getOpus(opusId)

            result = [
                    opus         : opus,
                    profile      : profile,
                    logos      : opus.brandingConfig?.logos ?: DEFAULT_OPUS_LOGOS,
                    bannerUrl    : opus.brandingConfig?.profileBannerUrl ?: DEFAULT_OPUS_BANNER_URL,
                    pageTitle    : opus.title ?: DEFAULT_OPUS_TITLE
            ]

        } catch (FileNotFoundException e) {
            log.error("Profile ${profileId} not found")
            result = null
        } catch (Exception e) {
            log.error("Failed to retrieve profile ${profileId}", e)
            result = [error: "Failed to retrieve profile ${profileId} due to ${e.getMessage()}"]
        }

        result
    }

    def renameProfile(String opusId, String profileId, Map json) {
        log.debug("Renaming profile ${profileId}")

        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/rename", json)
    }

    def deleteProfile(String opusId, String profileId) {
        log.debug("Deleting profile ${profileId}")
        webService.delete("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}")
    }

    def archiveProfile(String opusId, String profileId, String archiveComment) {
        log.debug("Archiving profile ${profileId}")

        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/archive/${encPath(profileId)}", [archiveComment: archiveComment])
    }

    def restoreArchivedProfile(String opusId, String profileId, String newName = null) {
        log.debug("Restoring archived profile ${profileId}")

        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/restore/${encPath(profileId)}", [newName: newName])
    }

    def saveAttachment(String opusId, String profileId, Map metadata, AbstractMultipartHttpServletRequest request) {
        List files = request.getFileNames().collect { request.getFile(it) }

        if (profileId) {
            webService.postMultipart("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/attachment?latest=true", [data: metadata], null, files)
        } else {
            webService.postMultipart("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/attachment", [data: metadata], null, files)
        }
    }

    def getAttachmentMetadata(String opusId, String profileId = null, String attachmentId = null, boolean latest = false) {
        if (profileId) {
            webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/attachment/${encPath(attachmentId)}?latest=${latest}")
        } else {
            webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/attachment/${encPath(attachmentId)}")
        }
    }

    def deleteAttachment(String opusId, String profileId, String attachmentId) {
        if (profileId) {
            webService.delete("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/attachment/${encPath(attachmentId)}?latest=true")
        } else {
            webService.delete("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/attachment/${encPath(attachmentId)}")
        }
    }

    def proxyAttachmentDownload(HttpServletResponse response, String opusId, String profileId, String attachmentId) {
        log.debug("Proxying attachment download $attachmentId")

        if (profileId) {
            webService.proxyGetRequest(response, "${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/attachment/${encPath(attachmentId)}/download?latest=true")
        } else {
            webService.proxyGetRequest(response, "${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/attachment/${encPath(attachmentId)}/download")
        }
    }

    def getImageMetadata(String imageId) {
        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/image/${imageId}")
    }

    void injectThumbnailUrls(profile) {
        profile.bhl.each {
            if (it) {
                String pageId = it.url.split("/").last()
                if (pageId =~ /\?#/) {
                    pageId = pageId.split(/\?#/).first()
                }
                it.thumbnailUrl = "${grailsApplication.config.biodiv.library.thumb.url}${pageId}"
            }
        }

        profile
    }

    def recordStagedImage(String opusId, String profileId, Map metadata) {
        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/recordStagedImage", metadata)
    }

    def recordPrivateImage(String opusId, String profileId, Map metadata) {
        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/recordPrivateImage", metadata)
    }

    def getPublications(String opusId, String profileId) {
        log.debug("Retrieving publications for ${profileId}")

        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/publication")
    }

    def savePublication(String opusId, String profileId, file) {
        log.debug("Saving publication for profile ${profileId}")

        webService.postMultipart("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/publication", [:], null, [file])
    }

    def proxyGetPublicationFile(HttpServletResponse response, String opusId, String profileId, String publicationId) {
        log.debug("Proxying publication $publicationId")

        webService.proxyGetRequest(response, "${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/publication/${encPath(publicationId)}/file")
    }

    def deletePublication(String opusId, String profileId, String publicationId) {
        log.debug("Deleting publication ${publicationId}")

        webService.delete("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/publication/${encPath(publicationId)}/delete")
    }

    def getClassification(String opusId, String profileId, String guid) {
        log.debug("Retrieving classification for ${guid} in opus ${opusId}")

        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/classification?guid=${enc(guid)}&opusId=${enc(opusId)}")
    }

    def getSpeciesProfile(String guid) {
        log.debug("Retrieving species profile for ${guid}")

        bieService.getSpeciesProfile(guid)
    }

    def search(String opusId, String term, List params) {
        log.debug("Searching for '${term}' in opus ${opusId}")

        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/profile/search?opusId=${enc(opusId)}&term=${enc(term)}${params.join("")}")
    }

    def findByScientificName(String opusId, String scientificName, String max, String sortBy, boolean useWildcard, boolean autoCompleteScientificName) {
        log.debug("Searching for '${scientificName}' in opus ${opusId}")

        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/profile/search/scientificName?opusId=${enc(opusId)}&scientificName=${enc(scientificName)}&max=${max ?: ""}&sortBy=${sortBy}&useWildcard=${useWildcard}&autoCompleteScientificName=${autoCompleteScientificName}")
    }

    def findByNameAndTaxonLevel(String opusId, String taxon, String scientificName, String max, String offset, String sortBy, boolean countChildren = false, boolean immediateChildrenOnly = false) {
        log.debug("Searching for '${scientificName}' in taxon ${taxon}")

        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/profile/search/taxon/name?opusId=${enc(opusId)}&scientificName=${enc(scientificName)}&taxon=${enc(taxon)}&max=${max}&offset=${offset}&sortBy=${sortBy}&countChildren=${countChildren}&immediateChildrenOnly=${immediateChildrenOnly}")
    }

    def countByNameAndTaxonLevel(String opusId, String taxon, String scientificName, boolean immediateChildrenOnly = false) {
        log.debug("Counting for '${scientificName}' in taxon ${taxon}")

        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/profile/search/taxon/name/total?opusId=${enc(opusId)}&scientificName=${enc(scientificName)}&taxon=${enc(taxon)}&immediateChildrenOnly=${immediateChildrenOnly}")
    }

    def groupByTaxonLevel(String opusId, String taxon, String max, String offset, String filter = null) {
        log.debug("Searching for '${taxon}' level")

        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/profile/search/taxon/level?opusId=${enc(opusId)}&taxon=${enc(taxon)}&max=${max}&offset=${offset}${filter ? "&filter=${enc(filter)}" : ""}")
    }

    def getTaxonLevels(String opusId) {
        log.debug("Getting taxon levels for opus ${opusId}")

        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/profile/search/taxon/levels?opusId=${enc(opusId)}")
    }

    def getImmediateChildren(String opusId, String rank, String name, String max, String offset, String filter) {
        log.debug("Searching for children of '${rank} ${name}'")

        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/profile/search/children?opusId=${enc(opusId)}&rank=${enc(rank)}&name=${enc(name)}&max=${max}&offset=${offset}&filter=${enc(filter) ?: ""}")
    }

    def updateBHLLinks(String opusId, String profileId, def links) {
        log.debug("Updating BHL links ${links} for profile ${profileId}")

        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/bhl", [
                profileId      : profileId,
                links          : links,
                userId         : authService.getUserId(),
                userDisplayName: authService.userDetails().displayName
        ])
    }

    def updateLinks(String opusId, String profileId, def links) {
        log.debug("Updating links ${links} for profile ${profileId}")

        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/links", [
                profileId      : profileId,
                links          : links,
                userId         : authService.getUserId(),
                userDisplayName: authService.userDetails().displayName
        ])
    }

    def updateAttribute(String opusId, String profileId, Map attribute) {
        log.debug("Updating attribute ${attribute.uuid} with title ${attribute.title} for profile ${profileId}")

        attribute.profileId = profileId
        attribute.userId = authService.getUserId()
        attribute.userDisplayName = authService.userDetails().displayName

        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/attribute/${encPath(attribute.uuid ?: '')}", attribute)
    }

    def deleteAttribute(String opusId, String attributeId, String profileId) {
        log.debug("Deleting attribute ${attributeId} of profile ${profileId}")

        webService.delete("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/attribute/${encPath(attributeId)}?profileId=${enc(profileId)}")
    }

    def getAuditHistory(String objectId, String userId, Integer offset = 0, Integer max = 100) {
        log.debug("Retrieving audit history for ${objectId ?: userId}")

        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/audit/${objectId ? 'object' : 'user'}/${encPath(objectId ?: userId)}?offset=${offset}&max=${max}")
    }

    def updateVocabulary(String opusId, String vocabId, vocab) {
        log.debug("Updating vocabulary ${vocabId} with data ${vocab}")

        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/vocab/${encPath(vocabId)}", vocab)
    }

    def findUsagesOfVocabTerm(String opusId, String vocabId, String termName) {
        log.debug("Finding usages of term ${termName} from vocab ${vocabId}")

        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/vocab/usages/find?vocabId=${enc(vocabId)}&term=${URLEncoder.encode(termName, "UTF-8")}")
    }

    def replaceUsagesOfVocabTerm(String opusId, json) {
        log.debug("Replacing usages of vocab term(s): ${json}")

        Map replacementList = [list: json]

        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/vocab/usages/replace", replacementList)
    }

    def getGlossary(String opusId) {
        log.debug("Fetching glossary for opus ${opusId}")

        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/glossary/${encPath(opusId)}")
    }

    def getGlossary(String opusId, String prefix) {
        log.debug("Fetching glossary items in ${prefix} for opus ${opusId}")

        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/glossary/${encPath(prefix)}")
    }

    def uploadGlossary(String opusId, String glossaryId, List items) {
        log.debug("Uploading glossary items for opus ${opusId}")

        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/glossary", [opusId: opusId, glossaryId: glossaryId, items: items])
    }

    def updateGlossaryItem(String opusId, String glossaryItemId, Map data) {
        log.debug("Updating glossary item ${glossaryItemId}")

        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/glossary/item/${encPath(glossaryItemId)}", data)
    }

    def createGlossaryItem(String opusId, Map data) {
        log.debug("Creating glossary item for opus ${opusId}")

        webService.put("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/glossary/item", data)
    }

    def deleteGlossaryItem(String opusId, String glossaryItemId) {
        log.debug("Deleting glossary item ${glossaryItemId}")

        webService.delete("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/glossary/item/${encPath(glossaryItemId)}")
    }

    def getComments(String opusId, String profileId) {
        log.debug("Fetching comments for profile ${profileId}")

        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/comment/")
    }

    def getComment(String opusId, String profileId, String commentId) {
        log.debug("Fetching comment ${commentId} for profile ${profileId}")

        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/comment/${encPath(commentId)}")
    }

    def addComment(String opusId, String profileId, Map json) {
        log.debug("Adding comment to profile ${profileId}")

        webService.put("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/comment/", json)
    }

    def updateComment(String opusId, String profileId, String commentId, Map json) {
        log.debug("Updating comment ${commentId} for profile ${profileId}")

        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/comment/${encPath(commentId)}", json)
    }

    def deleteComment(String opusId, String profileId, String commentId) {
        log.debug("Deleting comment ${commentId}")

        webService.delete("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/comment/${encPath(commentId)}")
    }

    def updateAuthorship(String opusId, String profileId, Map json) {
        log.debug("Updating authorship for profile ${profileId}")

        webService.post("${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/authorship", json)
    }

    def checkName(String opusId, String scientificName) {
        log.debug("Checking name ${scientificName}")

        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/checkName?opusId=${enc(opusId)}&scientificName=${enc(scientificName)}")
    }

    def loadReport(String opusId, String reportId, String pageSize, String offset,
                   Map dates, boolean countOnly) {
        ReportType report = ReportType.byId(reportId)
        String urlPrefix = "${grailsApplication.config.profile.service.url}/report/${report.id}"
        Map range
        def resp
        switch (report) {
            case ReportType.MISMATCHED_NAME:
                resp = webServiceWrapperService.get("${urlPrefix}?opusId=${enc(opusId)}&offset=${offset}&max=${pageSize}")
                break;
            case ReportType.DRAFT_PROFILE:
                resp = webServiceWrapperService.get("${urlPrefix}?opusId=${enc(opusId)}")
                break;
            case ReportType.ARCHIVED_PROFILE:
                resp = webServiceWrapperService.get("${urlPrefix}?opusId=${enc(opusId)}")
                break;
            case ReportType.RECENT_CHANGE:
                range = utilService.getDateRange(dates.period, dates.from, dates.to);
                String url = "${urlPrefix}?opusId=${enc(opusId)}&to=${enc(range['to'])}&from=${enc(range['from'])}&offset=${offset}&max=${pageSize}"

                url += "&countOnly=" + BooleanUtils.toString(countOnly, "true", "false");

                resp = webServiceWrapperService.get(url)
                break;
            case ReportType.RECENT_COMMENTS:
                range = utilService.getDateRange(dates.period, dates.from, dates.to)
                String url = "${urlPrefix}?opusId=${enc(opusId)}&to=${enc(range['to'])}&from=${enc(range['from'])}&offset=${offset}&max=${pageSize}"
                url += "&countOnly=" + BooleanUtils.toString(countOnly, "true", "false")
                resp = webServiceWrapperService.get(url)
                break
        }

        resp
    }

    def getStatistics(String opusId) {
        def urlPrefix = "${grailsApplication.config.profile.service.url}/statistics"

        webServiceWrapperService.get("${urlPrefix}?opusId=${enc(opusId)}")
    }

    def getFeatureLists(String opusId, String profileId) {
        Map model = getProfile(opusId, profileId);
        Map opus = model.opus;
        Map profile = model.profile;

        List result = []
        opus.featureLists?.each { listId ->
            Map list = [:]
            list.metadata = getListMetadata(listId)
            list.items = getProfileKVP(profile.scientificName, listId)
            result << list
        }

        result
    }

    Map getNextPendingPDFJob() {
        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/job/pdf/next", [:], ContentType.APPLICATION_JSON, true, false)
    }

    void createPDFJob(Map params, boolean latest) {
        params.latest = latest;
        webService.put("${grailsApplication.config.profile.service.url}/job/pdf/", [params: params])
    }

    void updatePDFJob(String jobId, Map params) {
        webService.post("${grailsApplication.config.profile.service.url}/job/pdf/${jobId}", params)
    }

    Map getTags() {
        webServiceWrapperService.get("${grailsApplication.config.profile.service.url}/tags/")
    }

    private def getProfileKVP(String profileId, String drid) {
        List result = []
        def list = getListItems(drid);
        if (list) {
            list.each {
                if (it.name.toLowerCase() == profileId.toLowerCase()) {
                    result.addAll(it.kvpValues)
                }
            }
        }
        result
    }

    boolean hasMatchedName(Map profile) {
        profile.guid as Boolean
    }

    def deleteDocument(String opusId, String profileId, String documentId) {
        def url = "${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/document/${documentId}"
        webService.delete(url, [:], ContentType.TEXT_PLAIN)
    }

    def updateDocument(String opusId, String profileId, doc) {
        def url ="${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/document/${doc.documentId ?:''}"
        webService.post(url, doc)
    }

    def Map listDocuments(String opusId, String profileId, boolean edit) {
        def url ="${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/document/list?editMode=${edit}"
        def resp = webServiceWrapperService.get(url)
        if (resp && !resp.error) {
            return resp.resp
        }
        resp
    }

    def setPrimaryMultimedia(String opusId, String profileId, json) {
        // mmm boilerplate.
        def url = "${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/primaryMultimedia"
        return webService.post(url, json)
    }

    def setStatus(String opusId, String profileId, json) {
        def url = "${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/${encPath(profileId)}/status"
        return webService.post(url, json)
    }

    String getCitation(Map opus, Map profile, String profileUrl = ''){
        if(opus.citationProfile){
            String year = ""
            try {
                SimpleDateFormat yearFormat = new SimpleDateFormat("yyyy");
                yearFormat.setTimeZone(TimeZone.getTimeZone("UTC"))
                year = yearFormat.format(parseISODateToObject(profile.lastPublished))
            } catch (Exception e){
                log.error("Could not convert date - ${profile.lastPublished}")
            }

            Map substitutions = [
                    '\\$Today'   : new SimpleDateFormat("dd MMMMM yyyy").format(new Date()),
                    '\\$Url'     : profileUrl,
                    '\\$Profile' : profile.scientificName,
                    '\\$Year'    : year
            ]

            Map authorship = getCombinedAuthorship(profile.authorship, true)
            authorship.each{ key, value ->
                substitutions[key] = value.join(', ')
            }

            // add special substitutions
            if(substitutions['\\$Editor']){
                substitutions['\\$EditorEd'] = substitutions['\\$Editor'] + " (ed.)"
            }

            String result = opus.citationProfile;
            substitutions.each { key, value ->
                result = result.replaceAll(key + "\\b", value);
            }

            result = result.replaceAll('\\$[^\\s]*', "")

            result
        }
    }

    Map getCombinedAuthorship(List authorship, Boolean addSpecialCharacter = false){
        if(authorship){
            Map result = [:]
            String specialCharacter = addSpecialCharacter?'\\$':''
            authorship.each{ item ->
                String key = specialCharacter + item.category
                if(!result[key]){
                    result[key] = []
                }

                result[key] << item.text
            }

            result
        }
    }

    def getMasterListKeybaseItems(String opusId) {
        def url = "${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/masterList/keybaseItems"
        return webServiceWrapperService.get(url)
    }

    def updateFlorulaList(String opusId, String florulaListId) {
        def url = "${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/florulaList"
        return webService.post(url, [florulaListId: florulaListId])
    }

    def getProfiles(String opusId, String startIndex = "", String pageSize = "", String sort = "", String order = "", String includeArchived = 'false') {
        def url = "${grailsApplication.config.profile.service.url}/opus/${encPath(opusId)}/profile/?startIndex=${startIndex}&pageSize=${pageSize}&sort=${sort}&order=${order}&includeArchived=${includeArchived}"
        return webService.get(url)
    }
}
