import { prepareBrief } from './domain.js';
console.log(JSON.stringify(prepareBrief({ title: 'Convite para conhecer a Camaleão', brand: 'Agência Camaleão',
  kind: 'video', idea: 'Apresentar os serviços da agência em uma cena curta com chamada para conversar.',
  aspectRatio: '9:16', durationSeconds: 10, language: 'pt-BR' }), null, 2));
