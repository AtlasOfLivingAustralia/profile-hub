package au.org.ala.profile.api

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import groovy.transform.Canonical

@Canonical
@JsonIgnoreProperties('metaClass')
class OpusResponse {
    String uuid
    String dataResourceUid
    String title
    String shortName
    String description
    String masterListUid
    Map dataResourceConfig
    String approvedImageOption
    List approvedLists
    List featureLists
    String featureListSectionName
    Map brandingConfig
    Map profileLayoutConfig
    Map opusLayoutConfig
    Map theme
    Map help
    String keybaseProjectId
    String keybaseKeyId
    String attributeVocabUuid
    String authorshipVocabUuid
    String groupVocabUuid
    boolean autoDraftProfiles
    String glossaryUuid
    List attachments
    boolean enablePhyloUpload
    boolean enableOccurrenceUpload
    boolean enableTaxaUpload
    boolean enableKeyUpload
    boolean privateCollection
    boolean keepImagesPrivate
    boolean usePrivateRecordData
    Map mapConfig
    List supportingOpuses
    List requestedSupportingOpuses
    List sharingDataWith
    boolean autoApproveShareRequests
    boolean allowCopyFromLinkedOpus
    boolean showLinkedOpusAttributes
    boolean allowFineGrainedAttribution
    List authorities
    String copyrightText
    String footerText
    Map contact
    boolean hasAboutPage
    int profileCount
    String florulaListId
    String aboutHtml
    String citationHtml
    String citationProfile
    List tags
    List additionalStatuses
    Long dateCreated
    Long lastUpdated
}
