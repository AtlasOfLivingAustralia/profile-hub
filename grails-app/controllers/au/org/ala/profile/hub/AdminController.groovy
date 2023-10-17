package au.org.ala.profile.hub

import au.org.ala.profile.security.Role
import au.org.ala.profile.security.Secured
import au.org.ala.ws.service.WebService
import net.sf.ehcache.Cache
import net.sf.ehcache.CacheManager
import org.apache.http.HttpStatus
import org.apache.http.entity.ContentType

import javax.validation.constraints.NotNull
import static groovy.io.FileType.DIRECTORIES
import org.grails.plugin.cache.GrailsCacheManager
class AdminController extends BaseController {

    WebService webService
    ProfileService profileService
    GrailsCacheManager grailsCacheManager
    static long ONE_DAY_SECONDS = 86400
    static String USER_DETAILS_CACHE = "userDetailsCache"
    static String USER_DETAILS_BY_ID_CACHE = "userDetailsByIdCache"
    static String USER_LIST_CACHE = "userListCache"
    static String VOCAB_LIST_CACHE = "vocabListCache"
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
        def cacheNames
        if (grailsCacheManager == null) {
            cacheNames = getCacheManager().getCacheNames()
        } else {
            cacheNames = grailsCacheManager.getCacheNames()
        }
        success cacheNames
    }

    private static CacheManager getCacheManager() {
        CacheManager manager = CacheManager.create()
        Cache userDetailCache = new Cache(USER_DETAILS_CACHE, 2000, true, false, ONE_DAY_SECONDS, 2)
        if (!manager.ehcaches.get(USER_DETAILS_CACHE)) {
            manager.addCache(userDetailCache)
        }
        Cache userDetailsByIdCache = new Cache(USER_DETAILS_BY_ID_CACHE, 2000, true, false, ONE_DAY_SECONDS, 2)
        if (!manager.getEhcache(USER_DETAILS_BY_ID_CACHE)) {
            manager.addCache(userDetailsByIdCache)
        }
        Cache userListCache = new Cache(USER_LIST_CACHE, 2000, true, false, ONE_DAY_SECONDS, 2)
        if (!manager.getEhcache(USER_LIST_CACHE)) {
            manager.addCache(userListCache)
        }
        Cache vocabListCache = new Cache(VOCAB_LIST_CACHE, 2000, true, false, ONE_DAY_SECONDS, 2)
        if (!manager.getEhcache(VOCAB_LIST_CACHE)) {
            manager.addCache(vocabListCache)
        }
        return manager
    }

    @Secured(role = Role.ROLE_ADMIN, opusSpecific = false)
    def clearCache() {
        Map result = [:]
        if (params.id) {
            if (grailsCacheManager == null) {
                getCacheManager().getCache(params.id).remove(params.id)
            } else {
                grailsCacheManager.getCache(params.id).clear()
            }
            result.resp = "Successfully cleared cache - " + params.id
            result.statusCode = HttpStatus.SC_OK
            success result
        } else {
            var message = "Failed to clear cache the job"
            sendError(HttpStatus.SC_BAD_REQUEST, message ?:"");
        }
    }
}
