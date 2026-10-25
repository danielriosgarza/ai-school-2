// Tests of the hero scene's model, src/pages/_scene-model.ts: run with
//
//   node --test scripts/scene-model.test.mjs
//
// Node 22.18 and later run the model's TypeScript as it is (type stripping); on 22.12 to 22.17 add
// --experimental-strip-types. No dependency is needed.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CONTROLLED,
  createCommunity,
  equilibriumTotal,
  generator,
  SEED,
  SPECIES,
  STEP,
  step,
} from '../src/pages/_scene-model.ts';

/** The scene's seed, a few others, and the ends of the seed's range. */
const SEEDS = [SEED, 0, 1, 2, 3, 7, 42, 2025, 4294967295];
/** 3000 units of model time: 50 minutes of the scene at its speed of one unit a second. */
const LONG = 3000 / STEP;

test('the community stays positive and bounded over a long run, for every seed', () => {
  for (const seed of SEEDS) {
    const community = createCommunity(seed);
    const ceiling = equilibriumTotal(community);
    let highest = 0;
    for (let s = 0; s < LONG; s++) {
      step(community);
      let total = 0;
      for (let i = 0; i < SPECIES; i++) {
        const x = community.abundance[i];
        if (!(x > 0 && Number.isFinite(x)))
          assert.fail(`seed ${seed}: species ${i} is ${x} at time ${community.time}`);
        total += x;
      }
      highest = Math.max(highest, total / ceiling);
    }
    // The scene draws stacks up to 1.6 times the equilibrium total (HEADROOM in _scene.tsx).
    assert.ok(highest < 2, `seed ${seed}: the community reached ${highest} times its equilibrium`);
    if (seed === SEED) assert.ok(highest < 1.5, `the scene's seed reached ${highest}`);
  }
});

test('the controller reduces the distance to the target', () => {
  for (const seed of SEEDS) {
    const steered = createCommunity(seed);
    const free = createCommunity(seed, false);
    let near = 0;
    let far = 0;
    for (let s = 0; s < LONG / 3; s++) {
      step(steered);
      step(free);
      // The same seed gives both the same disturbances and the same targets.
      assert.equal(steered.target, free.target);
      near += Math.abs(steered.abundance[CONTROLLED] - steered.target);
      far += Math.abs(free.abundance[CONTROLLED] - free.target);
    }
    assert.ok(near < 0.6 * far, `seed ${seed}: ${near} with the controller, ${far} without`);
    if (seed === SEED) assert.ok(near < 0.25 * far, `the scene's seed: ${near} against ${far}`);
  }
});

test('after every move of the target, the controlled species closes in on it', () => {
  const community = createCommunity(SEED);
  let target = community.target;
  let moved = 0; // when the target last moved
  let size = 0; // by how much
  let open = false; // and whether the species has yet to meet it
  let moves = 0;
  let slowest = 0;
  for (let s = 0; s < LONG; s++) {
    step(community);
    if (community.target !== target) {
      assert.ok(!open, `the move at ${moved} was not met before the next one`);
      size = Math.abs(community.target - target);
      target = community.target;
      moved = community.time;
      open = true;
      moves += 1;
    }
    // Met: within a fifth of the move from the target.
    if (open && Math.abs(community.abundance[CONTROLLED] - target) < 0.2 * size) {
      slowest = Math.max(slowest, community.time - moved);
      open = false;
    }
  }
  assert.ok(moves > 50, `only ${moves} moves of the target`);
  assert.ok(slowest < 5, `the slowest move took ${slowest} units of time`);
});

test('the same seed gives the same trajectory, and another seed another one', () => {
  const [a, b, other] = [createCommunity(SEED), createCommunity(SEED), createCommunity(SEED + 1)];
  let differs = false;
  for (let s = 0; s < LONG / 3; s++) {
    step(a);
    step(b);
    step(other);
    assert.deepEqual(a.abundance, b.abundance);
    assert.equal(a.target, b.target);
    if (a.abundance[CONTROLLED] !== other.abundance[CONTROLLED]) differs = true;
  }
  assert.ok(differs);
  const [g, h] = [generator(SEED), generator(SEED)];
  for (let n = 0; n < 1000; n++) {
    const value = g();
    assert.equal(value, h());
    assert.ok(value >= 0 && value < 1);
  }
});
