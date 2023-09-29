package au.org.ala.profile.hub

import au.org.ala.profile.security.Role
import au.org.ala.profile.security.Secured
import au.org.ala.ws.service.WebService
import grails.converters.JSON
import grails.util.Environment
import org.apache.http.entity.ContentType
import org.springframework.core.io.support.PathMatchingResourcePatternResolver

import javax.validation.constraints.NotNull
import static groovy.io.FileType.DIRECTORIES
import org.grails.plugin.cache.GrailsCacheManager
class AdminController extends BaseController {

    WebService webService
    ProfileService profileService
    GrailsCacheManager grailsCacheManager

    @Secured(role = Role.ROLE_ADMIN, opusSpecific = false)
    def index() {
        render view: "admin.gsp"
    }

    @Secured(role = Role.ROLE_ADMIN, opusSpecific = false)
    def alaIndex() {
        render view: "alaAdmin.gsp"
    }

    @Secured(role = Role.ROLE_ADMIN, opusSpecific = false)
    def reindex() {
        def response = webService.post("${grailsApplication.config.profile.service.url}/admin/search/reindex", [:], [:], ContentType.APPLICATION_JSON, true, false, profileService.getCustomHeaderWithUserId())

        handle response
    }

    @Secured(role = Role.ROLE_ADMIN, opusSpecific = false)
    def rematchNames() {
        def response = webService.post("${grailsApplication.config.profile.service.url}/admin/rematchNames", [opusIds: request.getJSON()?.opusIds?.split(",")], [:], ContentType.APPLICATION_JSON, true, false, profileService.getCustomHeaderWithUserId())

        handle response
    }

    @Secured(role = Role.ROLE_ADMIN, opusSpecific = false)
    def listBackupFiles() {
        def dir = new File(getBackupRestoreDir());
        def files = [];
        if (dir.exists()) {
            dir.traverse(type: DIRECTORIES, maxDepth: 0) {
                files.add(it.name)
            }
        }
        success files
    }

    @Secured(role = Role.ROLE_ADMIN, opusSpecific = false)
    def backupCollections() {
        def response = webService.post("${grailsApplication.config.profile.service.url}/admin/backupCollections", [opusUuids: request.getJSON()?.opusUuids?.split(","), backupFolder: getBackupRestoreDir(), backupName: request.getJSON()?.backupName],[:], ContentType.APPLICATION_JSON, true, false, profileService.getCustomHeaderWithUserId())

        handle response
    }

    @Secured(role = Role.ROLE_ADMIN, opusSpecific = false)
    def restoreCollections() {
        def response = webService.post("${grailsApplication.config.profile.service.url}/admin/restoreCollections", [backupFolder: getBackupRestoreDir(), backupNames: request.getJSON()?.backupNames?.split(","), restoreDB: request.getJSON()?.restoreDB],[:], ContentType.APPLICATION_JSON, true, false, profileService.getCustomHeaderWithUserId())

        handle response
    }

    @Secured(role = Role.ROLE_ADMIN, opusSpecific = false)
    def listPendingJobs() {
        def response = webService.get("${grailsApplication.config.profile.service.url}/job", [:], ContentType.APPLICATION_JSON, true, false, profileService.getCustomHeaderWithUserId())

        handle response
    }

    @Secured(role = Role.ROLE_ADMIN, opusSpecific = false)
    def deleteJob(@NotNull String jobType, @NotNull String jobId) {
        def response = webService.delete("${grailsApplication.config.profile.service.url}/job/${jobType}/${jobId}", [:], ContentType.APPLICATION_JSON, true, false, profileService.getCustomHeaderWithUserId())

        handle response
    }

    @Secured(role = Role.ROLE_ADMIN, opusSpecific = false)
    def createTag() {
        def response = webService.put("${grailsApplication.config.profile.service.url}/admin/tag/", request.getJSON(), [:], ContentType.APPLICATION_JSON, true, false)

        handle response
    }

    @Secured(role = Role.ROLE_ADMIN, opusSpecific = false)
    def updateTag(@NotNull String tagId) {
        def response = webService.post("${grailsApplication.config.profile.service.url}/admin/tag/${tagId}", request.getJSON(), [:], ContentType.APPLICATION_JSON, true, false, profileService.getCustomHeaderWithUserId())

        handle response
    }

    @Secured(role = Role.ROLE_ADMIN, opusSpecific = false)
    def deleteTag(@NotNull String tagId) {
        def response = webService.delete("${grailsApplication.config.profile.service.url}/admin/tag/${tagId}", [:], ContentType.APPLICATION_JSON, true, false, profileService.getCustomHeaderWithUserId())

        handle response
    }

    @Secured(role = Role.ROLE_ADMIN, opusSpecific = false)
    def getTag(String tagId) {
        def response = webService.get("${grailsApplication.config.profile.service.url}/admin/tag/${tagId ?: ""}", [:], ContentType.APPLICATION_JSON, true, false, profileService.getCustomHeaderWithUserId())

        handle response
    }

    @Secured(role = Role.ROLE_ADMIN, opusSpecific = false)
    def reloadHelpUrls() {
        // clears the cached value from the servlet context, so the next time a page loads the file we be re-loaded and
        // cached
        servletContext.removeAttribute(HelpTagLib.HELP_URLS)

        success [:]
    }

    private String getBackupRestoreDir() {
        return grailsApplication.config.backupRestoreDir?: '/data/profile-service/backup/db'
    }

    @Secured(role = Role.ROLE_ADMIN, opusSpecific = false)
    def cacheManagement() {
        def cacheNames = grailsCacheManager.getCacheNames()
        success cacheNames
    }

    @Secured(role = Role.ROLE_ADMIN, opusSpecific = false)
    def clearCache() {
        if (params.id) {
            grailsCacheManager.getCache(params.id).clear()
        }
        render view: "admin.gsp"
    }

}
