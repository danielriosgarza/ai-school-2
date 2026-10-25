// Tests of where registration stands (`registrationState` in src/content/edition.ts) and of the
// school's day (`today` in src/content/dates.ts), which the registration page uses (W6). Run with
// `npm test`, or alone:
//
//   node --experimental-strip-types --import ./scripts/resolve-ts.mjs --test scripts/registration.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { today } from '../src/content/dates.ts';
import { registrationState } from '../src/content/edition.ts';
import { placeholder } from '../src/content/placeholder.ts';

const unknown = (shown) => placeholder(shown, 'the organisers (test)');
const form = 'https://forms.example.org/apply';
/** A registration from 1 March to 15 June 2027. */
const dated = { opens: '2027-03-01', closes: '2027-06-15', form };

test('RS1 a registration without a known opening day is unannounced', () => {
  assert.deepEqual(registrationState(undefined, '2027-01-01'), { kind: 'unannounced' });
  const open = { opens: unknown('Opening date to be announced'), closes: unknown('…'), form };
  assert.deepEqual(registrationState(open, '2027-01-01'), { kind: 'unannounced' });
  const onlyClosing = { ...open, closes: '2027-06-15' };
  assert.deepEqual(registrationState(onlyClosing, '2027-04-01'), { kind: 'unannounced' });
});

test('RS2 before the opening day it is upcoming, with the opening day', () => {
  assert.deepEqual(registrationState(dated, '2027-02-28'), {
    kind: 'upcoming',
    opens: '2027-03-01',
  });
});

test('RS3 it is open from the opening day to the end of the closing day, both included', () => {
  for (const day of ['2027-03-01', '2027-04-30', '2027-06-15']) {
    assert.deepEqual(registrationState(dated, day), { kind: 'open', closes: '2027-06-15' }, day);
  }
});

test('RS4 a known opening day with an unknown closing day is open without a closing day', () => {
  const open = { ...dated, closes: unknown('Closing date to be announced') };
  assert.deepEqual(registrationState(open, '2027-03-01'), { kind: 'open' });
  assert.deepEqual(registrationState(open, '2030-01-01'), { kind: 'open' });
});

test('RS5 after the closing day it is closed, even if the opening day is unknown', () => {
  assert.deepEqual(registrationState(dated, '2027-06-16'), {
    kind: 'closed',
    closes: '2027-06-15',
  });
  const noOpening = { ...dated, opens: unknown('Opening date to be announced') };
  assert.deepEqual(registrationState(noOpening, '2027-06-16'), {
    kind: 'closed',
    closes: '2027-06-15',
  });
});

test("TD1 today() is the day in Paris, wherever the computer's clock and time zone are", () => {
  // Winter time (UTC+1): 23:00 UTC on 31 December is midnight, 1 January, in Paris.
  assert.equal(today(new Date('2026-12-31T22:59:59Z')), '2026-12-31');
  assert.equal(today(new Date('2026-12-31T23:00:00Z')), '2027-01-01');
  // Summer time (UTC+2): midnight in Paris is 22:00 UTC.
  assert.equal(today(new Date('2027-06-15T21:59:59Z')), '2027-06-15');
  assert.equal(today(new Date('2027-06-15T22:00:00Z')), '2027-06-16');
  // The days the clocks change in 2027: 28 March and 31 October.
  assert.equal(today(new Date('2027-03-27T23:00:00Z')), '2027-03-28');
  assert.equal(today(new Date('2027-10-30T22:00:00Z')), '2027-10-31');
});

test('TD2 today() without an argument is an ISO day near the UTC date', () => {
  const day = today();
  assert.match(day, /^\d{4}-\d{2}-\d{2}$/);
  const utc = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  assert.ok(Math.abs(Date.parse(`${day}T00:00:00Z`) - utc) <= 86_400_000, day);
});
