package au.org.ala.profile.hub

import groovy.transform.CompileStatic
import groovy.util.logging.Slf4j
import org.apache.commons.lang3.tuple.Pair
import org.pac4j.core.adapter.FrameworkAdapter
import org.pac4j.core.client.DirectClient
import org.pac4j.core.config.Config
import org.pac4j.core.context.CallContext
import org.pac4j.core.context.WebContext
import org.pac4j.core.context.session.SessionStore
import org.pac4j.core.credentials.Credentials
import org.pac4j.core.exception.CredentialsException
import org.pac4j.core.profile.ProfileManager
import org.pac4j.core.profile.UserProfile
import org.pac4j.jee.context.JEEFrameworkParameters
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus

/**
 * Authenticates optional Bearer JWTs for hub controllers using ala-ws-security
 * {@link DirectClient}s (typically {@code DirectBearerAuthClient}).
 *
 * Unlike {@code AlaSecurityInterceptor} / {@code @RequireApiKey}, missing tokens are
 * allowed (public endpoints). Invalid tokens return 401 instead of redirecting to OIDC.
 */
@Slf4j
@CompileStatic
class JwtBearerAuthInterceptor {

    // Run before AccessControlInterceptor so AuthService sees the JWT profile.
    int order = HIGHEST_PRECEDENCE + 20

    @Autowired(required = false)
    @Qualifier('alaClient')
    List<DirectClient> clientList

    @Autowired(required = false)
    Config config

    JwtBearerAuthInterceptor() {
        matchAll()
                .excludes(controller: 'api') // @RequireApiKey / ApiInterceptor already handle /api/**
                .excludes(uri: '/assets/**')
                .excludes(uri: '/static/**')
                .excludes(uri: '/callback')
                .excludes(uri: '/logout')
                .excludes(uri: '/login')
                .excludes(uri: '/error')
                .excludes(uri: '/notAuthorised')
                .excludes(uri: '/notFound')
    }

    boolean before() {
        if (request.method == 'OPTIONS') {
            return true
        }

        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION)
        if (!authorization || !authorization.regionMatches(true, 0, 'Bearer ', 0, 7)) {
            return true
        }

        if (!clientList || !config) {
            log.warn('Authorization Bearer present but JWT DirectClients / pac4j Config are not available')
            return true
        }

        try {
            def params = new JEEFrameworkParameters(request, response)
            FrameworkAdapter.INSTANCE.applyDefaultSettingsIfUndefined(config)
            final WebContext context = config.webContextFactory.newContext(params)
            final SessionStore sessionStore = config.sessionStoreFactory.newSessionStore(params)
            final CallContext callContext = new CallContext(context, sessionStore, config.profileManagerFactory)

            Optional<Pair<DirectClient, Credentials>> optCredentials = getCredentials(clientList, callContext)
            if (!optCredentials.isPresent()) {
                log.info('Bearer token present but no credentials could be extracted/validated for {}', request.requestURI)
                response.sendError(HttpStatus.UNAUTHORIZED.value(), HttpStatus.UNAUTHORIZED.reasonPhrase)
                return false
            }

            Pair<DirectClient, Credentials> pair = optCredentials.get()
            DirectClient client = pair.left
            Credentials credentials = pair.right

            Optional<UserProfile> optProfile = client.getUserProfile(callContext, credentials)
            if (!optProfile.isPresent()) {
                log.info('Bearer token validated but no user profile created for {}', request.requestURI)
                response.sendError(HttpStatus.UNAUTHORIZED.value(), HttpStatus.UNAUTHORIZED.reasonPhrase)
                return false
            }

            UserProfile userProfile = optProfile.get()
            ProfileManager profileManager = config.profileManagerFactory.apply(context, sessionStore)
            profileManager.setConfig(config)
            profileManager.save(
                    client.getSaveProfileInSession(context, userProfile),
                    userProfile,
                    client.isMultiProfile(context, userProfile)
            )
            log.debug('Authenticated JWT profile {} for {}', userProfile.id, request.requestURI)
            return true
        } catch (CredentialsException e) {
            log.info('JWT authentication failed for {}: {}', request.requestURI, e.message)
            response.sendError(HttpStatus.UNAUTHORIZED.value(), HttpStatus.UNAUTHORIZED.reasonPhrase)
            return false
        } catch (Exception e) {
            log.warn("JWT authentication error for ${request.requestURI}", e)
            response.sendError(HttpStatus.UNAUTHORIZED.value(), HttpStatus.UNAUTHORIZED.reasonPhrase)
            return false
        }
    }

    boolean after() { true }

    void afterView() {}

    private static Optional<Pair<DirectClient, Credentials>> getCredentials(List<DirectClient> clients, CallContext context) {
        try {
            for (DirectClient client : clients) {
                Credentials credentials = client.getCredentials(context).orElse(null)
                credentials = (Credentials) client.validateCredentials(context, credentials).orElse(null)
                if (credentials != null && credentials.isForAuthentication()) {
                    return Optional.of(Pair.of(client, credentials))
                }
            }
        } catch (CredentialsException e) {
            log.info('Failed to retrieve JWT credentials: {}', e.message)
            log.debug('Failed to retrieve JWT credentials', e)
            throw e
        }
        return Optional.empty()
    }
}
