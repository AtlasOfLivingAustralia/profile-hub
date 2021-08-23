package au.org.ala.profile.api

import au.org.ala.profile.analytics.Analytics
import au.org.ala.profile.hub.BaseController
import au.org.ala.profile.hub.MapService
import au.org.ala.profile.hub.ProfileService
import au.org.ala.profile.security.RequiresAccessToken
import grails.converters.JSON
import io.swagger.annotations.*

@Analytics
@Api(value = "/api", tags = ["1.0"], description = "Profiles API", protocols = "http,https")
class ApiController extends BaseController {
    static namespace = "v1"
    static allowedSortFields = ['scientificNameLower', 'lastUpdated', 'dateCreated']
    static allowedOrderValues = ['asc', 'desc']

    ProfileService profileService
    MapService mapService
    ApiService apiService

    @ApiOperation(
            value = "List profiles in a collection",
            nickname = "/opus/{opusId}/profile",
            produces = "application/json",
            httpMethod = "GET",
            response = ProfileListResponse
    )
    @ApiResponses([
            @ApiResponse(code = 400,
                    message = "opusId is a required parameter"),
            @ApiResponse(code = 403,
                    message = "You do not have the necessary permissions to perform this action."),
            @ApiResponse(code = 405,
                    message = "An unexpected error has occurred while processing your request."),
            @ApiResponse(code = 404,
                    message = "Collection not found"),
            @ApiResponse(code = 500,
                    message = "An unexpected error has occurred while processing your request.")
    ])
    @ApiImplicitParams([
            @ApiImplicitParam(name = "opusId",
                    paramType = "path",
                    dataType = "string",
                    required = true,
                    value = "Collection id"),
            @ApiImplicitParam(name = "taxonName",
                    paramType = "query",
                    dataType = "string",
                    required = false,
                    value = "Filter profiles to a taxon in the taxonomic tree. Result will include the mentioned taxon."),
            @ApiImplicitParam(name = "taxonRank",
                    paramType = "query",
                    dataType = "string",
                    required = false,
                    value = "The rank of the taxon provided in taxonName parameter. Example, acacia taxonName will have genus as taxonRank."),
            @ApiImplicitParam(name = "pageSize",
                    paramType = "query",
                    required = false,
                    defaultValue = '20',
                    value = "max number of profiles to return",
                    dataType = "Integer"),
            @ApiImplicitParam(name = "startIndex",
                    paramType = "query",
                    required = false,
                    defaultValue = '0',
                    value = "index of the first profile to return",
                    dataType = "Integer"),
            @ApiImplicitParam(name = "sort",
                    paramType = "query",
                    required = false,
                    defaultValue = 'scientificNameLower',
                    value = "the field to sort the results by",
                    allowableValues = 'scientificNameLower,dateCreated,lastUpdated',
                    dataType = "string"),
            @ApiImplicitParam(name = "order",
                    paramType = "query",
                    required = false,
                    defaultValue = 'asc',
                    value = "the direction to sort the results by",
                    allowableValues = 'asc,desc',
                    dataType = "string"),
            @ApiImplicitParam(name = "rankFilter",
                    paramType = "query",
                    required = false,
                    value = "the result set will only show profiles at the provided rank",
                    dataType = "string"),
            @ApiImplicitParam(name = "X-ALA-userName",
                    paramType = "header",
                    required = true,
                    dataType = "string",
                    value = "Registered username (email address) of user accessing the API"),
            @ApiImplicitParam(name = "Accept-Version",
                    paramType = "header",
                    required = true,
                    dataType = "string",
                    defaultValue = "1.0",
                    allowableValues = "1.0",
                    value = "The API version")
    ])
    def getProfiles () {
        if (!params.opusId) {
            badRequest "opusId is a required parameter"
        } else {
            String startIndex = params.startIndex ?: "0"
            String pageSize = params.pageSize ?: "20"
            String sort = allowedSortFields.contains(params.sort) ? params.sort : allowedSortFields[0]
            String order = allowedOrderValues.contains(params.order) ? params.order : allowedOrderValues[0]
            String taxonName = params.taxonName ?: ""
            String taxonRank = params.taxonRank ?: ""
            String rankFilter = params.rankFilter ?: ""

            def opus = profileService.getOpus(params.opusId)
            if (!opus) {
                notFound()
            } else {
                handle (apiService.getProfiles(params.opusId, startIndex, pageSize, sort, order, taxonName, taxonRank, rankFilter))
            }
        }
    }

