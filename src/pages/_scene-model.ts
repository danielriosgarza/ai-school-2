// The model behind the front page's scene (`_scene.tsx`): a small microbial community under a
// generalized Lotka–Volterra system, with one species steered towards a target abundance by a PI
// controller. It has no DOM and allocates nothing per step, and everything in it follows from one
// seed, so two visitors see the same scene. A name that starts with `_` makes this file a helper,
// not a page. `scripts/scene-model.test.mjs` tests it with `node --test`; it is written in the
// TypeScript that Node runs without a build step (types only: no enum, namespace or parameter
// property).
//
// For species i of n, with abundances x, the controlled species c and the controller's input u:
//
//   dx_i/dt = x_i (r_i + f_i(t) + p_i(t) + [i = c] u + A_i1 x_1 + … + A_in x_n)
//
// r are the growth rates, A the interaction matrix, f a slow seasonal swing of each growth rate,
// and p the pulses of the disturbances, which die away in a few units of time. The system is
// integrated in ln x, which keeps every abundance positive by construction, with a fourth-order
// Runge–Kutta step of fixed length; f, p and u are held for the length of a step, as a sampled
// controller holds its output.
//
// A = S + K − D: S is symmetric and weak (competition and cross-feeding), K antisymmetric (one
// species feeding on another), and D a diagonal self-limitation larger than each row of S. So the
// symmetric part of A is negative definite and the equilibrium x* is globally stable in the
// positive orthant (Goh, 1977): the community stays bounded whatever the disturbances do, and K
// makes it ring on the way back. The growth rates follow from the chosen equilibrium, r = −A x*.

/** The seed of the front page's scene, chosen from the first 400: over 3000 units of time its
 * community stays below 1.3 times its equilibrium total and above 0.06 for every species, and
 * its controller never saturates and comes within a fifth of each new target in under five
 * units (1.6 in the median). */
export const SEED = 19;
/** The number of species. */
export const SPECIES = 6;
/** The species the controller steers: the first, drawn as the lowest band. */
export const CONTROLLED = 0;
/** Model time per integration step. */
export const STEP = 0.02;

/** The controller: u = GAIN · e + RESET · ∫e dt, where e is the shortfall from the target as a
 * fraction of the species' uncontrolled equilibrium, clamped to ±LIMIT (a change of growth rate). */
export const GAIN = 0.8;
export const RESET = 0.3;
export const LIMIT = 0.8;

/** Uncontrolled equilibrium abundances: the controlled species, and the others. */
const CONTROLLED_LEVEL: Range = [0.24, 0.3];
const OTHER_LEVEL: Range = [0.1, 0.2];
/** Half-widths of the symmetric terms and of the feeding links, the share of pairs with a
 * feeding link, and self-limitation beyond the row's symmetric terms. */
const SYMMETRIC = 0.15;
const FEEDING = 4;
const FEEDING_SHARE = 0.6;
const LIMITATION: Range = [0.5, 0.9];
/** The seasonal swing of each growth rate: its amplitude and its period in units of time. */
const SWING = 0.06;
const SEASON: Range = [24, 48];
/** A disturbance every 9 to 18 units of time: a pulse in one species' growth rate that alone
 * would take its abundance to 40–65 % (a crash) or 150–220 % (a bloom), dying away with the time
 * constant PULSE. */
const DISTURBANCE_EVERY: Range = [9, 18];
const CRASH: Range = [0.4, 0.65];
const BLOOM: Range = [1.5, 2.2];
const PULSE = 1.5;
/** The target moves every 30 to 46 units, to between 60 % and 150 % of the controlled species'
 * uncontrolled equilibrium, at least MOVE away from where it was. */
const TARGET_EVERY: Range = [30, 46];
const TARGET_LEVEL: Range = [0.6, 1.5];
const MOVE = 0.3;
/** Each species starts at 60–150 % of its equilibrium, so that the first moments already move. */
const START: Range = [0.6, 1.5];

