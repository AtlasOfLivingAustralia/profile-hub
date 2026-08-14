package au.org.ala.profile.hub

import au.org.ala.web.AuthService

import static au.org.ala.profile.hub.Utils.isHttpSuccess
import au.org.ala.ws.service.WebService
import org.apache.http.entity.ContentType

class SandboxService {

    def grailsApplication
    ProfileService profileService
    WebService webService
    AuthService authService

    List getDataSets(List<String> dataResourceUids) {
        List dataResources = []

        dataResourceUids?.each {
            Map result = webService.get("${grailsApplication.config.getProperty('collectory.base.url')}/ws/tempDataResource?uid=${it}")
            if (isHttpSuccess(result.statusCode as int) && result.resp.alaId) {
                result.resp.uploadedBy = authService.getUserForUserId(result.resp.alaId).displayName
                dataResources << result.resp
            }
        }

        dataResources
    }

    Map deleteDataSet(String opusId, String dataResourceUid) {
        webService.delete("${grailsApplication.config.getProperty('sandbox.biocache.service.url')}/upload/${dataResourceUid}", [:], ContentType.APPLICATION_JSON, true, true)

        Map opus = profileService.getOpus(opusId)
        opus.dataResourceConfig.privateRecordSources.remove(dataResourceUid)

        profileService.updateOpus(opusId, opus)
    }
}