    @ApiOperation(
            value = "Get a profile in a collection",
            nickname = "/opus/{opusId}/profile/{profileId}",
            produces = "application/json",
            httpMethod = "GET",
            response = ProfileResponse
    )
    @ApiResponses([
            @ApiResponse(code = 400,
                    message = "opusId and profileId are required parameters"),
            @ApiResponse(code = 403,
                    message = "You do not have the necessary permissions to perform this action."),
            @ApiResponse(code = 405,
                    message = "An unexpected error has occurred while processing your request."),
            @ApiResponse(code = 404,
                    message = "Collection or profile not found"),
            @ApiResponse(code = 500,
                    message = "An unexpected error has occurred while processing your request.")
    ])
    @ApiImplicitParams([
            @ApiImplicitParam(name = "opusId",
                    paramType = "path",
                    dataType = "string",
                    required = true,
                    value = "Collection id - UUID or short name"),
            @ApiImplicitParam(name = "profileId",
                    paramType = "path",
                    dataType = "string",
                    required = true,
                    value = "Profile id - UUID or Scientific name."),
            @ApiImplicitParam(name = "includeImages",
                    paramType = "query",
                    required = false,
                    dataType = "boolean",
                    defaultValue = "false",
                    value = "if true, the API will return a list of images associated with profile"),
            @ApiImplicitParam(name = "X-ALA-userName",
                    paramType = "header",
                    required = true,
                    dataType = "string",
                    value = "Registered user name (email address) of user accessing the API"),
            @ApiImplicitParam(name = "Accept-Version",
                    paramType = "header",
                    required = true,
                    dataType = "string",
                    defaultValue = "1.0",
                    allowableValues = "1.0",
                    value = "The API version")
    ])
    def get() {
        if (!params.opusId || !params.profileId) {
            badRequest "opusId and profileId are required parameters"
        } else {
            response.setContentType(CONTENT_TYPE_JSON)
            boolean latest = false
            final fullClassification = true
            boolean includeImages = params.getBoolean('includeImages', false)
            Map profileAndOpus = profileService.getProfile(params.opusId as String, params.profileId as String, latest, fullClassification)

            if (!profileAndOpus) {
                notFound()
            } else {
                String fullURL = grailsApplication.config.grails.serverURL +  (request.contextPath ? "/${request.contextPath}" : "")
                profileAndOpus.profile.mapSnapshot = mapService.getSnapshotImageUrlWithUUIDs(fullURL, profileAndOpus.opus.uuid, profileAndOpus.profile.uuid)
                apiService.supplementProfileData(profileAndOpus, 20, includeImages)
                render profileAndOpus.profile as JSON
            }
        }
    }

    @ApiOperation(
            value = "Get a draft profile in a collection",
            nickname = "/opus/{opusId}/profile/{profileId}/draft",
            produces = "application/json",
            httpMethod = "GET",
            response = ProfileResponse
    )
    @ApiResponses([
            @ApiResponse(code = 400,
                    message = "opusId and profileId are required parameters"),
            @ApiResponse(code = 403,
                    message = "You do not have the necessary permissions to perform this action."),
            @ApiResponse(code = 405,
                    message = "An unexpected error has occurred while processing your request."),
            @ApiResponse(code = 404,
                    message = "Collection or profile not found"),
            @ApiResponse(code = 500,
                    message = "An unexpected error has occurred while processing your request.")
    ])
    @ApiImplicitParams([
            @ApiImplicitParam(name = "opusId",
                    paramType = "path",
                    dataType = "string",
                    required = true,
                    value = "Collection id - UUID or short name"),
            @ApiImplicitParam(name = "profileId",
                    paramType = "path",
                    dataType = "string",
                    required = true,
                    value = "Profile id - UUID or Scientific name."),
            @ApiImplicitParam(name = "Access-Token",
                    paramType = "header",
                    required = true,
                    dataType = "string",
                    value = "Access token for the collection"),
            @ApiImplicitParam(name = "X-ALA-userName",
                    paramType = "header",
                    required = true,
                    dataType = "string",
                    value = "Registered user name (email address) of user accessing the API"),
            @ApiImplicitParam(name = "Accept-Version",
                    paramType = "header",
                    required = true,
                    dataType = "string",
                    defaultValue = "1.0",
                    allowableValues = "1.0",
                    value = "The API version")
    ])
    @RequiresAccessToken
    def getDraftProfile() {
        if (!params.opusId || !params.profileId) {
            badRequest "opusId and profileId are required parameters"
        } else {
            response.setContentType(CONTENT_TYPE_JSON)
            boolean latest = true
            final fullClassification = true
            boolean includeImages = false
            Map profileAndOpus = profileService.getProfile(params.opusId as String, params.profileId as String, latest, fullClassification)

            if (!profileAndOpus || !profileAndOpus.profile?.privateMode) {
                notFound()
            } else {
                String fullURL = grailsApplication.config.grails.serverURL +  (request.contextPath ? "/${request.contextPath}" : "")
                profileAndOpus.profile.mapSnapshot = mapService.getSnapshotImageUrlWithUUIDs(fullURL, profileAndOpus.opus.uuid, profileAndOpus.profile.uuid)
                apiService.supplementProfileData(profileAndOpus, 20, includeImages)
                render profileAndOpus.profile as JSON
            }
        }
    }

