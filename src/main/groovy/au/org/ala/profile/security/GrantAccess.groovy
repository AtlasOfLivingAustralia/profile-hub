package au.org.ala.profile.security

import java.lang.annotation.*

/**
 * Annotation to check that a valid collection-specific access token has been provided.
 */
@Target([ElementType.TYPE, ElementType.METHOD])
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface GrantAccess {

}