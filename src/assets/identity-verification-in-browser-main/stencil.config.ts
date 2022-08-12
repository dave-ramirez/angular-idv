import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'idv-in-browser-sdk-ui',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      copy: [
        {
          src: 'resources',
          dest: '../../resources'
        }
      ]
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [
        {
          src: 'resources',
          dest: 'dist/',
          keepDirStructure: true
        },
        {
          src: 'secret.js',
          dest: './',
          keepDirStructure: true
        }
      ]
    },
  ],
  globalStyle: 'src/global.css'
};