type Range = [number, number];

/** A seeded generator of numbers in [0, 1) (mulberry32): small, fast and the same everywhere. */
export function generator(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (random: () => number, [low, high]: Range) => low + (high - low) * random();

/** A community: its parameters, fixed by the seed, and its state, which `step` advances. */
export interface Community {
  readonly size: number;
  readonly controlled: number;
  /** Growth rates r, interaction matrix A (row-major, n × n) and uncontrolled equilibrium x*. */
  readonly growth: Float64Array;
  readonly interaction: Float64Array;
  readonly equilibrium: Float64Array;
  /** The seasonal swing of each growth rate: angular frequency and phase. */
  readonly frequency: Float64Array;
  readonly phase: Float64Array;
  /** The state: ln x, x kept in step with it, and the disturbances' pulses. */
  readonly logAbundance: Float64Array;
  readonly abundance: Float64Array;
  readonly pulse: Float64Array;
  /** Whether the controller acts. The scene always has it on; the test turns it off to compare. */
  control: boolean;
  /** The target abundance of the controlled species, the controller's input and its integral. */
  target: number;
  input: number;
  integral: number;
  /** Model time and steps taken. */
  time: number;
  steps: number;
  /** When the next disturbance and the next move of the target happen, in model time. */
  nextDisturbance: number;
  nextTarget: number;
  /** The seeded generator: parameters first, then the events in the order they happen. */
  readonly random: () => number;
  /** Scratch, allocated once: the held rates, four Runge–Kutta stages and a stage's abundances. */
  readonly scratch: Float64Array;
}

/** The community of a seed. Parameters, the initial state and every event come from the seed. */
export function createCommunity(seed: number, control = true): Community {
  const random = generator(seed);
  const n = SPECIES;
  const equilibrium = new Float64Array(n);
  for (let i = 0; i < n; i++)
    equilibrium[i] = between(random, i === CONTROLLED ? CONTROLLED_LEVEL : OTHER_LEVEL);
  const interaction = new Float64Array(n * n);
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const s = (2 * random() - 1) * SYMMETRIC;
      const k = random() < FEEDING_SHARE ? (2 * random() - 1) * FEEDING : 0;
      interaction[i * n + j] = s + k;
      interaction[j * n + i] = s - k;
    }
  // D: larger than the row's symmetric terms, so that S − D is strictly diagonally dominant and
  // therefore negative definite.
  for (let i = 0; i < n; i++) {
    let row = 0;
    for (let j = 0; j < n; j++)
      if (j !== i) row += Math.abs((interaction[i * n + j] + interaction[j * n + i]) / 2);
    interaction[i * n + i] = -(row + between(random, LIMITATION));
  }
  // r = −A x*, so that x* is the equilibrium without control, swing or disturbance.
  const growth = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) sum += interaction[i * n + j] * equilibrium[j];
    growth[i] = -sum;
  }
  const frequency = new Float64Array(n);
  const phase = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    frequency[i] = (2 * Math.PI) / between(random, SEASON);
    phase[i] = 2 * Math.PI * random();
  }
  const logAbundance = new Float64Array(n);
  const abundance = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    abundance[i] = equilibrium[i] * between(random, START);
    logAbundance[i] = Math.log(abundance[i]);
  }
  return {
    size: n,
    controlled: CONTROLLED,
    growth,
    interaction,
    equilibrium,
    frequency,
    phase,
    logAbundance,
    abundance,
    pulse: new Float64Array(n),
    control,
    target: equilibrium[CONTROLLED] * between(random, TARGET_LEVEL),
    input: 0,
    integral: 0,
    time: 0,
    steps: 0,
    nextDisturbance: between(random, DISTURBANCE_EVERY),
    nextTarget: between(random, TARGET_EVERY),
    random,
    scratch: new Float64Array(n * 6),
  };
}

