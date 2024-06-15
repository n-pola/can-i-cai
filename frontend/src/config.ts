export const config = {
  api: {
    url: import.meta.env.VITE_BACKEND || 'http://localhost:3000',
  },
  localStorage: {
    prefix: 'cic',
  },
};
