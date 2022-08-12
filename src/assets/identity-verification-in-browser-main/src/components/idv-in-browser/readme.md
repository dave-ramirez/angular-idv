# verify-in-browser



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type                 | Default     |
| -------- | --------- | ----------- | -------------------- | ----------- |
| `config` | --        |             | `IdvInBrowserConfig` | `undefined` |


## Events

| Event                 | Description | Type                                                                                                                                                                                                                                                            |
| --------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `result`              |             | `CustomEvent<IdvInBrowserResult.ERROR \| IdvInBrowserResult.ERROR_BROWSER_SUPPORT \| IdvInBrowserResult.ERROR_CONFIG \| IdvInBrowserResult.ERROR_NETWORK \| IdvInBrowserResult.NEEDS_REVIEW \| IdvInBrowserResult.NOT_VERIFIED \| IdvInBrowserResult.VERIFIED>` |
| `session-initialized` |             | `CustomEvent<string>`                                                                                                                                                                                                                                           |


## Methods

### `restart() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [icon-loader](../icon-loader)
- [flow-manager](../flow-manager)

### Graph
```mermaid
graph TD;
  idv-in-browser --> icon-loader
  idv-in-browser --> flow-manager
  flow-manager --> step-docscan
  flow-manager --> step-liveness
  flow-manager --> button-close-top-right
  flow-manager --> flow-manager-progress-tracker
  flow-manager --> processing-layer
  flow-manager --> icon-fail-circle
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
  step-liveness --> facetec-liveness
  facetec-liveness --> button-icon-round
  facetec-liveness --> processing-layer
  facetec-liveness --> facetec-liveness-retry-layer
  facetec-liveness-retry-layer --> button-close-top-right
  facetec-liveness-retry-layer --> icon-fail-circle
  style idv-in-browser fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
