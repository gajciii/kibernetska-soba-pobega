import { describe, expect, it } from 'vitest';
import {
  binaryToText, caesarDecrypt, convertText, decimalToText, decodeBase64, decodeUrlText,
  encodeBase64, encodeUrlText, hexToText, textToBinary, textToDecimal, textToHex,
} from '../shared/converters.js';
import type { ConversionDirection, EncodingMethod } from '../shared/converters.js';

describe('Cezarjeva šifra', () => {
  it('dešifrira obvezno gradivo', () => {
    expect(caesarDecrypt('NRGD MH PRVW', 3)).toBe('KODA JE MOST');
  });
  it('pretvori drug vnos z ovijanjem abecede ter ohrani ločila in male črke', () => {
    expect(caesarDecrypt('Khoor, Zruog! 123', 3)).toBe('Hello, World! 123');
    expect(caesarDecrypt('ABC xyz\nČŠŽ', 3)).toBe('XYZ uvw\nČŠŽ');
    expect(caesarDecrypt('Abc!?', 0)).toBe('Abc!?');
    expect(caesarDecrypt('AZ az', 25)).toBe('BA ba');
  });
  it.each([-1, 26, 1.5, NaN, Infinity])('zavrne neveljaven premik %s', (shift) => {
    expect(() => caesarDecrypt('ABC', shift)).toThrow('od 0 do 25');
  });
});

describe('Base64', () => {
  it('dekodira obvezni zapis', () => {
    expect(decodeBase64('S09EQTogU09WQQ==')).toBe('KODA: SOVA');
  });
  it('dekodira drug vnos, UTF-8 in prelome vrstic', () => {
    expect(decodeBase64('SGVsbG8sIHdvcmxkIQ==')).toBe('Hello, world!');
    expect(decodeBase64('xI3FocW+')).toBe('čšž');
    expect(decodeBase64(' U09W\nQQ== ')).toBe('SOVA');
    expect(decodeBase64('QUJD')).toBe('ABC');
  });
  it('ohrani HTML kot navadno izhodno besedilo', () => {
    expect(decodeBase64('PHNjcmlwdD54PC9zY3JpcHQ+')).toBe('<script>x</script>');
  });
  it.each(['', '  ', '???', 'SGVsbG8', 'QQ=', 'QQ===', 'Q===', 'A', '====', 'QR==', 'QQ==QQ=='])('zavrne neveljaven zapis %s', (value) => {
    expect(() => decodeBase64(value)).toThrow(/Base64/u);
  });
  it('pojasni, da neveljavni bajti UTF-8 niso besedilo', () => {
    expect(() => decodeBase64('/w==')).toThrow('veljavnega besedila UTF-8');
  });
  it('kodira besedilo v standardni Base64 z ustreznim dopolnilom', () => {
    expect(encodeBase64('A')).toBe('QQ==');
    expect(encodeBase64('AB')).toBe('QUI=');
    expect(encodeBase64('ABC')).toBe('QUJD');
    expect(encodeBase64('čšž')).toBe('xI3FocW+');
  });
});

describe('binarni zapis', () => {
  it('pretvori obvezne skupine', () => {
    expect(binaryToText('01001011 01001100 01001010 01010101 01000011')).toBe('KLJUC');
  });
  it('pretvori drug vnos, presledke, nove vrstice in ločila', () => {
    expect(binaryToText(' 01000001\n01000010\t01000011 ')).toBe('ABC');
    expect(binaryToText('01001000 01101001 00100000 00100001')).toBe('Hi !');
  });
  it.each(['2', '0100000x', '01000001,01000010'])('zavrne druge znake: %s', (value) => {
    expect(() => binaryToText(value)).toThrow('samo ničle, enice');
  });
  it.each(['0100001', '010000001', '0100000101000010', '01000001 0'])('zavrne skupino napačne dolžine: %s', (value) => {
    expect(() => binaryToText(value)).toThrow('natanko osem bitov');
  });
  it('zahteva vnos', () => {
    expect(() => binaryToText(' \n ')).toThrow('Najprej vnesi');
  });
  it('uporablja bajte UTF-8 tudi za večbajtne znake', () => {
    expect(textToBinary('č')).toBe('11000100 10001101');
    expect(binaryToText('11000100 10001101')).toBe('č');
    expect(textToBinary('A!')).toBe('01000001 00100001');
  });
  it.each(['11111111', '11000100', '11000000 10000000', '10000000'])('zavrne napačno zaporedje UTF-8: %s', (input) => {
    expect(() => binaryToText(input)).toThrow('veljavnega besedila UTF-8');
  });
});

