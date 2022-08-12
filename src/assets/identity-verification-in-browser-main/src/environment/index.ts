import * as env from './env.json';

export interface IEnvironment {
  idv_default_resources_directory_path: string;
  idv_default_input_config_skip_unsupported_back: string;
  idv_default_input_config_dev_mode: string;

  mb_verifyserver_path_ping: string;
  mb_verifyserver_path_begin_session: string;
  mb_verifyserver_path_facetec_session: string;
  mb_verifyserver_path_enrollment_3d: string;
  mb_verifyserver_path_verification: string;
  mb_verifyserver_path_save_scanned_document: string;
  mb_verifyserver_path_save_liveness_images: string;
}

const environment = env as IEnvironment;

export default environment;
