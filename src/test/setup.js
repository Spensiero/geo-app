import '@testing-library/jest-dom';

if (typeof global.fetch === 'undefined') {
  global.fetch = () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
}
