
export interface  FaceLivenessConfig {
  resourcesDirPath: string;
  callbacks: {
    onLoadDone?: () => void;
    onStart: () => void;
    onStartDone: () => void;
    onFinish: (data?: FaceTecLivenessFinishData) => void;
    onNetworkProblems: () => void;
  }
}

export interface FaceTecLivenessFinishData {
  success?: { faceTecUserImageBase64: string },
  error?: { message: string }
}
