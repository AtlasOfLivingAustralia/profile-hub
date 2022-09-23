package au.org.ala.profile.api

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
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
@JsonIgnoreProperties('metaClass')
class ImageMetadataResponse {
    Integer thumbHeight
    String rightsHolder
    String extension
    String imageIdentifier
    Date dateUploaded
    String mimeType
    String occurrenceId
    Integer filesize
    String title
    String contentSHA1Hash
    Integer recognisedLicenseId
    String rights
    String imageUrl
    String contentMD5Hash
    String thumbUrl
    RecognisedLicenseResponse recognisedLicense
    Integer height
    String creator
    String imageId
    Integer thumbWidth
    List outSourcedJobs
    String largeThumbUrl
    String tilesUrlPattern
    String license
    String dataResourceUid
    String squareThumbUrl
    Integer squareThumbSize
    Integer tileZoomLevels
    Integer width
    String originalFilename
    Date dateTaken
}
