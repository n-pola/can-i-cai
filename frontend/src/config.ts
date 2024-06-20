const backupUrl = import.meta.env.PROD ? '@@BACKEND_URL@@' : 'http://localhost:3000';

export const config = {
  api: {
    url: import.meta.env.VITE_BACKEND || backupUrl,
  },
  localStorage: {
    prefix: 'cic',
  },
};
