import {
    INativeRequest,
    NativeRouterMethod,
  } from '@voxel/native-communication';
  
  export class Signature implements INativeRequest {
  
    method: NativeRouterMethod = 'POST';
  
    op = 'target_from_OP';
  
    body = { };

    query = [];
  }
  