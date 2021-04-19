package au.org.ala.profile.hub

import au.org.ala.profile.security.Role
import au.org.ala.profile.security.Secured
import au.org.ala.ws.service.WebService
/**
 * When a collection is configured to use private data, all requests to the biocache are changed to [contextRoot/...],
 * which are configured to hit this controller. This controller then proxies all requests to the Profiles Sandbox
 * biocache-service instance, which is not publically accessible.
 */
@Secured(role = Role.ROLE_USER, opusSpecific = true)
class SandboxBiocacheProxyController {

    WebService webService

    def proxy() {
        // all incoming urls will be .../opus/[opusid]/ws/..., but we need to proxy them to just the bit after the /ws
        String requestPath = request.forwardURI.substring(request.forwardURI.indexOf("/ws") + 3)
        String queryString = request.queryString
        String baseUrl = "${grailsApplication.config.sandbox.biocache.service.url}"

        webService.proxyGetRequest(response, "${baseUrl}${requestPath}${queryString ? "?" : ""}${queryString ?: ""}", true, true)
    }

}
