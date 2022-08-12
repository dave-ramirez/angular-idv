
/**
 * Verify Server REQUEST DTO for "POST /verification/begin-session".
 */
export interface VerifyServerBeginSessionReqDTO {
  /**
   * List of steps part of one Verify Session (statefull session).
   */
  steps: string[];
}

/**
 * Verify Server RESPONSE DTO for "POST /verification/begin-session".
 */
export interface VerifyServerBeginSessionResDTO {
  /**
   * Verify session object.
   */
  vs: {
    /**
     * Verify session identifier.
     */
    id: string;
    /**
     * Verify session creation time in "ISO date string" format.
     */
    createdAt: string;
    /**
     * Verify session update time in "ISO date string" format.
     */
    updatedAt: string;
    /**
     * Verify session token.
     */
    token: string;
  };
}


/**
 * Verify Server RESPONSE DTO for "GET /facetec/session-token".
 */
export interface VerifyServerFacetecSessionResDTO {
  /**
   * Request processing exception occured.
   */
  error: boolean;
  /**
   * Request processing is a success.
   */
  success: boolean;
  /**
   * FaceTec session token.
   */
  sessionToken: string;
  /**
   * FaceTec device key identifier.
   */
  deviceKeyIdentifier: string;
  /**
   * FaceTec face scan encription key.
   */
  faceScanEncryptionKey: string;
  /**
   * FaceTec production key text.
   */
  productionKeyText: string;
}

/**
 * Verify Server REQUEST DTO for "POST /facetec/enrollment-3d".
 */
export interface VerifyServerFacetecEnrollment3dReqDTO {
  /**
   * As-is object from the FaceTecSessionResult object.
   */
  faceScan: string | null;
  /**
   * As-is object from the FaceTecSessionResult object.
   */
  auditTrailImage: string;
  /**
   * As-is object from the FaceTecSessionResult object.
   */
  lowQualityAuditTrailImage: string;
}

/**
 * Verify Server RESPONSE DTO for "POST /facetec/enrollment-3d".
 */
export interface VerifyServerFacetecEnrollment3dResDTO {
  /**
   * (to be populated)
   */
  error: boolean;
  /**
   * (to be populated)
   */
  success: boolean;
  /**
   * (to be populated)
   */
  externalDatabaseRefID: string;
  /**
   * (to be populated)
   */
  faceScanSecurityChecks: {
    /**
     * (to be populated)
     */
    auditTrailVerificationCheckSucceeded: boolean;
    /**
     * (to be populated)
     */
    faceScanLivenessCheckSucceeded: boolean;
    /**
     * (to be populated)
     */
    replayCheckSucceeded: boolean;
    /**
     * (to be populated)
     */
    sessionTokenCheckSucceeded: boolean;
  };
  /**
   * (to be populated)
   */
  retryScreenEnumInt: number;
  /**
   * (to be populated)
   */
  scanResultBlob: string;
  /**
   * (to be populated)
   */
  wasProcessed: true;
}

/**
 * Verify Server REQUEST DTO for "POST /verification".
 */
export interface VerifyServerVerificationReqDTO {
  /**
   * Original data result of a BlinkIDCombinedRecognizer work.
   */
  originalData: string;
  /**
   * Original data signature data.
   */
  originalDataSignature: {
    /**
     * Signature.
     */
    value: string;
    /**
     * Signature version.
     */
    version: string;
  }
  /**
   * Additionally inserted data.
   */
  insertedData: any;
  /**
   * Edited original data.
   */
  editedData: any;
}

export type VerificationResultDTO = 'VERIFIED' | 'NOT_VERIFIED' | 'NEEDS_REVIEW';

/**
 * Verify Server RESPONSE DTO for "POST /verification".
 */
export interface VerifyServerVerificationResDTO {
  /**
   * Word-written verification result summary.
   */
  summary: string;
  /**
   * Verification boolean result: succeeded or failed.
   */
  isPersonVerified: boolean;
  /**
   * Verification enum result.
   */
   verificationStatus: VerificationResultDTO;
  /**
   * Face match result data.
   */
  faceMatchData: {
    /**
     * Face match request processing exception occured.
     */
    error: boolean;
    /**
     * Face match request processing is a success.
     */
    success: boolean;
    /**
     * (to be populated)
     */
    externalDatabaseRefID: string;
    /**
     * (to be populated)
     */
    imageProcessingStatusEnumInt: number;
    /**
     * (to be populated)
     */
    matchLevel: number;
  };
  /**
   * (to be populated)
   */
  personData: any;
}

export type VerifyServerSaveScannedDocumentDTO = VerifyServerVerificationReqDTO;

export interface VerifyServerSaveLivenessImagesDTO {
  images: string[];
}

/* Internal helpers */