/** The events: now and then a disturbance, and now and then a new target. */
function happen(c: Community): void {
  const { random } = c;
  if (c.time >= c.nextDisturbance) {
    const species = Math.min(c.size - 1, Math.floor(random() * c.size));
    const factor = between(random, random() < 0.5 ? CRASH : BLOOM);
    c.pulse[species] += Math.log(factor) / PULSE;
    c.nextDisturbance += between(random, DISTURBANCE_EVERY);
  }
  if (c.time >= c.nextTarget) {
    const level = c.target / c.equilibrium[c.controlled];
    let next = between(random, TARGET_LEVEL);
    // At least MOVE away from the current level, and back inside the range.
    if (Math.abs(next - level) < MOVE) next = level + (next >= level ? MOVE : -MOVE);
    if (next > TARGET_LEVEL[1]) next = level - MOVE;
    if (next < TARGET_LEVEL[0]) next = level + MOVE;
    c.target = c.equilibrium[c.controlled] * next;
    c.nextTarget += between(random, TARGET_EVERY);
  }
}

/** The controller: a PI law on the shortfall, held for one step, whose integral stops growing
 * while the input is at its limit and the shortfall would push it further (anti-windup). */
function steer(c: Community): void {
  if (!c.control) {
    c.input = 0;
    return;
  }
  const error = (c.target - c.abundance[c.controlled]) / c.equilibrium[c.controlled];
  const integral = c.integral + error * STEP;
  const free = GAIN * error + RESET * integral;
  if (Math.abs(free) <= LIMIT || Math.sign(free) !== Math.sign(error)) c.integral = integral;
  const input = GAIN * error + RESET * c.integral;
  c.input = Math.max(-LIMIT, Math.min(LIMIT, input));
}

/** d(ln x)/dt at ln x + `weight` · (stage `from`), into stage `to`. Stage blocks lie in the
 * scratch after the held rates; `from` < 0 means ln x itself. */
function rates(c: Community, from: number, weight: number, to: number): void {
  const { size: n, interaction, logAbundance, scratch } = c;
  const x = 5 * n;
  for (let j = 0; j < n; j++)
    scratch[x + j] = Math.exp(logAbundance[j] + (from < 0 ? 0 : weight * scratch[from + j]));
  for (let i = 0; i < n; i++) {
    let sum = scratch[i];
    for (let j = 0; j < n; j++) sum += interaction[i * n + j] * scratch[x + j];
    scratch[to + i] = sum;
  }
}

/** One step of STEP model time: events, the controller, then a Runge–Kutta step in ln x. */
export function step(c: Community): void {
  happen(c);
  steer(c);
  const { size: n, logAbundance, abundance, pulse, scratch } = c;
  const h = STEP;
  // The rates held for this step, in the first block of the scratch.
  for (let i = 0; i < n; i++) {
    const swing = SWING * Math.sin(c.frequency[i] * c.time + c.phase[i]);
    scratch[i] = c.growth[i] + swing + pulse[i] + (i === c.controlled ? c.input : 0);
  }
  rates(c, -1, 0, n);
  rates(c, n, h / 2, 2 * n);
  rates(c, 2 * n, h / 2, 3 * n);
  rates(c, 3 * n, h, 4 * n);
  const fade = Math.exp(-h / PULSE);
  for (let i = 0; i < n; i++) {
    logAbundance[i] +=
      (h / 6) *
      (scratch[n + i] + 2 * scratch[2 * n + i] + 2 * scratch[3 * n + i] + scratch[4 * n + i]);
    abundance[i] = Math.exp(logAbundance[i]);
    pulse[i] *= fade;
  }
  c.steps += 1;
  c.time = c.steps * STEP;
}

/** The sum of the uncontrolled equilibrium: the scene scales its bands by it. */
export function equilibriumTotal(c: Community): number {
  let total = 0;
  for (let i = 0; i < c.size; i++) total += c.equilibrium[i];
  return total;
}
