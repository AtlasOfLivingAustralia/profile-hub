export interface Collection {
  brandingConfig: BrandingConfig;
  profileCount: number;
  allowFineGrainedAttribution: boolean;
  uuid: string;
  lastUpdated: number;
  enableOccurrenceUpload: boolean;
  contact: Contact;
  featureListSectionName?: string;
  enablePhyloUpload: boolean;
  keepImagesPrivate: boolean;
  hasAboutPage: boolean;
  accessToken?: string;
  autoDraftProfiles: boolean;
  authorities: Authority[];
  florulaListId: string;
  additionalStatuses: string[];
  tags: Tag[];
  authorshipVocabUuid: string;
  glossaryUuid: string;
  supportingOpuses: SupportingOpuse[];
  dataResourceUid: string;
  citationProfile?: string;
  shortName?: string;
  featureLists: string[];
  attributeVocabUuid: string;
  sharingDataWith: SharingDataWith[];
  attachments: Attachment[];
  footerText?: string;
  keybaseKeyId?: string;
  description?: string;
  title: string;
  requestedSupportingOpuses: RequestedSupportingOpuse[];
  autoApproveShareRequests: boolean;
  dateCreated: number;
  dataResourceConfig: DataResourceConfig;
  theme: Theme;
  approvedImageOption: string;
  masterListUid?: string;
  keybaseProjectId?: string;
  privateCollection: boolean;
  profileLayoutConfig: ProfileLayoutConfig;
  enableKeyUpload: boolean;
  mapConfig: MapConfig;
  approvedLists: string[];
  help: Help;
  showLinkedOpusAttributes: boolean;
  citationHtml?: string;
  opusLayoutConfig: OpusLayoutConfig;
  enableTaxaUpload: boolean;
  groupVocabUuid: string;
  allowCopyFromLinkedOpus: boolean;
  aboutHtml?: string;
  copyrightText?: string;
  usePrivateRecordData: boolean;
}

export interface BrandingConfig {
  colourTheme?: string;
  pdfLicense?: string;
  issn?: string;
  pdfBackBannerUrl?: string;
  shortLicense?: string;
  logos?: Logo[];
  opusBannerUrl?: string;
  profileBannerUrl?: string;
  pdfBannerUrl?: string;
  thumbnailUrl?: string;
}

export interface Logo {
  hyperlink?: string;
  logoUrl: string;
}

export interface Contact {
  twitter?: string;
  facebook?: string;
  email?: string;
}

export interface Authority {
  role: string;
  notes?: string;
  name: string;
  uuid?: string;
  userId: string;
}

export interface Tag {
  colour: string;
  name: string;
  abbrev: string;
  uuid: string;
}

export interface SupportingOpuse {
  title: string;
  uuid: string;
  requestStatus: string;
}

export interface SharingDataWith {
  title: string;
  uuid: string;
  requestStatus: string;
}

export interface Attachment {
  rightsHolder?: string;
  licence?: string;
  creator?: string;
  downloadUrl?: string;
  description?: string;
  title: string;
  uuid: string;
  url?: string;
  filename?: string;
  createdDate?: string;
  rights?: string;
  category?: string;
  contentType?: string;
  licenceIcon?: string;
}

export interface RequestedSupportingOpuse {
  title: string;
  uuid: string;
  requestStatus: string;
}

export interface DataResourceConfig {
  recordResourceOption: string;
  imageSources: string[];
  privateRecordSources: unknown[];
  recordSources: string[];
  imageResourceOption: string;
}

export interface Theme {
  mainTextColour?: string;
  footerBorderColour?: string;
  footerTextColour?: string;
  callToActionHoverColour?: string;
  headerTextColour?: string;
  mainBackgroundColour?: string;
  headerBorderColour?: string;
  callToActionTextColour?: string;
  callToActionColour?: string;
  footerBackgroundColour?: string;
}

export interface ProfileLayoutConfig {
  layout?: string;
}

export interface MapConfig {
  maxAutoZoom?: number;
  biocacheName?: string;
  mapBaseLayer?: string;
  mapDefaultLatitude?: number;
  biocacheUrl?: string;
  mapPointColour?: string;
  maxZoom?: number;
  autoZoom?: boolean;
  mapDefaultLongitude?: number;
  allowSnapshots?: boolean;
  mapZoom?: number;
  mapAttribution?: string;
}

export interface Help {
  identifyLink?: string;
  featureListsLink?: string;
  mapsLink?: string;
  aboutLink?: string;
  profileViewLink?: string;
  taxonomyLink?: string;
  browseLink?: string;
  reportsLink?: string;
  nomenclatureLink?: string;
  authorsAndAcknowledgementsLink?: string;
  imagesLink?: string;
  documentsLink?: string;
  profileEditLink?: string;
  bibliographyLink?: string;
  versionsLink?: string;
  searchLink?: string;
  opusLink?: string;
  linksLink?: string;
  nameMatchLink?: string;
  attributeLink?: string;
  specimensLink?: string;
  conservationSensitivityListsLink?: string;
  bHLReferenceLink?: string;
  filterLink?: string;
  glossaryLink?: string;
  commentsLink?: string;
}

