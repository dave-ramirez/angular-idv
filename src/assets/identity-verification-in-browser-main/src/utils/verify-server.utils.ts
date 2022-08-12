import axios from 'axios';
import {
  VerifyServerBeginSessionReqDTO,
  VerifyServerBeginSessionResDTO,
  VerifyServerFacetecEnrollment3dReqDTO,
  VerifyServerFacetecEnrollment3dResDTO,
  VerifyServerFacetecSessionResDTO,
  VerifyServerSaveLivenessImagesDTO,
  VerifyServerSaveScannedDocumentDTO,
  VerifyServerVerificationResDTO
} from '../dto/verify-server.dto';
import environment from '../environment';

enum CustomHeader {
  ContentType = 'Content-Type',
  // custom-custom headers
  PlatformOrigin = 'X-Platform-Origin',
  IDVSessionToken = 'X-Identity-Verification-Verification-Session-Token',
  IDVUserAgent = 'X-Identity-Verification-User-Agent',
  FacetecUserAgent = 'X-FaceTec-User-Agent',
}

const CusHeaderValOpts = {
  [CustomHeader.ContentType]: {
    applicationJson: 'application/json'
  },
  [CustomHeader.PlatformOrigin]: {
    inBrowser: 'in-browser'
  }
};

export class VerifyServerApiClient {
  private static apiClientInternal: VerifyServerApiClientInternal;
  private static verifyServerSessionToken: string;
  private static verifyServerUserAgent: string;

  public static initialize(verifyServerBaseUrl: string): void {
    if (verifyServerBaseUrl == null) {
      return;
    }
    VerifyServerApiClient.apiClientInternal = new VerifyServerApiClientInternal(verifyServerBaseUrl);
  }

  public static setVerifyServerUserAgent(value: string): void {
    VerifyServerApiClient.verifyServerUserAgent = value;
  }

  public static async ping(): Promise<void> {
    if (!VerifyServerApiClient.apiClientInternal) {
      return;
    }

    await VerifyServerApiClient.apiClientInternal.ping();
  }

  public static async beginVerifySession(
    requestDTO: VerifyServerBeginSessionReqDTO
  ): Promise<VerifyServerBeginSessionResDTO> {
    if (!VerifyServerApiClient.apiClientInternal || !VerifyServerApiClient.verifyServerUserAgent) {
      return;
    }

    const response = await VerifyServerApiClient.apiClientInternal.beginVerifySession(
      requestDTO,
      VerifyServerApiClient.verifyServerUserAgent
    );

    // intercept and save needed
    const { token } = response.vs;
    VerifyServerApiClient.verifyServerSessionToken = token;

    return response;
  }

  public static async beginFacetecSession(): Promise<VerifyServerFacetecSessionResDTO> {
    if (!VerifyServerApiClient.apiClientInternal || !VerifyServerApiClient.verifyServerUserAgent) {
      return;
    }
    const response = await VerifyServerApiClient.apiClientInternal.beginFacetecSession(
      VerifyServerApiClient.verifyServerSessionToken,
      VerifyServerApiClient.verifyServerUserAgent
    );

    return response;
  }

  public static async enrollment3d(
    requestDTO: VerifyServerFacetecEnrollment3dReqDTO,
    facetecUserAgent: string,
  ): Promise<VerifyServerFacetecEnrollment3dResDTO> {
    if (!VerifyServerApiClient.apiClientInternal || !VerifyServerApiClient.verifyServerUserAgent) {
      return;
    }

    const response = await VerifyServerApiClient.apiClientInternal.enrollment3d(
      requestDTO,
      VerifyServerApiClient.verifyServerSessionToken,
      VerifyServerApiClient.verifyServerUserAgent,
      facetecUserAgent
    );

    return response;
  }

  public static async verification(): Promise<VerifyServerVerificationResDTO> {
    if (!VerifyServerApiClient.apiClientInternal || !VerifyServerApiClient.verifyServerUserAgent) {
      return;
    }

    const response = await VerifyServerApiClient.apiClientInternal.verification(
      VerifyServerApiClient.verifyServerSessionToken,
      VerifyServerApiClient.verifyServerUserAgent
    );

    return response;
  }

  public static async saveScannedDocument(requestDTO: VerifyServerSaveScannedDocumentDTO): Promise<void> {
    if (!VerifyServerApiClient.apiClientInternal || !VerifyServerApiClient.verifyServerUserAgent) {
      return;
    }

    const response = await VerifyServerApiClient.apiClientInternal.saveScannedDocument(
      requestDTO,
      VerifyServerApiClient.verifyServerSessionToken,
      VerifyServerApiClient.verifyServerUserAgent
    );

    return response;
  }

  public static async saveAdditionalLivenessImages(requestDTO: VerifyServerSaveLivenessImagesDTO): Promise<void> {
    if (!VerifyServerApiClient.apiClientInternal || !VerifyServerApiClient.verifyServerUserAgent) {
      return;
    }

    const response = await VerifyServerApiClient.apiClientInternal.saveAdditionalLivenessImages(
      requestDTO,
      VerifyServerApiClient.verifyServerSessionToken,
      VerifyServerApiClient.verifyServerUserAgent
    );

    return response;

  }
}

