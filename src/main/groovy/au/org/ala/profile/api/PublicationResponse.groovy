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
class PublicationResponse {
    Date uploadDate
    String publicationFileURL
    String description
    String title
    String uuid
    Date publicationDate
    Integer version
    String publicationURL
    String authors
    String doi
}
