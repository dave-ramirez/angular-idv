import { VNode } from '@stencil/core';
import { StepComponent } from './shared';
import { IDVStepName } from './shared';

export type FlowManagerStepStatus = 'current' | 'past' | 'future';

export interface FlowManagerStepLabelsCreate {
  text: string;
  subText: string;
  checkpoint: Record<FlowManagerStepStatus, { text: string, subText: string }>;
}

export interface FlowManagerStepLabels {
  text: string;
  subText: string;
  checkpoint: { text: string, subText: string };
}

export class FlowManagerStep {
  public readonly index: number;
  public readonly name: IDVStepName;
  public readonly labels: FlowManagerStepLabelsCreate;
  public readonly componentJSX: VNode;
  public readonly retries = 1
  public status: FlowManagerStepStatus;
  public remainingRetries: number;
  public component: StepComponent;
  private successData: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  //
  private readonly needsLoading: boolean;
  private needsLoadingAndLoaded: boolean;

  constructor(
    index: number,
    name: IDVStepName,
    labels: FlowManagerStepLabelsCreate,
    componentJSX: VNode,
    optional?: {
      retries?: number;
      needsLoading?: boolean;
    }
  ) {
    this.index = index;
    this.name = name;
    this.labels = labels;
    this.componentJSX = componentJSX;
    this.status = index === 0 ? 'current' : 'future'; // right one
    // this.status = index === 0 ? 'past' : 'current';
    this.remainingRetries = 1;
    if (optional && optional.retries) {
      this.remainingRetries = optional.retries;
    }
    //
    this.needsLoading = false;
    this.needsLoadingAndLoaded = false;
    if(optional && optional.needsLoading) {
      this.needsLoading = optional.needsLoading;
    }
  }

  public async start(): Promise<void> {
    if (!this.component) { return; }
    await this.component.start();
  }

  public setAsPast(): void {
    this.status = 'past';
  }

  public setAsCurrent(): void {
    this.status = 'current';
  }

  public setAsFuture(): void {
    this.status = 'future';
  }

  public markRetry(): boolean {
    if (this.remainingRetries === 0) { return false; }

    this.remainingRetries--;
    return true;
  }

  public setComponent(ref: StepComponent): void {
    this.component = ref;
  }

  public setSuccessData(data: any): void {
    this.successData = data;
  }

  public clearSuccessData(): void {
    this.successData = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getSuccessData(): any {
    return this.successData;
  }

  public setAsLoaded(): void {
    if (!this.needsLoading) { return; }
    this.needsLoadingAndLoaded = true;
  }

  public isLoaded(): boolean {
    if (!this.needsLoading) { return true; }
    return this.needsLoadingAndLoaded;
  }

  public getCheckpointLabels(): { text: string, subText: string; } {
    return this.labels.checkpoint[this.status];
  }
}

export class FlowManager {
  public steps: FlowManagerStep[];
  private lastStepIndex: number;
  private currentStepIndex: number;
  private endReached: boolean;

  constructor() {
    this.lastStepIndex = -1;
    this.currentStepIndex = 0;
    this.steps = [];
    this.endReached = false;
  }

  public addStep(
    name: IDVStepName,
    labels: FlowManagerStepLabelsCreate,
    component: VNode,
    optional?: {
      retries?: number;
      needsLoading?: boolean;
    }
  ): void {
    this.lastStepIndex++;
    const newStep = new FlowManagerStep(
      this.lastStepIndex,
      name,
      labels,
      component,
      optional
    );
    this.steps.push(newStep);
  }

  public stepsLoaded(): boolean {
    if (this.steps.length === 0) { return false; }

    let allLoaded = true;
    for(const step of this.steps) {
      allLoaded = allLoaded && step.isLoaded();
    }

    return allLoaded;
  }

  public async startCurrentStep(skipLobby?: boolean): Promise<void> {
    if (this.currentStepIndex > this.lastStepIndex) { return; }

    const { component } = this.steps[this.currentStepIndex];

    await component.start(skipLobby);
  }

  public async next(currentStepSuccessData?: any): Promise<boolean> {
    if (this.currentStepIndex > this.lastStepIndex) { return false; }

    const currentStep = this.steps[this.currentStepIndex];

    const currentDidSucceed = await currentStep.component.didSucceed();
    if (!currentDidSucceed) { return false; }

    this.steps[this.currentStepIndex].setSuccessData(currentStepSuccessData);

    currentStep.setAsPast();
    this.currentStepIndex++;

    if (this.currentStepIndex <= this.lastStepIndex) {
      const newCurrentStep = this.steps[this.currentStepIndex];
      newCurrentStep.setAsCurrent();
    }

    if (this.currentStepIndex > this.lastStepIndex) { this.endReached = true; }
  }

  public isEndReached(): boolean {
    return this.endReached;
  }

  public async reset(): Promise<void> {
    async function resetOneStep(step: FlowManagerStep, index: number): Promise<void> {
      if (index === 0) {
        step.setAsCurrent();
      } else {
        step.setAsFuture();
      }

      step.clearSuccessData();
      await step.component.reset();
    }

    // reset all steps in parallel
    await Promise.all(this.steps.map((step, index) => resetOneStep(step, index)));

    this.currentStepIndex = 0;
    this.lastStepIndex = this.steps.length - 1;
    this.endReached = false;
  }

  public getStepLabels(index: number): FlowManagerStepLabels {
    const step = this.steps[index];
    if (step == null) { return null; }

    return {
      text: step.labels.text,
      subText: step.labels.subText,
      checkpoint: step.getCheckpointLabels()
    };
  }

  public getCurrentStepLabels(): FlowManagerStepLabels {
    if (this.currentStepIndex > this.lastStepIndex) { return null; }

    return this.getStepLabels(this.currentStepIndex);
  }

  public getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }
}