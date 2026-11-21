import { describe, expect, it } from 'vitest';
import { binaryToText, caesarDecrypt, decodeBase64 } from '../shared/converters.js';

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
});
