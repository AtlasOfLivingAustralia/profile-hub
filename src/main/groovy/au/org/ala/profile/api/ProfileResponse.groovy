package au.org.ala.profile.api

import groovy.transform.Canonical

/*
 * Copyright (C) 2021 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 * 
 * Created by Temi on 16/7/21.
 */
@Canonical
class ProfileResponse {
        String primaryAudio
        String scientificName
        List documents
        String profileStatus
        String primaryVideo
        String uuid
        Date lastUpdated
        Map profileSettings
        String nslProtologue
        String nslUrl
        String nslNomenclatureIdentifier
        String opusName
        String rank
        List<LinkResponse> links
        MatchedNameResponse matchedName
        String archivedBy
        String bieURL
        String lastUpdatedBy
        String primaryImage
        String taxonomyTree
        Date lastPublished
        List<ClassificationResponse> classification
        ImageListResponse linkedImages
        String opusShortName
        String nameAuthor
        List specimenIds
        String dataResourceUid
        String guid
        String mapSnapshot
        String nslNameIdentifier
        String profileURL
        List attachments
        NSLResponse nsl
        Boolean privateMode
        String archivedWithName
        Boolean isCustomMapConfig
        List bibliography
        Boolean manuallyMatchedName
        List<AuthorshipResponse> authorship
        MapResponse map
        String archiveComment
        Date archivedDate
        Boolean manualClassification
        List bhl
        String occurrenceQuery
        String fullName
        List<ImageSettingResponse> imageSettings
        List stagedImages
        String opusId
        Boolean showLinkedOpusAttributes
        Date createdDate
        String createdBy
        List<AttributeResponse> attributes
        List<ImageResponse> privateImages
        String lastAttributeChange
        List<PublicationResponse> publications
        String citationText
}
