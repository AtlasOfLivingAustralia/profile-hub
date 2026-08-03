package au.org.ala.profile.hub

import au.org.ala.profile.security.Role
import au.org.ala.profile.security.Secured
import au.org.ala.web.AuthService
import grails.converters.JSON

import jakarta.validation.constraints.NotNull

import static au.org.ala.profile.hub.util.HubConstants.DEFAULT_OPUS_BANNER_URL
import static au.org.ala.profile.hub.util.HubConstants.DEFAULT_OPUS_LOGOS
import static au.org.ala.profile.hub.util.HubConstants.DEFAULT_OPUS_TITLE

@Secured(role = Role.ROLE_PROFILE_AUTHOR)
class DataController extends BaseController {

    AuthService authService
    ProfileService profileService
    SandboxService sandboxService

    def beforeInterceptor = {
        boolean canContinue = true

        Map opus = profileService.getOpus(params.opusId as String)

        if (!opus) {
            notFound "No opus found for id ${params.opusId}"

            canContinue = false
        } else if (!opus.usePrivateRecordData) {
            notAuthorised "Only collections using private occurrence data can access this resource"

            canContinue = false
        }

        canContinue
    }

    def upload() {
        Map opus = profileService.getOpus(params.opusId as String)

        render view: 'uploadData', model: [
                opusId      : opus.uuid,
                logos     : opus.brandingConfig?.logos ?: DEFAULT_OPUS_LOGOS,
                bannerUrl   : opus.brandingConfig?.opusBannerUrl ?: opus.brandingConfig?.profileBannerUrl ?: DEFAULT_OPUS_BANNER_URL,
                pageTitle   : opus.title ?: DEFAULT_OPUS_TITLE,
                footerText  : opus.footerText,
                contact     : opus.contact
        ]
    }

    def getDataSets(@NotNull String opusId) {
        Map opus = profileService.getOpus(opusId)

        List resources = sandboxService.getDataSets(opus.dataResourceConfig.privateRecordSources)

        render resources as JSON
    }

    def deleteDataSet(@NotNull String opusId, @NotNull String dataResourceId) {
        List resource = sandboxService.getDataSets([dataResourceId])
        if (resource && resource[0]) {
            if (resource[0].alaId == authService.getUserId() || params.isOpusAdmin || params.isAlaAdmin) {
                Map response = sandboxService.deleteDataSet(opusId, dataResourceId)

                handle response
            } else {
                notAuthorised
            }
        } else {
            notFound "No matching data resource was found for uid ${dataResourceId}"
        }
    }
}
