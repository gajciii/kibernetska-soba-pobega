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

export type EncodingMethod = 'base64' | 'hex' | 'binary' | 'url' | 'decimal';
export type ConversionDirection = 'decode' | 'encode';

function assertUnicode(text: string): void {
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw new Error('Besedilo vsebuje neveljaven znak Unicode. Preveri kopirani vnos.');
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new Error('Besedilo vsebuje neveljaven znak Unicode. Preveri kopirani vnos.');
    }
  }
}

function textBytes(text: string): Uint8Array {
  if (!text.length) throw new Error('Najprej vnesi besedilo za kodiranje.');
  assertUnicode(text);
  return new TextEncoder().encode(text);
}

function decodeBytes(bytes: Uint8Array, method: string): string {
  try {
    // BOM je del podatkov, zato se pri povratni pretvorbi ne izgubi.
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    throw new Error(`${method} ne vsebuje veljavnega besedila UTF-8. Preveri zaporedje bajtov; pripomoček je namenjen besedilu.`);
  }
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
  return decodeBytes(Uint8Array.from(bytes, (character) => character.charCodeAt(0)), 'Zapis Base64');
}

export function encodeBase64(text: string): string {
  return btoa(Array.from(textBytes(text), (byte) => String.fromCharCode(byte)).join(''));
}

/** Osembitne skupine predstavljajo bajte UTF-8; pri ASCII je bajt en znak. */
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
  return decodeBytes(Uint8Array.from(groups, (group) => Number.parseInt(group, 2)), 'Binarni zapis');
}

export function textToBinary(text: string): string {
  return Array.from(textBytes(text), (byte) => byte.toString(2).padStart(8, '0')).join(' ');
}

/** HEX sprejme neprekinjen niz parov ali pare, ločene z belim prostorom. */
export function hexToText(text: string): string {
  const value = text.trim();
  if (!value) throw new Error('Najprej vnesi zapis HEX.');
  if (/[^0-9a-f\s]/iu.test(value)) throw new Error('Zapis HEX lahko vsebuje samo števke 0–9 in črke A–F. Pare lahko ločiš s presledki; predpone 0x ne dodajaj.');
  const groups = /\s/u.test(value) ? value.split(/\s+/u) : value.match(/.{1,2}/gu)!;
  if (groups.some((group) => group.length !== 2)) throw new Error('Vsak bajt HEX potrebuje natanko dva znaka. Uporabi pare, ločene s presledki, ali neprekinjen niz celih parov.');
  return decodeBytes(Uint8Array.from(groups, (group) => Number.parseInt(group, 16)), 'Zapis HEX');
}

export function textToHex(text: string): string {
  return Array.from(textBytes(text), (byte) => byte.toString(16).padStart(2, '0').toUpperCase()).join(' ');
}

/** URL-komponenta: plus ostane plus; presledek kodiramo kot %20. */
export function decodeUrlText(text: string): string {
  if (!text.length) throw new Error('Najprej vnesi zapis z odstotkovnim kodiranjem URL.');
  assertUnicode(text);
  if (/%(?![0-9a-f]{2})/iu.test(text)) throw new Error('Za vsakim znakom % morata biti natanko dve šestnajstiški števki, na primer %20.');
  try {
    return decodeURIComponent(text);
  } catch {
    throw new Error('Zapis URL ne vsebuje veljavnega besedila UTF-8. Preveri zaporedje odstotkovno zapisanih bajtov.');
  }
}

export function encodeUrlText(text: string): string {
  textBytes(text);
  return encodeURIComponent(text);
}

export function decimalToText(text: string): string {
  const value = text.trim();
  if (!value) throw new Error('Najprej vnesi decimalne bajte, ločene s presledki.');
  const groups = value.split(/\s+/u);
  if (groups.some((group) => !/^\d{1,3}$/u.test(group) || Number(group) > 255)) {
    throw new Error('Vsak decimalni bajt mora biti celo število od 0 do 255. Števila loči s presledki ali novimi vrsticami.');
  }
  return decodeBytes(Uint8Array.from(groups, Number), 'Decimalni zapis');
}

export function textToDecimal(text: string): string {
  return Array.from(textBytes(text), String).join(' ');
}

/** Ena pretvorba brez samodejnega prepoznavanja ali reševanja učnih nalog. */
export function convertText(text: string, method: EncodingMethod, direction: ConversionDirection): string {
  if (direction !== 'encode' && direction !== 'decode') throw new Error('Izberi smer pretvorbe.');
  const conversions: Record<EncodingMethod, { encode: (input: string) => string; decode: (input: string) => string }> = {
    base64: { encode: encodeBase64, decode: decodeBase64 },
    hex: { encode: textToHex, decode: hexToText },
    binary: { encode: textToBinary, decode: binaryToText },
    url: { encode: encodeUrlText, decode: decodeUrlText },
    decimal: { encode: textToDecimal, decode: decimalToText },
  };
  if (!Object.hasOwn(conversions, method)) throw new Error('Izberi podprto kodiranje.');
  const conversion = conversions[method];
  return conversion[direction](text);
}
