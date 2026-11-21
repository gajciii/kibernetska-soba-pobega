/** Dešifriranje samo črk A–Z/a–z; ločila, presledki in drugi znaki ostanejo. */
export function caesarDecrypt(text: string, shift: number): string {
  if (!Number.isInteger(shift) || shift < 0 || shift > 25) {
    throw new Error('Premik mora biti celo število od 0 do 25.');
  }
  return text.replace(/[A-Za-z]/g, (letter) => {
    const base = letter >= 'a' ? 97 : 65;
    return String.fromCharCode(((letter.charCodeAt(0) - base - shift + 26) % 26) + base);
  });
}

/** Standardni Base64 z obveznim pravilnim dopolnilom; izhod je besedilo UTF-8. */
export function decodeBase64(text: string): string {
  const compact = text.replace(/\s/gu, '');
  if (!compact) throw new Error('Najprej vnesi zapis Base64.');
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(compact)) {
    throw new Error('Neveljaven zapis Base64. Preveri znake, dolžino in zaključne znake =.');
  }
  const bytes = atob(compact);
  // Zavrnemo tudi nekanoničen niz, ki ima nepravilne neuporabljene bite.
  if (btoa(bytes) !== compact) {
    throw new Error('Neveljaven zapis Base64. Preveri zadnjo skupino in dopolnilo =.');
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes, (character) => character.charCodeAt(0)));
  } catch {
    throw new Error('Zapis Base64 ne vsebuje veljavnega besedila UTF-8. Pripomoček je namenjen besedilu.');
  }
}

/** Vsaka osembitna skupina predstavlja en znak; skupine ločuje beli prostor. */
export function binaryToText(text: string): string {
  const value = text.trim();
  if (!value) throw new Error('Najprej vnesi osembitne skupine ničel in enic.');
  if (/[^01\s]/u.test(value)) {
    throw new Error('Binarni zapis lahko vsebuje samo ničle, enice in presledke ali nove vrstice.');
  }
  const groups = value.split(/\s+/u);
  if (groups.some((group) => group.length !== 8)) {
    throw new Error('Vsaka skupina mora imeti natanko osem bitov. Skupine loči s presledkom ali novo vrstico.');
  }
  return groups.map((group) => String.fromCharCode(Number.parseInt(group, 2))).join('');
}