    @ApiOperation(
            value = "Get images associated with a profile",
            nickname = "/opus/{opusId}/profile/{profileId}/image",
            produces = "application/json",
            httpMethod = "GET",
            response = ImageListResponse
    )
    @ApiResponses([
            @ApiResponse(code = 400,
                    message = "opusId and profileId are required parameters"),
            @ApiResponse(code = 403,
                    message = "You do not have the necessary permissions to perform this action."),
            @ApiResponse(code = 405,
                    message = "An unexpected error has occurred while processing your request."),
            @ApiResponse(code = 404,
                    message = "Opus or profile not found"),
            @ApiResponse(code = 500,
                    message = "An unexpected error has occurred while processing your request.")
    ])
    @ApiImplicitParams([
            @ApiImplicitParam(name = "opusId",
                    paramType = "path",
                    dataType = "string",
                    required = true,
                    value = "Collection id - UUID or short name"),
            @ApiImplicitParam(name = "profileId",
                    paramType = "path",
                    dataType = "string",
                    required = true,
                    value = "Profile id - UUID or Scientific name"),
            @ApiImplicitParam(name = "pageSize",
                    paramType = "query",
                    required = false,
                    defaultValue = '20',
                    value = "max number of profiles to return",
                    dataType = "Integer"),
            @ApiImplicitParam(name = "startIndex",
                    paramType = "query",
                    required = false,
                    defaultValue = '0',
                    value = "index of the first image in a profile to return",
                    dataType = "Integer"),
            @ApiImplicitParam(name = "X-ALA-userName",
                    paramType = "header",
                    required = true,
                    dataType = "string",
                    value = "Registered user name (email address) of user accessing the API"),
            @ApiImplicitParam(name = "Accept-Version",
                    paramType = "header",
                    required = true,
                    dataType = "string",
                    defaultValue = "1.0",
                    allowableValues = "1.0",
                    value = "The API version")
    ])
    def getImages () {
        if (!params.opusId || !params.profileId ) {
            badRequest "opusId and profileId are required parameters"
        } else {
            int startIndex = params.getInt('startIndex', 0)
            int pageSize = params.getInt('pageSize', 20)
            def response = apiService.retrieveImagesPaged(params.opusId, params.profileId, pageSize, startIndex)
            handle(response)
        }
    }


    @ApiOperation(
            value = "Get attributes of a profile in a collection",
            nickname = "/opus/{opusId}/profile/{profileId}/attribute/{attributeId}",
            produces = "application/json",
            httpMethod = "GET",
            response = AttributeResponse,
            responseContainer = "List"
    )
    @ApiResponses([
            @ApiResponse(code = 400,
                    message = "opusId and profileId are required parameters"),
            @ApiResponse(code = 403,
                    message = "You do not have the necessary permissions to perform this action."),
            @ApiResponse(code = 405,
                    message = "An unexpected error has occurred while processing your request."),
            @ApiResponse(code = 404,
                    message = "Collection or profile not found"),
            @ApiResponse(code = 500,
                    message = "An unexpected error has occurred while processing your request.")
    ])
    @ApiImplicitParams([
            @ApiImplicitParam(name = "opusId",
                    paramType = "path",
                    dataType = "string",
                    required = true,
                    value = "Collection id - UUID or short name"),
            @ApiImplicitParam(name = "profileId",
                    paramType = "path",
                    dataType = "string",
                    required = true,
                    value = "Profile id - UUID or Scientific name."),
            @ApiImplicitParam(name = "attributeId",
                    paramType = "path",
                    required = true,
                    dataType = "string",
                    value = "This is the attribute id or attribute name. Multiple attributes must be comma separated."),
            @ApiImplicitParam(name = "X-ALA-userName",
                    paramType = "header",
                    required = true,
                    dataType = "string",
                    value = "Registered user name (email address) of user accessing the API"),
            @ApiImplicitParam(name = "Accept-Version",
                    paramType = "header",
                    required = true,
                    dataType = "string",
                    defaultValue = "1.0",
                    allowableValues = "1.0",
                    value = "The API version")
    ])
    def getAttributes() {
        if (!params.opusId || !params.profileId) {
            badRequest "opusId and profileId are required parameters"
        } else {
            response.setContentType(CONTENT_TYPE_JSON)
            boolean latest = false
            final fullClassification = true
            boolean includeImages = false
            List attributes = params.attributeId?.split(',')
            Map profileAndOpus = profileService.getProfile(params.opusId as String, params.profileId as String, latest, fullClassification)

            if (!profileAndOpus || !attributes) {
                notFound()
            } else {
                List profileAttributes = apiService.getAttributes(profileAndOpus.profile, attributes) ?: []
                render profileAttributes as JSON
            }
        }
    }

}
