# facetec-hidden



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute   | Description | Type                 | Default             |
| --------------------- | ----------- | ----------- | -------------------- | ------------------- |
| `config` _(required)_ | --          |             | `FaceLivenessConfig` | `undefined`         |
| `hasLobby`            | `has-lobby` |             | `boolean`            | `HAS_LOBBY_DEFAULT` |


## Methods

### `enroll(skipLobby?: boolean) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `reset() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [step-liveness](../step-liveness)

### Depends on

- [button-icon-round](../button-icon-round)
- [processing-layer](../processing-layer)
- [facetec-liveness-retry-layer](../facetec-liveness-retry-layer)

### Graph
```mermaid
graph TD;
  facetec-liveness --> button-icon-round
  facetec-liveness --> processing-layer
  facetec-liveness --> facetec-liveness-retry-layer
  processing-layer --> icon-loader
  facetec-liveness-retry-layer --> button-close-top-right
  facetec-liveness-retry-layer --> icon-fail-circle
  step-liveness --> facetec-liveness
  style facetec-liveness fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
