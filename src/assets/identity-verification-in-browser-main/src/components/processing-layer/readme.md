# loading-layer



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute        | Description | Type     | Default                  |
| -------------- | ---------------- | ----------- | -------- | ------------------------ |
| `iconFontSize` | `icon-font-size` |             | `string` | `DEFAULT_ICON_FONT_SIZE` |
| `text`         | `text`           |             | `string` | `DEFUALT_TEXT`           |


## Dependencies

### Used by

 - [blinkid-docscan](../blinkid-docscan)
 - [facetec-liveness](../facetec-liveness)
 - [flow-manager](../flow-manager)

### Depends on

- [icon-loader](../icon-loader)

### Graph
```mermaid
graph TD;
  processing-layer --> icon-loader
  blinkid-docscan --> processing-layer
  facetec-liveness --> processing-layer
  flow-manager --> processing-layer
  style processing-layer fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
