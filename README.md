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

## Mock de solicitudes de enrutador

Este repositorio ya tiene una estructura simulada básica para solicitudes al enrutador.

En el archivo `src/router-mock.ts`, tenemos un archivo con una estructura clave-valor con una estructura *response* para cada *OP* registrado. Para personalizar la estructura simulada, solo edite este archivo con los retornos esperados, como se muestra a continuación, y reinicie el servidor de desarrollo.


```ts
export const mockData = [
  {
    request: {
      op: 'INITIAL_OP',
      method: 'POST',
    },
    response: {
      data: {...},
      links: [
        {
          rel: 'next',
          href: 'PROXIMA_OP'
        }
      ]
    },
  },
  {
    request: {
      op: 'PROXIMA_OP',
      method: 'POST',
    },
    response: {...},
  }
]
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