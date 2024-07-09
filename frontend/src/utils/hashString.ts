/** Create a sha-256 hash from given string */
export const hashString = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(str));
  const hexString = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return hexString;
};
