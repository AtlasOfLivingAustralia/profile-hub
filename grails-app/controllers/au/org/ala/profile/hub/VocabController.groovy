package au.org.ala.profile.hub

import au.org.ala.profile.security.Role
import au.org.ala.profile.security.Secured

class VocabController extends BaseController {

    ProfileService profileService

    def show() {
        if (!params.opusId || !params.vocabId) {
            badRequest()
        } else {
            def response = profileService.getVocab(params.opusId, params.vocabId)

            handle response
        }
    }

    @Secured(role = Role.ROLE_PROFILE_ADMIN)
    def update() {
        def json = request.getJSON();
        if (!params.opusId || !params.vocabId || !json) {
            badRequest()
        } else {
            def response = profileService.updateVocabulary(params.opusId, params.vocabId, json)

            handle response
        }
    }

    @Secured(role = Role.ROLE_PROFILE_ADMIN)
    def create() {
        def json = request.getJSON();
        if (!params.opusId || !json) {
            badRequest()
        } else {
            def response = profileService.createVocabulary(params.opusId, json)

            handle response
        }
    }

    @Secured(role = Role.ROLE_PROFILE_ADMIN)
    def findUsagesOfTerm() {
        if (!params.opusId || !params.vocabId || !params.termName) {
            badRequest()
        } else {
            def response = profileService.findUsagesOfVocabTerm(params.opusId, params.vocabId, params.termName)

            handle response
        }
    }

    @Secured(role = Role.ROLE_PROFILE_ADMIN)
    def replaceUsagesOfTerm() {
        def json = request.getJSON();
        if (!params.opusId || !json) {
            badRequest()
        } else {
            def response = profileService.replaceUsagesOfVocabTerm(params.opusId, json)

            handle response
        }
    }
}
