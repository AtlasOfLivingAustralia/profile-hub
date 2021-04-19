package au.org.ala.profile.analytics;

import retrofit2.Retrofit;

/**
 * Factory bean for generating a GoogleAnalyticsClient instance for Spring
 */
public class GoogleAnalyticsClientFactory {

    private String baseUrl;

    public GoogleAnalyticsClientFactory() {}

    public GoogleAnalyticsClient getInstance() {
        Retrofit retrofit = new Retrofit.Builder().baseUrl(baseUrl).build();
        return retrofit.create(GoogleAnalyticsClient.class);
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }
}
