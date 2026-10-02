package au.org.ala.profile.hub

class NslService {
    def grailsApplication
    DownstreamGetCacheService downstreamGetCacheService

    def getNameDetails(String nslNameIdentifier) {
        if (nslNameIdentifier && nslNameIdentifier != "null") {
            String url = "${grailsApplication.config.getProperty('nsl.service.url.prefix')}${nslNameIdentifier}.json"
            return DownstreamGetCacheService.unwrap { downstreamGetCacheService.nslName(url) }
        }
    }

    List<Map> listConcepts(String nslNameIdentifier) {
        List<Map> formattedConcepts = []

        if (nslNameIdentifier && nslNameIdentifier != "null") {
            String url = "${grailsApplication.config.getProperty('nsl.service.url.prefix')}${nslNameIdentifier}${grailsApplication.config.getProperty('nsl.service.apni.concept.suffix')}"
            def concepts = DownstreamGetCacheService.unwrap { downstreamGetCacheService.nslConcepts(url) }
            formattedConcepts = concepts?.resp?.references?.collect { formatReference(it) }
        }

        formattedConcepts
    }

    def getConcept(String nslNameIdentifier, String nslNomenclatureIdentifier) {
        def concepts = listConcepts(nslNameIdentifier)

        concepts?.find { it.instanceId == nslNomenclatureIdentifier }
    }

    private static Map formatReference(reference) {
        String referenceUrl = reference.citations[0]?._links?.permalink?.link
        String name = reference.citation
        if (reference.APCReference?.toBoolean()) {
            name += " (APC)"
        }
        String formattedName = reference.citationHtml;
        if (reference.citations && reference.citations.size() > 0 && reference.citations[0].page) {
            formattedName += ": ${reference.citations[0].page}";
        }
        List details = []

        def typeNote = reference.notes?.find { it.instanceNoteKey == "Type" }
        if (typeNote) {
            details << [type: "Type", text: "<b>Type:</b> ${typeNote.instanceNoteText}"]
        }

        String firstCitationId = null;
        reference.citations.each { citation ->
            String citationPage = citation.page

            String citationUrl = citation._links.permalink.link
            String instanceId = citationUrl.substring(citationUrl.lastIndexOf("/") + 1)

            if (!firstCitationId) {
                firstCitationId = instanceId;
            }

            if (citation.relationship) {
                String text = citation.relationship
                if (citation.page && citation.page != "-") {
                    text += ": ${citation.page}"
                }
                details << [type: "citation", text: text, citationUrl: citationUrl, citationId: instanceId]
            } else if (citation.relationships) {
                citation.relationships.each { relationship ->
                    String text = relationship.relationship

                    if (relationship.page && relationship.page != citationPage && relationship.page != "-") {
                        text += ": ${relationship.page}"
                    }

                    details << [type: "citation", text: text, citationUrl: citationUrl, citationId: instanceId]
                }
            }
        }

        [
                name: name,
                instanceId: firstCitationId,
                formattedName: formattedName,
                url: referenceUrl,
                apcReference: reference.APCReference ? reference.APCReference?.toBoolean() : false,
                details: details
        ]
    }
}
