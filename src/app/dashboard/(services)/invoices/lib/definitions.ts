export interface FindManyVerificationsRequest {
  readonly cursorTake: number;
  readonly cursorCode?: string;
  readonly code?: string;
  readonly authorId?: string;
  readonly organizationId?: string;
}

export interface CreateManyVerificationsRequest {
  readonly key: string;
  readonly authorId: string;
  readonly organizationId: string;
}

export interface PostSendFilesToN8nRequest {
  readonly invoiceId: string;
  readonly invoiceNumber: string;
  readonly files: {
    readonly invoiceFile: File;
    readonly productPhotosFile?: File[];
    readonly extraInfoFile?: File[];
  }
}

export interface GenerateSignedGetUrlRequest {
  readonly key: string;
  readonly bucket: string;
}

export interface GenerateSignedGetUrlResponse {
  readonly url: string;
}

export interface GenerateSignedPutUrlRequest {
  readonly fileName: string;
  readonly folder?: string;
}

export interface GenerateSignedPutUrlResponse {
  readonly key: string;
  readonly contentType: string;
  readonly bucket: string;
  readonly url: string;
}

export interface GenerateReportResponse {
  readonly reportId: string;
  readonly expiresIn: string;
  readonly url: string;
}

export interface GenerateReportRequest {
  readonly authorId?: string;
  readonly organizationId?: string;
}

export interface IdentityVerification {
  readonly id: string;
  readonly provider: IdentityVerificationProvider;
  readonly [key: string]: unknown;
}

export interface KeynuaIdentityVerification extends IdentityVerification {
  readonly token: string;
}

export interface InvoiceInfo {
    readonly invoiceNumber?: string;
    readonly incoterms?: string;
    readonly acquisitionCountry?: string;
    readonly currency?: string;
    readonly deliveryPlace?: string;
};

export interface SupplierInfo {
    readonly affiliation?: string;
    readonly legalName?: string;
    readonly address?: string;
    readonly cityCountry?: string;
    readonly contactName?: string;
    readonly phoneNumber?: string;
    readonly condition?: string;
};

export interface TransactionInfo {
    readonly paymentMethod?: string;
    readonly bank?: string;
    readonly paymentChannel?: string;
    readonly receiptNumber?: string;
};

export interface LegalRepresentativeInfo {
    readonly fullName?: string;
    readonly position?: string;
    readonly nationalId?: string;
  };

export interface Invoice {
  readonly id: string;
  readonly invoiceCode: string;
  readonly state: string;
  readonly comment?: string;
  readonly page?: number;
  readonly totalPage?: number;
  readonly invoiceInfo?: InvoiceInfo
  readonly supplierInfo?: SupplierInfo
  readonly transactionInfo?: TransactionInfo
  readonly legalRepresentativeInfo?: LegalRepresentativeInfo
  readonly organizationId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}


export enum DocumentType {
  DNI = 'DNI',
}

export enum VerificationState {
  PENDING = 'PENDING',
  PROGRESS = 'PROGRESS',
  IDENTITY_VERIFICATION = 'IDENTITY_VERIFICATION',
  DONE = 'DONE',
  EXPIRED = 'EXPIRED',
  CANCELED = 'CANCELED',
}

export enum VerificationView {
  START = 'START',
  GPS_GEOLOCATION = 'GPS_GEOLOCATION',
  HOME_INFORMATION = 'HOME_INFORMATION',
  CAPTURE_IMAGES = 'CAPTURE_IMAGES',
  IDENTITY_VERIFICATION = 'IDENTITY_VERIFICATION',
  DASHBOARD = 'DASHBOARD',
  END = 'END',
}

export enum IdentityVerificationProvider {
  KEYNUA = 'KEYNUA',
  RENIEC = 'RENIEC',
}

export enum ImagesAlias {
  HOUSE_NUMBER_PHOTO = 'house_number_photo',
  HOUSE_FRONT_PHOTO = 'house_front_photo',
  UTILITY_BILL_PHOTO = 'utility_bill_photo',
  ID_CARD_FRONT_PHOTO = 'id_card_front_photo',
  ID_CARD_BACK_PHOTO = 'id_card_back_photo',
  SELFIE_PHOTO = 'selfie_photo',
  MAP_DISTANCE_IMAGE = 'map_distance_image',
}

export enum DocumentAlias {
  IDENTITY_PROOF_DOCUMENT = 'identity_proof_document',
  VERIFICATION_DOCUMENT = 'verification_document',
}

export enum Folders {
  DOCUMENTS = 'documents',
  IMAGES = 'images',
  EMPTY = '',
}

export type Coordinates = {
  lat: number;
  lng: number;
};

export type S3Object = {
  key: string;
  contentType: string;
  bucket: string;
  alias: string;
};
