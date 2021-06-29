package au.org.ala.profile.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * This annotation is for special cases where a particular method should be exempt from security checks for Private Collections,
 * but should still undergo role based authorisation checks.
 *
 * An example of where this annotation could be used is during the image upload process, where the biocache service needs
 * to download the image: without this annotation, the biocache would not be able to access images for Private collections.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
public @interface PrivateCollectionSecurityExempt {

}