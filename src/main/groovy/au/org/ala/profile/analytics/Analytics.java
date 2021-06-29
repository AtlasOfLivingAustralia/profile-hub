package au.org.ala.profile.analytics;

import java.lang.annotation.*;

/**
 * Indicates that a controller action (or entire controller) requires
 * reporting pageviews to the analytics service from the server side.
 */
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Analytics {
}
