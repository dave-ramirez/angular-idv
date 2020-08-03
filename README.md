# Paso 1 - Quickstart Voxel Mobile

Este es un proyecto básico para comenzar el desarrollo de una aplicación angular utilizando el sistema de diseño Voxel para el entorno móvil de Itaú.

## Paso 2 - Configuracion de .npmrc

*Previo a la instalacion de las dependencias necesarias para levantar el proyecto es necesario configurar el archivo .npmrc*

Para la configuracion inicial se debe ubicar el archivo `.npmrc` con el comando `npm config ls -l` y se ingresa hasta el directorio correspondiente.
Se debe editar el archivo y se debe agregar los siguientes registry´s y desactivar la autenticacion SSL.

`strict-ssl=false` <-- Comando para desactivar la autenticacion SSL

`#registry=https://registry.npmjs.org/` <-- Dominio para descargar dependencias generales de Angular y Nodejs.

`#registry=https://depdes.artifactory.prod.cloud.ihf/artifactory/api/npm/npm-devel` <-- Dominio para descargar dependencias Voxel y propias de Itau.

## Paso 3 - Cómo usar este quickstart

1. Clonar el repositorio.
2. Borrar el archivo `package-lock.json` si es que se encuentra dentro del proyecto.
3. Abrir el archivo `package.json` y borrar momentaneamente las dependencias `Voxel`.
4. Ejecutar el comando `npm install` con el registry apuntado a `https://registry.npmjs.org/`.
5. Terminada la instalacion correspondiente volver a agregar las dependencias `Voxel` removidas en el paso 3.
6. Una vez terminado de agregar las dependencias `Voxel` ejecutar el comando `package.json` con el registry apuntando a `https://depdes.artifactory.prod.cloud.ihf/artifactory/api/npm/npm-devel`.

## Metodo para llamada a servicios

## Paso 1: 
Las peticiones `routerRequest` de la clase `VoxelNativeCommunicationService` espera una interface del tipo `INativeRequest`.
Para pasarle los parametros al routerRequest creamos una clase `Signature` que implementa la interface necesaria. Ej:
```ts
    export class Signature implements INativeRequest {
  
    method: NativeRouterMethod = 'POST';
  
    op = 'target_from_OP';
  
    body = { };

    query = [ ];
  }
 ``` 

 `method:NativeRouter = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'` es un Type de clase `VoxelNativeCommunicationService`

 `op` es el identificador del servicio a llamar, en este caso se utiliza el `target` y no la op propiamente.

 `body` es el cuerpo de la peticion. Opcional en algunos casos, dependiendo del servicio.
 
 `query` son los parametros de la peticion. Opcional en algunos casos, dependiendo del servicio.

 ## Paso 2:
 En el servicio `VoxelNativeCommunicatorService` creamos un metodo que contenga como parametro la clase anteriormente creada `Signature` que tiene como interface `INativeRequest`:
 ```ts
   metodo(params: INativeRequest, _?: HttpHeaders): Observable<any> {
      return this.voxelNative.routerRequest(params);
    }
 ``` 
 ## Paso 3:
 Desde el componente debemos invocar al metodo del `VoxelNativeCommunicatorService`, teniendo en cuenta que el metodo del servicio es un Observable. Para imprimir en el componente debemos de suscribirnos a ese evento. Ej:

```ts
    this.voxelNative.metodo(new Signature()).subscribe(res => {
      this.example = res;
    });
 ``` 

## Comandos principales para el desarrollo

Este repositorio se ha configurado previamente con varios comandos:

Instalar dependências:

- `npm install`

Ejecute la aplicación:

- `npm start`

Ejecute las pruebas unitarias:

- `prueba npm`

Ejecute pruebas para la práctica de TDD:

- `npm ejecutar tdd`

Pruebas de unidad de depuración, disponibles en `chrome: // inspect`:

- `npm run test: debug`

Compruebe la estandarización del código:

- `npm run lint`

Herramienta de ayuda de creación de commit (ver tema a continuación):

- `npm run commit`

Generación de documentación de la aplicación:

- `npm run docs`