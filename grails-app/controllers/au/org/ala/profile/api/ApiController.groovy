package au.org.ala.profile.api

import au.ala.org.ws.security.RequireApiKey
import au.org.ala.profile.hub.BaseController
import au.org.ala.profile.hub.MapService
import au.org.ala.profile.hub.ProfileService
import au.org.ala.profile.security.RequiresAccessToken
import grails.converters.JSON

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.enums.ParameterIn
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType
import io.swagger.v3.oas.annotations.headers.Header
import io.swagger.v3.oas.annotations.media.ArraySchema
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.security.SecurityScheme
import au.org.ala.plugins.openapi.Path

@SecurityScheme(name = "auth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer"
)
@RequireApiKey()
class ApiController extends BaseController {
    static namespace = "v1"
    static allowedSortFields = ['scientificNameLower', 'lastUpdated', 'dateCreated']
    static allowedOrderValues = ['asc', 'desc']

    ProfileService profileService
    MapService mapService
    ApiService apiService

    @Path("/api/opus/{opusId}")
    @Operation(
            summary = "Get collection (opus) details",
            operationId = "/api/opus/{opusId}",
            method = "GET",
            responses = [
                    @ApiResponse(
                            responseCode = "200",
                            content = @Content(
                                    mediaType = "application/json",
                                    array = @ArraySchema(
                                            schema = @Schema(
                                                    implementation = OpusResponse.class
                                            )
                                    )
                            ),
                            headers = [
                                    @Header(name = 'Access-Control-Allow-Headers', description = "CORS header", schema = @Schema(type = "String")),
                                    @Header(name = 'Access-Control-Allow-Methods', description = "CORS header", schema = @Schema(type = "String")),
                                    @Header(name = 'Access-Control-Allow-Origin', description = "CORS header", schema = @Schema(type = "String"))
                            ]
                    ),
                    @ApiResponse(responseCode = "400",
                            description = "opusId is a required parameter"),
                    @ApiResponse(responseCode = "403",
                            description = "You do not have the necessary permissions to perform this action."),
                    @ApiResponse(responseCode = "405",
                            description = "An unexpected error has occurred while processing your request."),
                    @ApiResponse(responseCode = "404",
                            description = "Collection not found"),
                    @ApiResponse(responseCode = "500",
                            description = "An unexpected error has occurred while processing your request.")
            ],
            parameters = [
                    @Parameter(
                            name = "opusId",
                            in = ParameterIn.PATH,
                            required = true,
                            description = "Collection id"
                    ),
                    @Parameter(name = "Access-Token",
                            in = ParameterIn.HEADER,
                            required = false,
                            description = "Access token to read private collection"),
                    @Parameter(name = "Accept-Version",
                            in = ParameterIn.HEADER,
                            required = true,
                            description = "The API version",
                            schema = @Schema(
                                    name = "Accept-Version",
                                    type = "string",
                                    defaultValue = '1.0',
                                    allowableValues =  ["1.0"]
                            )
                    )
            ],
            security = [@SecurityRequirement(name="auth"), @SecurityRequirement(name = "oauth")]
    )
    def getOpus () {
        if (!params.opusId) {
            badRequest "opusId is a required parameter"
        } else {
            Map opus = profileService.getOpus(params.opusId)
            if (!opus) {
                notFound()
            } else {
                opus.remove('accessToken')
                render opus as JSON
            }
        }
    }

