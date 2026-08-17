import au.org.ala.profile.hub.CorsFilter
import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.core.Ordered

// Place your Spring DSL code here
beans = {
    // Register only via FilterRegistrationBean so Spring Boot does not also
    // auto-register the Filter bean (which would run CORS handling twice).
    def corsOrigins = application.config.getProperty('cors.allowedOrigins')
    corsFilterRegistration(FilterRegistrationBean) {
        filter = new CorsFilter(corsOrigins)
        urlPatterns = ['/*']
        order = Ordered.HIGHEST_PRECEDENCE
    }
}
