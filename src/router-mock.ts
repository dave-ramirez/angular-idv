export const mockData = [
  {
    request: {
      op: 'LINKS_OP',
      method: 'POST',
    },
    response: {
      linksUteis: [
        {
          texto: 'Voxel Mobile',
          icone: 'icon-itaufonts_docs',
          url: 'https://voxel.cloud.ihf/mobile/docs',
        },
        {
          texto: 'Voxel Native Communication',
          icone: 'icon-itaufonts_full_docs',
          url: 'https://voxel.cloud.ihf/native-communication/docs/',
        },
      ],
    },
  },
  {
    request: {
      op: 'BALANCE_OP',
      method: 'POST',
      body: {
        agencia: '1234',
        conta: '123456',
      },
    },
    response: {
      saldo: 5685.51,
    },
  },
];
