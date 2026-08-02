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
  licenceIcon: string;
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