describe('šestnajstiški zapis HEX', () => {
  it('bere strnjene pare ter z belim prostorom ločene bajte ne glede na velikost črk', () => {
    expect(hexToText('414243')).toBe('ABC');
    expect(hexToText(' 41\n42\t43 ')).toBe('ABC');
    expect(hexToText('c4 8D')).toBe('č');
    expect(textToHex('č!')).toBe('C4 8D 21');
  });
  it.each(['', '  ', '0x41', '4G', '41,42', '4 1', '414', '41 4142', '41 4'])('zavrne neveljavne HEX bajte: %s', (input) => {
    expect(() => hexToText(input)).toThrow(/HEX/u);
  });
  it.each(['FF', 'C4', 'C0 80', 'ED A0 80'])('zavrne neveljavno UTF-8 vsebino: %s', (input) => {
    expect(() => hexToText(input)).toThrow('veljavnega besedila UTF-8');
  });
});

describe('odstotkovno kodiranje URL', () => {
  it('kodira in dekodira URL-komponento z Unicode in rezerviranimi znaki', () => {
    expect(encodeUrlText('A+B /č?')).toBe('A%2BB%20%2F%C4%8D%3F');
    expect(decodeUrlText('A%2bB%20%2f%c4%8d%3f')).toBe('A+B /č?');
    expect(decodeUrlText('a+b')).toBe('a+b');
    expect(decodeUrlText('http%3A%2F%2Fmost.si%2Fucilnica')).toBe('http://most.si/ucilnica');
  });
  it('presledkov in običajnega besedila ob dekodiranju ne odstrani', () => {
    expect(decodeUrlText('  primer č  ')).toBe('  primer č  ');
  });
  it.each(['%', '%2', '%GG', '%2G', '%20%'])('zahteva veljavni dve HEX števki za vsakim odstotkom: %s', (input) => {
    expect(() => decodeUrlText(input)).toThrow('Za vsakim znakom %');
  });
  it.each(['%FF', '%C4', '%C0%80', '%ED%A0%80'])('zavrne neveljavne kodirane bajte UTF-8: %s', (input) => {
    expect(() => decodeUrlText(input)).toThrow('veljavnega besedila UTF-8');
  });
  it('zahteva vnos za dekodiranje', () => { expect(() => decodeUrlText('')).toThrow('Najprej vnesita'); });
});

describe('decimalni bajti', () => {
  it('pretvarja posamezne bajte in večbajtne znake UTF-8', () => {
    expect(decimalToText(' 65\n66\t67 ')).toBe('ABC');
    expect(decimalToText('065 066')).toBe('AB');
    expect(textToDecimal('č!')).toBe('196 141 33');
    expect(decimalToText('196 141 33')).toBe('č!');
  });
  it.each(['', '  ', '256', '-1', '1.5', '+65', '65,66', '65x', '1e2', '0x41', '0000', 'Infinity'])('zavrne neveljaven decimalni bajt: %s', (input) => {
    expect(() => decimalToText(input)).toThrow(/[Bb]ajt/u);
  });
  it.each(['255', '196', '192 128', '237 160 128'])('zavrne neveljavno zaporedje UTF-8: %s', (input) => {
    expect(() => decimalToText(input)).toThrow('veljavnega besedila UTF-8');
  });
});

describe('skupni pretvornik in več korakov', () => {
  const methods: EncodingMethod[] = ['base64', 'hex', 'binary', 'url', 'decimal'];
  it.each(methods)('%s ohrani UTF-8, presledke, nove vrstice, emoji in HTML kot besedilo', (method) => {
    for (const original of ['Živjo, čšž! 🔎\n', '  A B\tC  ', '<b>primer</b>', '\uFEFFzačetek', '\u0000\u007F']) {
      const encoded = convertText(original, method, 'encode');
      expect(convertText(encoded, method, 'decode')).toBe(original);
    }
  });
  it('izvede uporabniško izbrano zaporedje pretvorb brez prepoznavanja formata', () => {
    const original = 'Pozdrav, ž!';
    const base64 = convertText(original, 'base64', 'encode');
    const hex = convertText(base64, 'hex', 'encode');
    const firstResult = convertText(hex, 'hex', 'decode');
    expect(firstResult).toBe(base64);
    expect(convertText(firstResult, 'base64', 'decode')).toBe(original);
  });
  it.each(methods)('%s zavrne prazen vnos pri kodiranju', (method) => {
    expect(() => convertText('', method, 'encode')).toThrow('Najprej vnesita');
  });
  it.each(methods)('%s ne zamenja neveljavnih osamljenih nadomestnih znakov z drugim znakom', (method) => {
    expect(() => convertText('\uD800', method, 'encode')).toThrow('Unicode');
    expect(() => convertText('\uDC00', method, 'encode')).toThrow('Unicode');
  });
  it('zavrne neveljavno smer in neznan format', () => {
    expect(() => convertText('A', 'base64', 'other' as ConversionDirection)).toThrow('smer pretvorbe');
    expect(() => convertText('A', '__proto__' as EncodingMethod, 'decode')).toThrow('podprto kodiranje');
  });
});