export interface BlinkIDCombinedRecognizerResultReqDTO {
  'Recognizer_v2::Result': {
    state: number;
  };
  firstName: string;
  lastName: string;
  fullName: string;
  additionalNameInformation: string;
  dateOfBirth: DateReqDTO;
  placeOfBirth: string;
  address: string;
  additionalAddressInformation: string;
  nationality: string;
  sex: string;
  race: string;
  maritalStatus: string;
  profession: string;
  religion: string;
  issuingAuthority: string;
  dateOfIssue: DateReqDTO;
  dateOfExpiry: DateReqDTO;
  dateOfExpiryPermanent: boolean;
  documentAdditionalNumber: string;
  documentNumber: string;
  documentOptionalAdditionalNumber: string;
  driverLicenseDetailedInfo: DriverLicenseDetailedInfoReqDTO; // HERE
  employer: string;
  localizedName: string;
  personalIdNumber: string;
  additionalPersonalIdNumber: string;
  processingStatus: number;
  recognitionMode: number;
  residentialStatus: string;
  scanningFirstSideDone: boolean;
  frontImageAnalysisResult: {
    barcodeDetectionStatus: number;
    blurred: boolean;
    documentImageColorStatus: number;
    documentImageMoireStatus: number;
    faceDetectionStatus: number;
    mrzDetectionStatus: number;
  };
  backImageAnalysisResult: {
    barcodeDetectionStatus: number;
    blurred: boolean;
    documentImageColorStatus: number;
    documentImageMoireStatus: number;
    faceDetectionStatus: number;
    mrzDetectionStatus: number;
  };
  dataMatch: number;
  frontViz: VizReqDTO;
  backViz: VizReqDTO;
  barcode: {
    additionalNameInformation: string;
    address: string;
    addressDetailedInfo: {
      city: string;
      jurisdiction: string;
      postalCode: string;
      street: string;
    };
    barcodeData: {
      barcodeFormat: number;
      dataIsUncertain: boolean;
      location: any[];
      rawBytes: any[];
      stringData: string;
    };
    dateOfBirth: DateReqDTO;
    dateOfExpiry: DateReqDTO;
    dateOfIssue: DateReqDTO;
    documentAdditionalNumber: string;
    documentNumber: string;
    driverLicenseDetailedInfo: DriverLicenseDetailedInfoReqDTO;
    employer: string;
    extendedElements: {
      elements: any[]
    };
    firstName: string;
    fullName: string;
    issuingAuthority: string;
    lastName: string;
    maritalStatus: string;
    middleName: string;
    nationality: string;
    personalIdNumber: string;
    placeOfBirth: string;
    profession: string;
    race: string;
    religion: string;
    residentialStatus: string;
    sex: string;
  };
  classInfo: {
    country: number;
    region: number;
    type: number;
  };
  /* Images */
  faceImage: {
    rawImage: Uint8Array;
    encodedImage: string;
  };
  fullDocumentFrontImage: {
    rawImage: Uint8Array;
    encodedImage: string;
  };
  fullDocumentBackImage: {
    rawImage: Uint8Array;
    encodedImage: string;
  };
  signatureImage: {
    rawImage: Uint8Array;
    encodedImage: string;
  };
  /* Machine Readable Zone */
  mrz: {
    alienNumber: string;
    applicationReceiptNumber: string;
    dateOfBirth: DateReqDTO;
    dateOfExpiry: DateReqDTO;
    documentCode: string;
    documentNumber: string;
    documentType: number;
    gender: string;
    immigrantCaseNumber: string;
    issuer: string;
    issuerName: string;
    nationality: string;
    nationalityName: string;
    opt1: string;
    opt2: string;
    parsed: boolean;
    primaryID: string;
    rawMRZString: string;
    secondaryID: string;
    verified: boolean;
  };
  /* Signature */
  digitalSignature: {
    version: number;
    signature: string;
  };
}

export interface DateReqDTO {
  day: number;
  month: number;
  originalString: string;
  successfullyParsed: boolean;
  year: number;
}

export interface DriverLicenseDetailedInfoReqDTO {
  conditions: string;
  endorsements: string;
  restrictions: string;
  vehicleClass: string;
}

export interface VizReqDTO {
  additionalAddressInformation: string;
  additionalNameInformation: string;
  additionalPersonalIdNumber: string;
  address: string;
  dateOfBirth: DateReqDTO;
  dateOfExpiry: DateReqDTO;
  dateOfExpiryPermanent: boolean;
  dateOfIssue: DateReqDTO;
  documentAdditionalNumber: string;
  documentNumber: string;
  documentOptionalAdditionalNumber: string;
  driverLicenseDetailedInfo: DriverLicenseDetailedInfoReqDTO;
  employer: string;
  firstName: string;
  fullName: string;
  issuingAuthority: string;
  lastName: string;
  localizedName: string;
  maritalStatus: string;
  nationality: string;
  personalIdNumber: string;
  placeOfBirth: string;
  profession: string;
  race: string;
  religion: string;
  residentialStatus: string;
  sex: string;
}

export interface VerifyServerUserAgent {
  identityVerification: {
    clientInstallationId: string;
    clientSdkVersion: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blinkId: any;
}
