
export type StepTerminatingError = 'ERROR_LICENSE' | 'ERROR'

/**
 * Step component callbacks.
 */
export interface StepComponentCallbacks {
  /**
   * Invoked when step has loaded it's resources.
   * Step might not need to load anything and won't invoke this callback.
   */
  onLoadDone?: () => void;
  /**
   * Invoked at the very beginning of step's process.
   */
  onStart(): void;
  /**
   * Invoked at the moment when step has initialized and/or it's interface is ready
   * for an user to interact with.
   */
  onStartDone(): void;
  /**
   * Invoked when step has finished and succeeded.
   * @param successData (optional) Data collected as a result of a successful process.
   */
  onFinish(successData?: any): void;
  onTerminatingError: (error: StepTerminatingError) => void;
  /**
   * Invoked when step or it's subcomponents detect network problems.
   * Propagated to the root level because it is best to have a cantralized
   * network issues troubleshooting.
   */
  onNetworkProblems: () => void;
}

/**
 * Step component mandatory configuration.
 */
export interface StepComponentConfig {
  /**
   * Prop()
   * 
   * Determines whether component is rendered as hidden and is open on demand.
   */
  hasLobby?: boolean;
  /**
   * Step component callbacks.
   */
  callbacks: StepComponentCallbacks;
}

/**
 * StencilJS component interface for Identity Verification flow step.
 */
export interface StepComponent {
  /**
   * Prop()
   * 
   * Mandatory configuration object.
   */
  config: StepComponentConfig;
  /**
   * Method()
   * 
   * Starts step's process.
   * Step is stateful:
   * 
   * A. If it's the first time it is being run then default process is being executed.
   * 
   * B. If it has been run before and it succeeded then step is started in a so-called review mode.
   */
  start(skipLobby?: boolean): Promise<void>;
  /**
   * Method()
   * 
   * Resets step's state and starts default process again.
   */
  restart(skipLobby?: boolean): Promise<void>;
  /**
   * Method()
   * 
   * Resets step's state.
   */
  reset(): Promise<void>;
  /**
   * Method()
   * 
   * Checks if step's process finished successfully and a corresponding result data is saved.
   */
  didSucceed(): Promise<boolean>;
  /**
   * Method()
   * 
   * Extracts step's sucess result data.
   */
  getSuccessData(): Promise<any>;
}