class VerifyServerApiClientInternal {
  private verifyServerBaseUrl: string;

  constructor(verifyServerBaseUrl: string) {
    this.verifyServerBaseUrl = verifyServerBaseUrl;
  }

  public async ping(): Promise<any> {
    const url = `${this.verifyServerBaseUrl}${environment.mb_verifyserver_path_ping}`;
    const response = await axios.get(url);
    return response.data;
  }

  public async beginVerifySession(
    requestDTO: VerifyServerBeginSessionReqDTO,
    verifyServerUserAgent: string,
  ): Promise<VerifyServerBeginSessionResDTO> {
    const url = `${this.verifyServerBaseUrl}${environment.mb_verifyserver_path_begin_session}`;

    const response = await axios.post(
      url,
      JSON.stringify(requestDTO),
      {
        headers: {
          [CustomHeader.ContentType]: CusHeaderValOpts[CustomHeader.ContentType].applicationJson,
          [CustomHeader.IDVUserAgent]: verifyServerUserAgent,
        }
      }
    );

    return response.data as VerifyServerBeginSessionResDTO;
  }

  public async beginFacetecSession(
    verifySessionToken: string,
    verifyServerUserAgent: string,
  ): Promise<VerifyServerFacetecSessionResDTO> {
    const url = `${this.verifyServerBaseUrl}${environment.mb_verifyserver_path_facetec_session}`;

    const response = await axios.get(
      url,
      {
        headers: {
          [CustomHeader.IDVSessionToken]: verifySessionToken,
          [CustomHeader.PlatformOrigin]: CusHeaderValOpts[CustomHeader.PlatformOrigin].inBrowser,
          [CustomHeader.IDVUserAgent]: verifyServerUserAgent,
        }
      }
    );

    return response.data as VerifyServerFacetecSessionResDTO;
  }

  public async enrollment3d(
    requestDTO: VerifyServerFacetecEnrollment3dReqDTO,
    verifySessionToken: string,
    verifyServerUserAgent: string,
    facetecUserAgent: string,
  ): Promise<VerifyServerFacetecEnrollment3dResDTO> {
    const url = `${this.verifyServerBaseUrl}${environment.mb_verifyserver_path_enrollment_3d}`;

    const response = await axios.post(
      url,
      JSON.stringify(requestDTO),
      {
        headers: {
          [CustomHeader.ContentType]: CusHeaderValOpts[CustomHeader.ContentType].applicationJson,
          [CustomHeader.IDVSessionToken]: verifySessionToken,
          [CustomHeader.IDVUserAgent]: verifyServerUserAgent,
          [CustomHeader.FacetecUserAgent]: facetecUserAgent,
        }
      }
    );

    return response.data as VerifyServerFacetecEnrollment3dResDTO;
  }

  public async verification(
    verifySessionToken: string,
    verifyServerUserAgent: string,
  ): Promise<VerifyServerVerificationResDTO> {
    const url = `${this.verifyServerBaseUrl}${environment.mb_verifyserver_path_verification}`;

    const response = await axios.post(
      url,
      null,
      {
        headers: {
          [CustomHeader.ContentType]: CusHeaderValOpts[CustomHeader.ContentType].applicationJson,
          [CustomHeader.IDVSessionToken]: verifySessionToken,
          [CustomHeader.IDVUserAgent]: verifyServerUserAgent,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );

    return response.data as VerifyServerVerificationResDTO;
  }

  public async saveScannedDocument(
    requestDTO: VerifyServerSaveScannedDocumentDTO,
    verifySessionToken: string,
    verifyServerUserAgent: string,
  ): Promise<void> {
    const url = `${this.verifyServerBaseUrl}${environment.mb_verifyserver_path_save_scanned_document}`;

    await axios.post(
      url,
      JSON.stringify(requestDTO),
      {
        headers: {
          [CustomHeader.ContentType]: CusHeaderValOpts[CustomHeader.ContentType].applicationJson,
          [CustomHeader.IDVSessionToken]: verifySessionToken,
          [CustomHeader.IDVUserAgent]: verifyServerUserAgent,
        }
      }
    );
  }

  public async saveAdditionalLivenessImages(
    requestDTO: VerifyServerSaveLivenessImagesDTO,
    verifySessionToken: string,
    verifyServerUserAgent: string,
  ): Promise<void> {
    const url = `${this.verifyServerBaseUrl}${environment.mb_verifyserver_path_save_liveness_images}`;

    await axios.post(
      url,
      JSON.stringify(requestDTO),
      {
        headers: {
          [CustomHeader.ContentType]: CusHeaderValOpts[CustomHeader.ContentType].applicationJson,
          [CustomHeader.IDVSessionToken]: verifySessionToken,
          [CustomHeader.IDVUserAgent]: verifyServerUserAgent,
        }
      }
    );
  }
}