    @Path("/api/opus/{opusId}/profile")
    @Operation(
            summary = "List profiles in a collection",
            operationId = "/api/opus/{opusId}/profile",
            method = "GET",
            responses = [
                    @ApiResponse(
                            responseCode = "200",
                            content = @Content(
                                    mediaType = "application/json",
                                    array = @ArraySchema(
                                            schema = @Schema(
                                                implementation = ProfileBriefResponse.class
                                            )
                                    )
                            ),
                            headers = [
                                    @Header(name = 'X-Total-Count', description = "Total number of profiles", schema = @Schema(type = "integer")),
                                    @Header(name = 'Access-Control-Allow-Headers', description = "CORS header", schema = @Schema(type = "String")),
                                    @Header(name = 'Access-Control-Allow-Methods', description = "CORS header", schema = @Schema(type = "String")),
                                    @Header(name = 'Access-Control-Allow-Origin', description = "CORS header", schema = @Schema(type = "String"))
                            ]
                    ),
                    @ApiResponse(responseCode = "400",
                            description = "opusId is a required parameter"),
                    @ApiResponse(responseCode = "403",
                            description = "You do not have the necessary permissions to perform this action."),
                    @ApiResponse(responseCode = "405",
                            description = "An unexpected error has occurred while processing your request."),
                    @ApiResponse(responseCode = "404",
                            description = "Collection not found"),
                    @ApiResponse(responseCode = "500",
                            description = "An unexpected error has occurred while processing your request.")
            ],
            parameters = [
                    @Parameter(
                            name = "opusId",
                            in = ParameterIn.PATH,
                            required = true,
                            description = "Collection id"
                    ),
                    @Parameter(name = "taxonName",
                            in = ParameterIn.QUERY,
                            required = false,
                            description = "Filter profiles to a taxon in the taxonomic tree. Result will include the mentioned taxon."),
                    @Parameter(name = "taxonRank",
                            in = ParameterIn.QUERY,
                            required = false,
                            description = "The rank of the taxon provided in taxonName parameter. Example, acacia taxonName will have genus as taxonRank."),
                    @Parameter(name = "pageSize",
                            in = ParameterIn.QUERY,
                            required = false,
                            description = "max number of profiles to return",
                            schema = @Schema(
                                    name = "version",
                                    type = "integer",
                                    format = "int64",
                                    defaultValue = '20'
                            )),
                    @Parameter(name = "startIndex",
                            in = ParameterIn.QUERY,
                            required = false,
                            description = "index of the first profile to return",
                            schema = @Schema(
                                    name = "version",
                                    type = "integer",
                                    format = "int64",
                                    defaultValue = '0'
                            )),
                    @Parameter(name = "sort",
                            in = ParameterIn.QUERY,
                            required = false,
                            description = "the field to sort the results by",
                            schema = @Schema(
                                name = "sort",
                                type = "string",
                                defaultValue = 'scientificNameLower',
                                allowableValues =  ["scientificNameLower","dateCreated","lastUpdated"]
                            )
                    ),
                    @Parameter(name = "order",
                            in = ParameterIn.QUERY,
                            required = false,
                            description = "the direction to sort the results by",
                            schema = @Schema(
                                    name = "order",
                                    type = "string",
                                    defaultValue = 'asc',
                                    allowableValues =  ["asc","desc"]
                            )
                    ),
                    @Parameter(name = "rankFilter",
                            in = ParameterIn.QUERY,
                            required = false,
                            description = "the result set will only show profiles at the provided rank"
                    ),
                    @Parameter(name = "Access-Token",
                            in = ParameterIn.HEADER,
                            required = false,
                            description = "Access token to read private collection"),
                    @Parameter(name = "Accept-Version",
                            in = ParameterIn.HEADER,
                            required = true,
                            description = "The API version",
                            schema = @Schema(
                                    name = "Accept-Version",
                                    type = "string",
                                    defaultValue = '1.0',
                                    allowableValues =  ["1.0"]
                            )
                    )
            ],
            security = [@SecurityRequirement(name="auth"), @SecurityRequirement(name = "oauth")]
    )
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
                def result = apiService.getProfiles(params.opusId, startIndex, pageSize, sort, order, taxonName, taxonRank, rankFilter)
                def profiles = result?.resp.profiles
                def count = result?.resp.count
                response.addIntHeader('X-Total-Count', count)
                render profiles as JSON
            }
        }
    }

    @Path("/api/opus/{opusId}/profile/{profileId}")
    @Operation(
            summary = "Get a profile in a collection",
            operationId = "/api/opus/{opusId}/profile/{profileId}",
            method = "GET",
            responses = [
                    @ApiResponse(
                            responseCode = "200",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(
                                            implementation = ProfileResponse.class
                                    )
                            ),
                            headers = [
                                    @Header(name = 'Access-Control-Allow-Headers', description = "CORS header", schema = @Schema(type = "String")),
                                    @Header(name = 'Access-Control-Allow-Methods', description = "CORS header", schema = @Schema(type = "String")),
                                    @Header(name = 'Access-Control-Allow-Origin', description = "CORS header", schema = @Schema(type = "String"))
                            ]
                    ),
                    @ApiResponse(responseCode = "400",
                            description = "opusId and profileId are required parameters"),
                    @ApiResponse(responseCode = "403",
                            description = "You do not have the necessary permissions to perform this action."),
                    @ApiResponse(responseCode = "405",
                            description = "An unexpected error has occurred while processing your request."),
                    @ApiResponse(responseCode = "404",
                            description = "Collection or profile not found"),
                    @ApiResponse(responseCode = "500",
                            description = "An unexpected error has occurred while processing your request.")
            ],
            parameters = [
                    @Parameter(name = "opusId",
                            in = ParameterIn.PATH,
                            required = true,
                            description = "Collection id - UUID or short name"),
                    @Parameter(name = "profileId",
                            in = ParameterIn.PATH,
                            required = true,
                            description = "Profile id - UUID or Scientific name."),
                    @Parameter(name = "includeImages",
                            in = ParameterIn.QUERY,
                            required = false,
                            description = "if true, the API will return a list of images associated with profile",
                            schema = @Schema(
                                    name = "includeImages",
                                    type = "boolean",
                                    defaultValue = "false"
                            )),
                    @Parameter(name = "Access-Token",
                            in = ParameterIn.HEADER,
                            required = false,
                            description = "Access token to read private collection"),
                    @Parameter(name = "Accept-Version",
                            in = ParameterIn.HEADER,
                            required = true,
                            description = "The API version",
                            schema = @Schema(
                                    name = "Accept-Version",
                                    type = "string",
                                    defaultValue = '1.0',
                                    allowableValues =  ["1.0"]
                            )
                    )
            ],
            security = [@SecurityRequirement(name="auth"), @SecurityRequirement(name = "oauth")]
    )
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

    @Path("/api/opus/{opusId}/profile/{profileId}/draft")
    @Operation(
            summary = "Get a draft profile in a collection",
            operationId = "/api/opus/{opusId}/profile/{profileId}/draft",
            method = "GET",
            responses = [
                    @ApiResponse(
                            responseCode = "200",
                            content = @Content(
                                    mediaType = "application/json",
                                    array = @ArraySchema(
                                            schema = @Schema(
                                                    implementation = ProfileResponse.class
                                            )
                                    )
                            ),
                            headers = [
                                    @Header(name = 'Access-Control-Allow-Headers', description = "CORS header", schema = @Schema(type = "String")),
                                    @Header(name = 'Access-Control-Allow-Methods', description = "CORS header", schema = @Schema(type = "String")),
                                    @Header(name = 'Access-Control-Allow-Origin', description = "CORS header", schema = @Schema(type = "String"))
                            ]
                    ),
                    @ApiResponse(responseCode = "400",
                            description = "opusId and profileId are required parameters"),
                    @ApiResponse(responseCode = "403",
                            description = "You do not have the necessary permissions to perform this action."),
                    @ApiResponse(responseCode = "405",
                            description = "An unexpected error has occurred while processing your request."),
                    @ApiResponse(responseCode = "404",
                            description = "Collection or profile not found"),
                    @ApiResponse(responseCode = "500",
                            description = "An unexpected error has occurred while processing your request.")

            ],
            parameters = [
                    @Parameter(name = "opusId",
                            in = ParameterIn.PATH,
                            required = true,
                            description = "Collection id - UUID or short name"),
                    @Parameter(name = "profileId",
                            in = ParameterIn.PATH,
                            required = true,
                            description = "Profile id - UUID or Scientific name."),
                    @Parameter(name = "Access-Token",
                            in = ParameterIn.HEADER,
                            required = true,
                            description = "Access token for the collection"),
                    @Parameter(name = "Accept-Version",
                            in = ParameterIn.HEADER,
                            required = true,
                            description = "The API version",
                            schema = @Schema(
                                    name = "Accept-Version",
                                    type = "string",
                                    defaultValue = '1.0',
                                    allowableValues =  ["1.0"]
                            )
                    )
            ],
            security = [@SecurityRequirement(name="auth"), @SecurityRequirement(name = "oauth")]
    )
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

    @Path("/api/opus/{opusId}/profile/{profileId}/image")
    @Operation(
            summary = "Get images associated with a profile",
            operationId = "/api/opus/{opusId}/profile/{profileId}/image",
            method = "GET",
            responses = [
                    @ApiResponse(
                            responseCode = "200",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(
                                            implementation = ImageListResponse.class
                                    )
                            ),
                            headers = [
                                    @Header(name = 'X-Total-Count', description = "Total number of images", schema = @Schema(type = "integer")),
                                    @Header(name = 'Access-Control-Allow-Headers', description = "CORS header", schema = @Schema(type = "String")),
                                    @Header(name = 'Access-Control-Allow-Methods', description = "CORS header", schema = @Schema(type = "String")),
                                    @Header(name = 'Access-Control-Allow-Origin', description = "CORS header", schema = @Schema(type = "String"))
                            ]
                    ),
                    @ApiResponse(responseCode = "400",
                            description = "opusId and profileId are required parameters"),
                    @ApiResponse(responseCode = "403",
                            description = "You do not have the necessary permissions to perform this action."),
                    @ApiResponse(responseCode = "405",
                            description = "An unexpected error has occurred while processing your request."),
                    @ApiResponse(responseCode = "404",
                            description = "Opus or profile not found"),
                    @ApiResponse(responseCode = "500",
                            description = "An unexpected error has occurred while processing your request.")
            ],
            parameters = [
                    @Parameter(name = "opusId",
                            in = ParameterIn.PATH,
                            required = true,
                            description = "Collection id - UUID or short name"),
                    @Parameter(name = "profileId",
                            in = ParameterIn.PATH,
                            required = true,
                            description = "Profile id - UUID or Scientific name"),
                    @Parameter(name = "pageSize",
                            in = ParameterIn.QUERY,
                            required = false,
                            description = "max number of profiles to return",
                            schema = @Schema(
                                    name = "version",
                                    type = "integer",
                                    format = "int64",
                                    defaultValue = '20'
                            )
                    ),
                    @Parameter(name = "startIndex",
                            in = ParameterIn.QUERY,
                            required = false,
                            description = "index of the first image in a profile to return",
                            schema = @Schema(
                                    name = "version",
                                    type = "integer",
                                    format = "int64",
                                    defaultValue = '0'
                            )
                    ),
                    @Parameter(name = "Access-Token",
                            in = ParameterIn.HEADER,
                            required = false,
                            description = "Access token to read private collection"),
                    @Parameter(name = "Accept-Version",
                            in = ParameterIn.HEADER,
                            required = true,
                            description = "The API version",
                            schema = @Schema(
                                    name = "Accept-Version",
                                    type = "string",
                                    defaultValue = '1.0',
                                    allowableValues =  ["1.0"]
                            )
                    )
            ],
            security = [@SecurityRequirement(name="auth"), @SecurityRequirement(name = "oauth")]
    )
    def getImages () {
        if (!params.opusId || !params.profileId ) {
            badRequest "opusId and profileId are required parameters"
        } else {
            int startIndex = params.getInt('startIndex', 0)
            int pageSize = params.getInt('pageSize', 20)
            def result = apiService.retrieveImagesPaged(params.opusId, params.profileId, pageSize, startIndex)
            int count = result?.resp?.count
            response.addIntHeader('X-Total-Count', count)
            handle(result)
        }
    }

    @Path("/api/opus/{opusId}/profile/{profileId}/attribute/{attributeId}")
    @Operation(
            summary = "Get attributes of a profile in a collection",
            operationId = "/api/opus/{opusId}/profile/{profileId}/attribute/{attributeId}",
            method = "GET",
            responses = [
                    @ApiResponse(
                            responseCode = "200",
                            content = @Content(
                                    mediaType = "application/json",
                                    array = @ArraySchema(
                                            schema = @Schema(
                                                    implementation = AttributeResponse.class
                                            )
                                    )
                            ),
                            headers = [
                                    @Header(name = 'Access-Control-Allow-Headers', description = "CORS header", schema = @Schema(type = "String")),
                                    @Header(name = 'Access-Control-Allow-Methods', description = "CORS header", schema = @Schema(type = "String")),
                                    @Header(name = 'Access-Control-Allow-Origin', description = "CORS header", schema = @Schema(type = "String"))
                            ]
                    ),
                    @ApiResponse(responseCode = "400",
                            description = "opusId and profileId are required parameters"),
                    @ApiResponse(responseCode = "403",
                            description = "You do not have the necessary permissions to perform this action."),
                    @ApiResponse(responseCode = "405",
                            description = "An unexpected error has occurred while processing your request."),
                    @ApiResponse(responseCode = "404",
                            description = "Collection or profile not found"),
                    @ApiResponse(responseCode = "500",
                            description = "An unexpected error has occurred while processing your request.")
            ],
            parameters = [
                    @Parameter(name = "opusId",
                            in = ParameterIn.PATH,
                            required = true,
                            description = "Collection id - UUID or short name"),
                    @Parameter(name = "profileId",
                            in = ParameterIn.PATH,
                            required = true,
                            description = "Profile id - UUID or Scientific name."),
                    @Parameter(name = "attributeId",
                            in = ParameterIn.PATH,
                            required = true,
                            description = "This is the attribute id or attribute name. Multiple attributes must be comma separated."),
                    @Parameter(name = "Access-Token",
                            in = ParameterIn.HEADER,
                            required = false,
                            description = "Access token to read private collection"),
                    @Parameter(name = "Accept-Version",
                            in = ParameterIn.HEADER,
                            required = true,
                            description = "The API version",
                            schema = @Schema(
                                    name = "Accept-Version",
                                    type = "string",
                                    defaultValue = '1.0',
                                    allowableValues =  ["1.0"]
                            )
                    )
            ],
            security = [@SecurityRequirement(name="auth"), @SecurityRequirement(name = "oauth")]
    )
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
