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
  readonly files: {
    readonly invoiceFile: File;
    readonly productPhotosFile: File[];
    readonly extraInfoFile: File | null;
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

export interface Verification {
  readonly id: string;
  readonly code: string;
  readonly names: string;
  readonly paternalLastName: string;
  readonly maternalLastName: string;
  readonly documentType: DocumentType;
  readonly documentNumber: string;
  readonly streetAddress: string;
  readonly urbanization: string;
  readonly references: string;
  readonly district: string;
  readonly province: string;
  readonly region: string;
  readonly ubigeo: string;
  readonly phoneNumber: string;
  readonly email: string;
  readonly state: VerificationState;
  readonly view: VerificationView;
  readonly addressLatitude: number;
  readonly addressLongitude: number;
  readonly addressRef: string;
  readonly timeZone: string;
  readonly authorId: string;
  readonly organizationId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly expirationDate: string;
  readonly startedAt?: string;
  readonly openedAt?: string;
  readonly expirationFromOpenDate?: string;
  readonly termsAndConditions?: boolean;
  readonly gpsLatitude?: number;
  readonly gpsLongitude?: number;
  readonly propertyStatus?: number;
  readonly livesAtAddress?: number;
  readonly residenceType?: number;
  readonly residenceDuration?: number;
  readonly files: S3Object[];
  readonly identityVerification?: IdentityVerification;
  readonly identityVerificationStartedAt?: string;
  readonly identityVerificationFinishedAt?: string;
  readonly finishedAt?: string;
  readonly coordinateDistance?: number;
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
