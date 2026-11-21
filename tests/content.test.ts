import { describe, expect, it } from 'vitest';
import { finale, getExplanation, getFeedback, getHint, getStage, stageSummaries, validateAnswer } from '../server/content.js';

describe('strežniško preverjanje osmih stopenj', () => {
  const correct: [number, unknown][] = [
    [1, 'MOST'], [2, 'SOVA'], [3, { message: 'B', reasons: ['domain', 'link'] }],
    [4, 'A'], [5, '10:42'], [6, 'ucenec17'], [7, 'C'], [8, 'KLJUC'],
  ];

  it.each(correct)('sprejme pravilen odgovor stopnje %i', (id, answer) => {
    expect(validateAnswer(id, answer)).toBe(true);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8])('zavrne nepravilen odgovor in napačne tipe stopnje %i', (id) => {
    for (const invalid of ['narobe', '', null, undefined, 42, true, {}, [], ['A']]) {
      expect(validateAnswer(id, invalid)).toBe(false);
    }
  });

  it('prilagodi normalizacijo besednim kodam', () => {
    expect(validateAnswer(1, '  koda   je \n most  ')).toBe(true);
    expect(validateAnswer(1, '  most  ')).toBe(true);
    expect(validateAnswer(1, 'M O S T')).toBe(false);
    expect(validateAnswer(2, ' koda :  sova ')).toBe(true);
    expect(validateAnswer(2, 'KODA:SOVA')).toBe(true);
    expect(validateAnswer(2, ' sOvA ')).toBe(true);
    expect(validateAnswer(6, ' UceNec17  ')).toBe(true);
    expect(validateAnswer(8, '  kljuČ\n')).toBe(true);
    expect(validateAnswer(8, 'KL JUČ')).toBe(false);
  });

  it('uporablja stabilne izbirne identifikatorje in ne odstranjuje ločil gesel', () => {
    expect(validateAnswer(4, 'a')).toBe(false);
    expect(validateAnswer(4, 'B')).toBe(false);
    expect(validateAnswer(4, 'C')).toBe(false);
    expect(validateAnswer(4, 'Luna2009')).toBe(false);
    expect(getStage(4)?.choices?.map(({ label }) => label)).toEqual(['Luna2009!', 'Miza783?', 'vQ7#rT9!pL2']);
    expect(validateAnswer(7, 'A')).toBe(false);
    expect(validateAnswer(7, 'B')).toBe(false);
  });

  it('pogojuje phishing s sporočilom B in vsaj dvema različnima pravilnima razlogoma', () => {
    for (const answer of [
      { message: 'B', reasons: [] },
      { message: 'B', reasons: ['domain'] },
      { message: 'B', reasons: ['domain', 'domain'] },
      { message: 'A', reasons: ['domain', 'link'] },
      { message: 'C', reasons: ['domain', 'link'] },
      { message: 'B', reasons: ['domain', 'link', 'greeting'] },
      { message: 'B', reasons: ['domain', 'link', 'https'] },
      { message: 'B', reasons: ['domain', 'link', 1] },
      { message: 'B', reasons: ['domain', 'unknown'] },
      { message: 'B', reasons: 'domain,link' },
    ]) expect(validateAnswer(3, answer)).toBe(false);
    expect(validateAnswer(3, { message: 'B', reasons: ['urgency', 'credentials'] })).toBe(true);
    expect(validateAnswer(3, { message: 'B', reasons: ['domain', 'link', 'urgency', 'credentials'] })).toBe(true);
  });

  it('sprejme le izrecno dovoljene oblike časa nastanka, ne časa spremembe', () => {
    for (const value of ['10:42', '10.42', '10:42:17', ' 10:42 ']) expect(validateAnswer(5, value)).toBe(true);
    for (const value of ['11:15', '11:15:00', '10:42:00', '1042', '10 : 42', '010:42', '10.42.17']) {
      expect(validateAnswer(5, value)).toBe(false);
    }
    expect(getStage(5)?.metadata).toBe('FileName: hodnik.jpg\nDateTimeOriginal: 2026:11:20 10:42:17\nOffsetTimeOriginal: +01:00\nModifyDate: 2026:11:20 11:15:00');
  });

  it('ločuje uspešen prenos zaupne datoteke od zavrnjenega prenosa, ogleda in javne datoteke', () => {
    expect(validateAnswer(6, 'ucenec12')).toBe(false);
    expect(validateAnswer(6, 'ucenec08')).toBe(false);
    expect(validateAnswer(6, 'ucenec05')).toBe(false);
    const rows = getStage(6)?.logs;
    expect(rows).toHaveLength(7);
    expect(rows?.filter((row) => row.event === 'DOWNLOAD' && row.file === '/zaupno/nacrt.pdf' && row.result === 'SUCCESS'))
      .toEqual([{ time: '10:45:12', ip: '10.0.0.17', account: 'ucenec17', event: 'DOWNLOAD', file: '/zaupno/nacrt.pdf', result: 'SUCCESS' }]);
  });

  it('ne izmisli dodatne devete uganke', () => {
    expect(getStage(9)).toBeUndefined();
    expect(getStage(-1)).toBeUndefined();
    expect(validateAnswer(9, 'KLJUC')).toBe(false);
    expect(finale.title).toBe('Preiskava zaključena');
    expect(finale.topics).toHaveLength(8);
    expect(finale.discussion).toHaveLength(2);
    expect(finale.limitation).toContain('ne identitete osebe');
  });
});

describe('ločeno razkrivanje učne vsebine', () => {
  it('vrne javne povzetke brez rešitev in ohrani izvirno gradivo', () => {
    expect(stageSummaries).toHaveLength(8);
    for (const summary of stageSummaries) expect(Object.keys(summary).sort()).toEqual(['id', 'title', 'topic']);
    expect(getStage(1)?.evidence).toBe('NRGD MH PRVW');
    expect(getStage(2)?.evidence).toBe('S09EQTogU09WQQ==');
    expect(getStage(8)?.evidence).toBe('01001011 01001100 01001010 01010101 01000011');
    for (let id = 1; id <= 8; id++) {
      const stage = getStage(id);
      expect(stage).toBeDefined();
      expect(stage).not.toHaveProperty('correctAnswer');
      expect(stage).not.toHaveProperty('isCorrect');
      expect(stage).not.toHaveProperty('hints');
      expect(stage).not.toHaveProperty('explanation');
      expect(getHint(id, 1)).toBeTruthy();
      expect(getHint(id, 2)).toBeTruthy();
      expect(getExplanation(id)).toBeTruthy();
      expect(getFeedback(id)).toBeTruthy();
    }
  });

  it('vrne samostojno kopijo podatkov in zavrne neobstoječ namig', () => {
    const stage = getStage(1)!;
    stage.evidence = 'spremenjeno';
    expect(getStage(1)?.evidence).toBe('NRGD MH PRVW');
    expect(getHint(1, 0)).toBeUndefined();
    expect(getHint(1, 3)).toBeUndefined();
    expect(getHint(9, 1)).toBeUndefined();
  });
});
