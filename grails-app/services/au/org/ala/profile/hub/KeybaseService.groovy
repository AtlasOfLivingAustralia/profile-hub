package au.org.ala.profile.hub

import au.org.ala.ws.service.WebService
import org.apache.http.entity.ContentType

class KeybaseService {
    static final String CHAR_ENCODING = "utf-8"
    static final String LINK_THROUGH = "[link through]"

    def grailsApplication
    WebService webService

    String findKeyForTaxon(scientificName, projectId) {
        String key = null

        if (projectId) {
            key = findKey(scientificName, projectId)
        }

        key
    }

    private findKey(String name, String projectId) {
        name = URLEncoder.encode(name, CHAR_ENCODING)

        String key = null

        def json = webService.get("${grailsApplication.config.keybase.taxon.lookup}${name}", [:], ContentType.APPLICATION_JSON, false, false).resp
        json?.Items?.each {
            if (it.ProjectsID == projectId) {
                key = it.KeysID
            }
        }

        key
    }

    def retrieveAllProjects() {
        webService.get("${grailsApplication.config.keybase.project.lookup}", [:], ContentType.APPLICATION_JSON, false, false)
    }

    /**
     * Returns a map containing keyName, projectName, projectIcon, source, and items for the specified taxon within the specified
     * keybase project.
     *
     * The 'items' list is an ordered list of the bracketed key, where each element is a 3-part map:
     * <ol>
     * <li>id: The sequence number for the key
     * <li>text: The text of the key
     * <li>target: The next step in the key, or the resulting taxon name
     * </ol>
     * E.g.
     * <pre>
     * [id:1, text:Mature leaves modified into phyllodes (either flat, spiny or needle-like) or absent, target:2]
     * [id:1, text:Mature leaves bipinnate, target:114]
     * [id:2, text:Flowers in globular (rarely obloid) heads, target:3]
     * [id:2, text:Flowers in cylindric spikes, target:100]
     * ...
     * </pre>
     *
     * This method assumes that the keybase service will return the key in the following format (only showing fields
     * that are used):
     * <pre>
     *{*         'key_name': '',
     *         'project': {*             'project_icon': '',
     *             'project_name': ''
     *},
     *         'source': {*
     *},
     *         ...
     *         'leads': [
     *{*              'lead_text': '',
     *              'item': '',
     *              'lead_id': '',
     *              'parent_id: ''
     *},
     *          ...
     *         ],
     *         ...,
     *         'items': [
     *{*                  'item_name': '',
     *                  'item_id': '',
     *                  ...
     *}*         ]
     *}* </pre>
     *
     * The 'printable' aspect means that there are no references to nested keys, since these cannot be followed in a
     * printable format.
     *
     * @param projectId The keybase project id to search in for the key
     * @param name The taxon name to search for
     * @return An ordered list of bracketed keys, with key metadata
     */
    Map getPrintableBracketedKey(String projectId, String name) {
        Map result = [:]
        Map<String, List<Map>> couplets = [:].withDefault { [] }

        String keyId = findKey(name, projectId)

        if (keyId) {
            Map key = webService.get("${grailsApplication.config.keybase.key.lookup}?key_id=${keyId}", [:], ContentType.APPLICATION_JSON, false, false)?.resp as Map

            if (key) {
                Map items = key.items.collectEntries { [(it.item_id): it.item_name] }

                List parents = []
                key.leads.each { lead ->
                    if (!parents.contains(lead.parent_id) && lead.lead_text != LINK_THROUGH) {
                        parents << lead.parent_id
                    }
                }

                key.leads.each { lead ->
                    if (lead.lead_text != LINK_THROUGH) {
                        couplets[lead.parent_id] << [id    : (parents.findIndexOf { it == lead.parent_id } + 1),
                                                     text  : lead.lead_text,
                                                     target: lead.item ? items[lead.item] : (parents.findIndexOf {
                                                         it == lead.lead_id
                                                     } + 1),
                                                     lead_id: lead.lead_id]
                    } else {
                       Map parentMap = [:]
                       couplets.each { e ->
                            if (parentMap.isEmpty()) {
                                e?.value?.each { m ->
                                     if (m.lead_id == lead.parent_id) {
                                         parentMap = m
                                     }
                                }
                            }
                       }
                       if (!parentMap.isEmpty() && parentMap.target) {
                            parentMap.target = parentMap.target + ": " + items[lead.item]
                       }
                    }
                }

                result.keyName = key.key_name
                result.projectName = key.project.project_name
                result.projectIcon = key.project.project_icon
                result.source = constructSourceText(key.source)
                result.items = couplets.values().flatten()
            }
            log.info("Error retrieving data from Keybase webservice while generating PDF, Key data will be missing from the PDF for keyId: "+keyId);
        }

        result
    }

    private static String constructSourceText(Map source) {
        String text = ""

        if (source.author && source.publication_year && source.title) {
            if (source.is_modified) {
                text = "Modified from: "
            } else {
                text = "From: "
            }

            text += "<b>${source.author}</b> (${source.publication_year}). "
            if (source.journal) {
                text += "${source.title}. <i>${source.journal}</i>"
                if (source.series) {
                    text += ", ser. ${source.series}"
                }
                text += " <b>${source.volume}</b>"
                if (source.part) {
                    text += "(${source.part})"
                }
                text += ": ${source.page}."
            } else {
                if (source.in_title) {
                    text += "${source.title}. In: "
                    if (source.in_author) {
                        text += "${source.in_author}, "
                    }
                    text += "<i>${source.in_title}</i>"
                    if (source.volume) {
                        text += " <b>${source.volume}</b>"
                    }
                    if (source.page) {
                        text += ", pp. ${source.page}"
                    }
                    text += "."
                    if (source.publisher) {
                        text += " ${source.publisher}"
                        if (source.place_of_publication) {
                            text += ","
                        } else {
                            text += "."
                        }
                    }
                    if (source.place_of_publication) {
                        text += " ${source.place_of_publication}."
                    }
                }
            }
        }

        text
    }
}
