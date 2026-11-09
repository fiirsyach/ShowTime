import nextVitals from 'eslint-config-next/core-web-vitals';

export default [
  { ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'] },
  ...nextVitals,
];
