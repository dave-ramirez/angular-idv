# step-blinkid



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute | Description                             | Type                  | Default     |
| --------------------- | --------- | --------------------------------------- | --------------------- | ----------- |
| `config` _(required)_ | --        | Prop()  Mandatory configuration object. | `StepComponentConfig` | `undefined` |


## Methods

### `didSucceed() => Promise<boolean>`

Method()

Checks if step's process finished successfully and a corresponding result data is saved.

#### Returns

Type: `Promise<boolean>`



### `getSuccessData() => Promise<any>`

Method()

Extracts step's sucess result data.

#### Returns

Type: `Promise<any>`



### `reset() => Promise<void>`

Method()

Resets step's state.

#### Returns

Type: `Promise<void>`



### `restart(skipLobby?: boolean) => Promise<void>`

Method()

Resets step's state and starts default process again.

#### Returns

Type: `Promise<void>`



### `start(skipLobby?: boolean) => Promise<void>`

Method()

Starts step's process.
Step is stateful:

A. If it's the first time it is being run then default process is being executed.

B. If it has been run before and it succeeded then step is started in a so-called review mode.

#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [flow-manager](../flow-manager)

### Depends on

- [blinkid-docscan](../blinkid-docscan)

### Graph
```mermaid
graph TD;
  step-docscan --> blinkid-docscan
  blinkid-docscan --> button-close-top-right
  blinkid-docscan --> blinkid-docscan-camera
  blinkid-docscan --> blinkid-docscan-image
  blinkid-docscan --> blinkid-docscan-result-layer
  blinkid-docscan --> processing-layer
  blinkid-docscan --> button-icon-round
  blinkid-docscan --> icon-fail-circle
  blinkid-docscan-image --> button-close-top-right
  blinkid-docscan-image --> icon-loader
  blinkid-docscan-result-layer --> button-close-top-right
  blinkid-docscan-result-layer --> editable-string-attribute
  processing-layer --> icon-loader
  flow-manager --> step-docscan
  style step-docscan fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
