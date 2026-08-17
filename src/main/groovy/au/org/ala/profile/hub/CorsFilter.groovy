package au.org.ala.profile.hub

import groovy.transform.CompileStatic
import org.springframework.web.filter.OncePerRequestFilter

import javax.servlet.FilterChain
import javax.servlet.ServletException
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import java.io.IOException

/**
 * Explicit CORS filter. Grails 6.2.x built-in CORS config does not reliably apply
 * allowedOrigins from application config, which yields "Invalid CORS request" on
 * preflight and omits Access-Control-Allow-Origin on actual responses.
 *
 * Allowed origins are read from {@code cors.allowedOrigins} (YAML list, Groovy list,
 * or comma-separated string) so they can be overridden in external config.
 */
@CompileStatic
class CorsFilter extends OncePerRequestFilter {

    private static final String ALLOWED_METHODS = 'GET, HEAD, POST, PUT, DELETE, OPTIONS'
    private static final String ALLOWED_HEADERS = 'Authorization, Content-Type, Accept, Accept-Version, Origin, X-Requested-With'

    private final List<String> allowedOrigins

    CorsFilter(Object allowedOriginsConfig) {
        this.allowedOrigins = parseOrigins(allowedOriginsConfig)
    }

    static List<String> parseOrigins(Object raw) {
        if (raw == null) {
            return Collections.emptyList()
        }
        if (raw instanceof Collection) {
            List<String> result = new ArrayList<>()
            for (Object item : (Collection) raw) {
                if (item == null) {
                    continue
                }
                String origin = item.toString().trim()
                if (origin) {
                    result.add(origin)
                }
            }
            return Collections.unmodifiableList(result)
        }
        String asString = raw.toString().trim()
        if (!asString) {
            return Collections.emptyList()
        }
        List<String> result = new ArrayList<>()
        for (String part : asString.split(',')) {
            String origin = part.trim()
            if (origin) {
                result.add(origin)
            }
        }
        return Collections.unmodifiableList(result)
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String origin = request.getHeader('Origin')
        boolean allowed = origin != null && allowedOrigins.contains(origin)

        if (allowed) {
            response.setHeader('Access-Control-Allow-Origin', origin)
            response.setHeader('Access-Control-Allow-Credentials', 'true')
            response.setHeader('Vary', 'Origin')
            response.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS)
            response.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS)
            response.setHeader('Access-Control-Max-Age', '3600')
        }

        if ('OPTIONS'.equalsIgnoreCase(request.method)) {
            response.setStatus(allowed ? HttpServletResponse.SC_OK : HttpServletResponse.SC_FORBIDDEN)
            return
        }

        filterChain.doFilter(request, response)
    }
}
