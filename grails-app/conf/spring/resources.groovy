import au.org.ala.profile.analytics.GoogleAnalyticsClientFactory

// Place your Spring DSL code here
beans = {

    googleAnalyticsClientFactory(GoogleAnalyticsClientFactory) {
        // override with beans.googleAnalyticsClientFactory.baseUrl property
        baseUrl = 'https://ssl.google-analytics.com'
    }
    googleAnalyticsClient(googleAnalyticsClientFactory: 'getInstance') { }
}
