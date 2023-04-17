package au.org.ala.profile.hub

import au.org.ala.ws.service.WebService
import org.apache.http.entity.ContentType

class NslService {
    WebService webService
    def grailsApplication

    def getNameDetails(String nslNameIdentifier) {
        if (nslNameIdentifier && nslNameIdentifier != "null") {
            webService.get("${grailsApplication.config.nsl.service.url.prefix}${nslNameIdentifier}.json", [:], ContentType.APPLICATION_JSON, false, false)
        }
    }

    List<Map> listConcepts(String nslNameIdentifier) {
        List<Map> formattedConcepts = []

        if (nslNameIdentifier && nslNameIdentifier != "null") {
            def concepts = webService.get("${grailsApplication.config.nsl.service.url.prefix}${nslNameIdentifier}${grailsApplication.config.nsl.service.apni.concept.suffix}", [:], ContentType.APPLICATION_JSON, false, false)
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
