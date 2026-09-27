package au.org.ala.profile.hub

import groovy.json.JsonSlurper

class HelpTagLib {
    static namespace = "p"

    static final String HELP_URLS = "help_urls"

    def help = { attrs ->
        String url
        if(attrs["collection-override"]){
            url = attrs["collection-override"]
        } else {
            Map helpUrls = servletContext.getAttribute(HELP_URLS)
            if (!helpUrls) {
                helpUrls = loadHelpUrls()
            }

            String urlSuffix = helpUrls?.urls?.get(attrs["help-id"])
            url = "${helpUrls?.baseUrl}${urlSuffix}"
        }

        boolean floatRight = attrs.containsKey("float") ? attrs.float.toBoolean() : true
        boolean show = attrs.containsKey("show") ? attrs.show.toBoolean() : true
        out << render(template:"/common/helpIcon", model: [url: url, floatRight: floatRight, show: show])
    }

    def helpUrl = { attrs ->
        Map helpUrls = servletContext.getAttribute(HELP_URLS)
        if (!helpUrls) {
            helpUrls = loadHelpUrls()
        }

        String url = ""
        if (helpUrls?.urls?.containsKey(attrs["help-id"])) {
            url = "${helpUrls?.baseUrl}${helpUrls?.urls?.get(attrs["help-id"])}"
        }

        out << url
    }

    private Map loadHelpUrls() {
        log.debug("Loading help url mappings...")
        String helpFile = "${grailsApplication.config.getProperty('help.mapping.file')}"

        File file = new File(helpFile)

        Map json = null

        if (file.exists()) {
            json = new JsonSlurper().parse(file)
            servletContext.setAttribute(HELP_URLS, json)
        } else {
            log.error("Failed to read help url mappings from ${helpFile}")
        }

        json
    }
}