export interface OpusLayoutConfig {
  duration: number;
  explanatoryText?: string;
  images: Image[];
  helpTextSearch?: string;
  helpTextBrowse?: string;
  helpTextIdentify?: string;
  helpTextFilter: string;
  bannerOverlayText?: string;
  updatesSection?: string;
  helpTextDocuments?: string;
}

export interface Image {
  imageUrl?: string;
  credit?: string;
}

export interface Glossary {
  uuid: string;
  items: GlossaryItem[];
}

export interface GlossaryItem {
  cf: null;
  description: string;
  term: string;
  uuid: string;
}

export type TaxonCounts = Record<string, number>;

export interface TaxonNameResult {
  scientificName: string;
  profileId: string;
  taxonomicOrder: number;
  name: string;
  guid: string;
  rank: string;
  childCount: number;
  opus: {
    title: string;
    shortName: string;
    uuid: string;
  };
}

export interface OpusAboutAdministrator {
  name: string;
  email?: string | null;
}

export interface OpusAboutDetails extends Collection {
  date?: string;
  year?: string;
  opusUrl?: string;
  genericCopyrightHtml?: string;
}

export interface OpusAboutResponse {
  opusId: string;
  opus: OpusAboutDetails;
  administrators: (OpusAboutAdministrator | null)[];
}

export interface CollectionStatistic {
  id: string;
  name: string;
  value: string | number;
  tooltip?: string;
  caveat?: string;
}

export interface ProfileJsonResponse {
  opus: Collection;
  profile: Profile;
  logos?: Logo[];
  bannerUrl?: string;
  pageTitle?: string;
}

export interface Profile {
  uuid: string;
  scientificName: string;
  nameAuthor?: string | null;
  fullName?: string | null;
  guid?: string | null;
  rank?: string | null;
  profileStatus?: string | null;
  privateMode?: boolean;
  archivedDate?: string | number | null;
  archiveComment?: string | null;
  archivedWithName?: string | null;
  matchedName?: MatchedName | null;
  classification?: ClassificationNode[];
  attributes?: ProfileAttribute[];
  authorship?: Authorship[];
  bibliography?: BibliographyEntry[];
  links?: ProfileLink[];
  bhl?: BhlLink[];
  attachments?: Attachment[];
  publications?: Publication[];
  primaryImage?: string | null;
  mapSnapshot?: string | null;
  occurrenceQuery?: string | null;
  nslNameIdentifier?: string | null;
  nslNomenclatureIdentifier?: string | null;
  nslProtologue?: string | null;
  nslUrl?: string | null;
  citationText?: string | null;
  lastPublished?: string | number | null;
  lastUpdated?: string | number | null;
  lastUpdatedBy?: string | null;
  createdDate?: string | number | null;
  profileSettings?: ProfileSettings | null;
  imageSettings?: ImageSetting[];
  primaryAudio?: string | null;
  primaryVideo?: string | null;
  specimenIds?: string[];
  opusId?: string;
  dataResourceUid?: string | null;
}

export interface MatchedName {
  scientificName?: string | null;
  nameAuthor?: string | null;
  fullName?: string | null;
  guid?: string | null;
}

export interface ClassificationNode {
  name: string;
  rank?: string | null;
  guid?: string | null;
  profileId?: string | null;
  profileName?: string | null;
  hasChildren?: boolean;
  childCount?: number | null;
}

export interface ProfileAttribute {
  uuid: string;
  title: string;
  text?: string | null;
  plainText?: string | null;
  summary?: boolean;
  source?: string | null;
  creators?: string[];
  editors?: string[];
  groupName?: string | null;
  order?: number | null;
  required?: boolean;
  containsName?: boolean;
}

export interface Authorship {
  category?: string | null;
  text?: string | null;
}

export interface BibliographyEntry {
  text?: string | null;
  order?: number | null;
}

export interface ProfileLink {
  uuid?: string;
  url?: string | null;
  title?: string | null;
  description?: string | null;
  doi?: string | null;
}

export interface BhlLink {
  uuid?: string;
  url?: string | null;
  title?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  fullTitle?: string | null;
  edition?: string | null;
  publisherName?: string | null;
  doi?: string | null;
}

export interface Publication {
  uuid: string;
  title?: string | null;
  version?: string | number | null;
  doi?: string | null;
  authors?: string | null;
  publicationDate?: string | number | null;
  publicationURL?: string | null;
}

export interface ProfileSettings {
  autoFormatProfileName?: boolean;
  formattedNameText?: string | null;
}

export interface ImageSetting {
  imageId: string;
  caption?: string | null;
  displayOption?: string | null;
}

export interface ProfileImage {
  imageId?: string;
  occurrenceId?: string | null;
  largeImageUrl?: string | null;
  thumbnailUrl?: string | null;
  dataResourceName?: string | null;
  caption?: string | null;
  primary?: boolean;
  excluded?: boolean;
  metadata?: {
    creator?: string | null;
    created?: string | null;
    rightsHolder?: string | null;
  } | null;
  type?: {
    name?: string | null;
  } | null;
}

export interface ProfileImagesResponse {
  images?: ProfileImage[];
  count?: number;
  availImagesCount?: number;
  primaryImage?: ProfileImage | null;
}
