async function detectHairType(imageBase64) {
  const key = process.env.REACT_APP_OPENAI_KEY;
  if (!key) {
    // Return mocked result when key is not present (local dev)
    return 'Curly';
  }

  // Real implementation left as an exercise - placeholder returns 'Curly'
  return 'Curly';
}

export { detectHairType };
const api = { detectHairType };
export default api;
