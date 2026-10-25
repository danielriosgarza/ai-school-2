import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import styles from './_scene.module.css';
import {
  createCommunity,
  equilibriumTotal,
  SEED,
  SPECIES,
  STEP,
  step,
  type Community,
} from './_scene-model';

// The scene of the front page's hero (docs/plan.md, section 5): a microbial community under
// control. Six species evolve under a generalized Lotka–Volterra model (`_scene-model.ts`), drawn
// as stacked bands whose heights are their abundances, advancing from right to left like a chart
// recorder; a PI controller keeps the lowest species near the amber target line, which moves now
// and then, while a disturbance now and then knocks a species up or down. A name that starts with
// `_` makes this file a helper, not a page. It loads no image and adds no dependency; it pauses
// off screen, starts paused under reduced motion and redraws when the colour scheme changes.

/** The scene's colours. Any CSS colour works, `var(--name)` included: it is resolved on the
 * scene's own element, so a theme's custom properties reach the canvas. `tints` colour the
 * species above the controlled one, lowest first; when it is left out, four lighter steps of
 * `primary` towards `paper` are used, and a grey from `ink` and `paper` fills any band left. */
export interface ScenePalette {
  paper: string;
  ink: string;
  primary: string;
  accent: string;
  tints?: string[];
}

export interface SceneProps extends Partial<ScenePalette> {
  /** The colours of the dark scheme. A colour given above and not here is used in both schemes;
   * one given in neither comes from DARK. */
  dark?: Partial<ScenePalette>;
  /** 'auto' (the default) follows `prefers-color-scheme`; 'light' and 'dark' fix the scheme. */
  scheme?: 'auto' | 'light' | 'dark';
  /** The seed of the community: the same seed draws the same scene for every visitor. */
  seed?: number;
  /** A class for the scene's box, which the canvas fills: it sets the size. */
  className?: string;
}

/** The light colours: the school's paper, ink, petrol blue and amber (docs/plan.md, section 5). */
export const LIGHT: ScenePalette = {
  paper: '#f7f4ee',
  ink: '#14213d',
  primary: '#1f4e5f',
  accent: '#e0a100',
};
/** The dark colours: the same roles on a dark ground, with a lighter petrol for the bands. */
export const DARK: ScenePalette = {
  paper: '#101a22',
  ink: '#e9edf1',
  primary: '#7fb6c4',
  accent: '#f0b429',
};

/** Model time per second of real time, model steps per recorded column, and the column's width
 * in CSS pixels: the bands advance by 15 px a second. */
const SPEED = 1;
const SAMPLE = 10;
const COLUMN = 3;
/** The columns kept: enough for a scene 3000 px wide. They are filled before the first frame. */
const CAPACITY = 1024;
/** The highest stack the scene shows, as a multiple of the community's equilibrium total. */
const HEADROOM = 1.6;
/** Frames per second, and the longest real time one frame may advance after a stall. */
const FPS = 30;
const LONGEST = 0.25;
/** A vertical rule every this many columns (5 s), and the horizontal rules. */
const RULE_EVERY = 25;
const RULES = 4;
/** The paper line between neighbouring bands, and the target line, in CSS pixels. */
const GAP = 1;
const TARGET_WIDTH = 2;
/** How far towards the paper the four default tints lie, and the grey between ink and paper. */
const TINT_STEPS = [0.3, 0.5, 0.66, 0.8];
const GREY_STEP = 0.72;
/** The button's border, between ink and paper. */
const BORDER_STEP = 0.45;
/** The densest the canvas is drawn, in device pixels per CSS pixel. */
const DENSEST = 2;
const LABEL =
  'A microbial community of six species: their abundances, drawn as stacked bands in shades of blue and grey, rise and fall over time as the bands advance from right to left, while a controller holds the lowest band close to an amber target line that moves now and then.';

type Rgb = [number, number, number];

/** The community and the columns it has recorded. It outlives a pause, so the scene goes on. */
interface Recorder {
  seed: number;
  community: Community;
  /** The stack tops of each column (SPECIES a column, the lowest band first) and its target. */
  tops: Float32Array;
  targets: Float32Array;
  /** The newest column, the columns filled, and the columns ever recorded (for the rules). */
  head: number;
  filled: number;
  recorded: number;
  /** Model time not yet stepped: the accumulator. */
  carry: number;
  /** The stack tops of the current state, between the newest column and the right edge. */
  live: Float32Array;
  /** The stack height the canvas shows. */
  scale: number;
}

function stack(community: Community, into: Float32Array, at: number): void {
  let sum = 0;
  for (let i = 0; i < SPECIES; i++) {
    sum += community.abundance[i];
    into[at + i] = sum;
  }
}

function record(r: Recorder): void {
  r.head = (r.head + 1) % CAPACITY;
  stack(r.community, r.tops, r.head * SPECIES);
  r.targets[r.head] = r.community.target;
  if (r.filled < CAPACITY) r.filled += 1;
  r.recorded += 1;
}

/** Advances the community by `seconds` of real time in fixed steps, recording every SAMPLE. */
function advance(r: Recorder, seconds: number): void {
  r.carry += seconds * SPEED;
  while (r.carry >= STEP) {
    step(r.community);
    r.carry -= STEP;
    if (r.community.steps % SAMPLE === 0) record(r);
  }
  stack(r.community, r.live, 0);
}

function createRecorder(seed: number): Recorder {
  const community = createCommunity(seed);
  const r: Recorder = {
    seed,
    community,
    tops: new Float32Array(CAPACITY * SPECIES),
    targets: new Float32Array(CAPACITY),
    head: 0,
    filled: 0,
    recorded: 0,
    carry: 0,
    live: new Float32Array(SPECIES),
    scale: HEADROOM * equilibriumTotal(community),
  };
  // The history of the first frame: the same for every visitor, whatever the width.
  advance(r, (CAPACITY * SAMPLE * STEP) / SPEED);
  return r;
}

/** The colours of one scheme as the canvas uses them. */
interface Colours {
  paper: string;
  rule: string;
  accent: string;
  bands: string[];
}

const rgb = ([r, g, b]: Rgb, alpha = 1) =>
  alpha === 1
    ? `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
    : `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/** Where band `b`'s upper and lower edges lie in a column whose stack tops start at `at` in
 * `tops`: its own top and the top of the band below, each moved half a GAP towards the other (the
 * highest band's top and the lowest band's bottom stay), and never past the band's middle, so
 * that a paper line shows between neighbours without a stroke. */
function upper(tops: Float32Array, at: number, b: number, unit: number, height: number): number {
  const top = height - tops[at + b] * unit;
  if (b === SPECIES - 1) return top;
  const bottom = b === 0 ? height : height - tops[at + b - 1] * unit;
  return Math.min(top + GAP / 2, (top + bottom) / 2);
}
function lower(tops: Float32Array, at: number, b: number, unit: number, height: number): number {
  const top = height - tops[at + b] * unit;
  const bottom = height - tops[at + b - 1] * unit;
  return Math.max(bottom - GAP / 2, (top + bottom) / 2);
}

/** Draws the scene: the rules, the bands from the lowest up and the target line, at the right
 * edge the current state and then one column every COLUMN pixels to the left. Allocates nothing. */
function paint(
  context: CanvasRenderingContext2D,
  r: Recorder,
  colours: Colours,
  width: number,
  height: number,
  density: number,
): void {
  context.setTransform(density, 0, 0, density, 0, 0);
  context.fillStyle = colours.paper;
  context.fillRect(0, 0, width, height);
  if (r.filled === 0) return;
  const { tops, targets, live, head } = r;
  const unit = height / r.scale;
  const hairline = 1 / density;
  // How far the newest column has moved left of the right edge, as a fraction of a column.
  const phase = ((r.community.steps % SAMPLE) + r.carry / STEP) / SAMPLE;
  const columns = Math.min(r.filled, Math.ceil(width / COLUMN) + 2);
  const oldest = width - (columns - 1 + phase) * COLUMN;

  // Rules: horizontal at even heights, vertical every RULE_EVERY columns, moving with the bands.
  context.strokeStyle = colours.rule;
  context.lineWidth = hairline;
  context.beginPath();
  for (let n = 1; n <= RULES; n++) {
    const y = Math.round(((height * n) / (RULES + 1)) * density) / density + hairline / 2;
    context.moveTo(0, y);
    context.lineTo(width, y);
  }
  for (let k = r.recorded % RULE_EVERY; k < columns; k += RULE_EVERY) {
    const x = Math.round((width - (k + phase) * COLUMN) * density) / density + hairline / 2;
    context.moveTo(x, 0);
    context.lineTo(x, height);
  }
  context.stroke();

  // Bands: along the upper edge from right to left, then back along the lower edge.
  for (let b = 0; b < SPECIES; b++) {
    context.fillStyle = colours.bands[b];
    context.beginPath();
    context.moveTo(width, upper(live, 0, b, unit, height));
    for (let k = 0; k < columns; k++) {
      const at = ((head - k + CAPACITY) % CAPACITY) * SPECIES;
      context.lineTo(width - (k + phase) * COLUMN, upper(tops, at, b, unit, height));
    }
    if (b === 0) {
      context.lineTo(oldest, height);
      context.lineTo(width, height);
    } else {
      for (let k = columns - 1; k >= 0; k--) {
        const at = ((head - k + CAPACITY) % CAPACITY) * SPECIES;
        context.lineTo(width - (k + phase) * COLUMN, lower(tops, at, b, unit, height));
      }
      context.lineTo(width, lower(live, 0, b, unit, height));
    }
    context.closePath();
    context.fill();
  }

  // The target line, in the accent.
  context.strokeStyle = colours.accent;
  context.lineWidth = TARGET_WIDTH;
  context.lineJoin = 'round';
  context.beginPath();
  context.moveTo(width, height - r.community.target * unit);
  for (let k = 0; k < columns; k++) {
    const at = (head - k + CAPACITY) % CAPACITY;
    context.lineTo(width - (k + phase) * COLUMN, height - targets[at] * unit);
  }
  context.stroke();
}

/** The scene, with a button that pauses and plays it. */
export default function Scene({
  paper,
  ink,
  primary,
  accent,
  tints,
  dark,
  scheme = 'auto',
  seed = SEED,
  className,
}: SceneProps) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const recorder = useRef<Recorder | null>(null);
  const [playing, setPlaying] = useState(
    () =>
      typeof matchMedia === 'undefined' || !matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  // The two palettes, as given, with a key that changes only when a colour does, so that a new
  // `tints` array on every render of the page does not restart anything.
  const key = [
    paper,
    ink,
    primary,
    accent,
    tints?.join(','),
    dark?.paper,
    dark?.ink,
    dark?.primary,
    dark?.accent,
    dark?.tints?.join(','),
  ].join('|');
  const palettes = useMemo(
    () => ({
      light: { paper, ink, primary, accent, tints },
      dark: {
        paper: dark?.paper ?? paper,
        ink: dark?.ink ?? ink,
        primary: dark?.primary ?? primary,
        accent: dark?.accent ?? accent,
        tints: dark?.tints ?? tints,
      },
    }),
    [key],
  );

  useLayoutEffect(() => {
    const root = box.current;
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!root || !element || !context) return;
    if (recorder.current?.seed !== seed) recorder.current = createRecorder(seed);
    const r = recorder.current;
    let [width, height, density] = [0, 0, 1];
    let colours: Colours | null = null;
    let [tick, last, onScreen] = [0, 0, true];

    // One pixel to read a colour back as numbers, whatever syntax CSS gave it in.
    const pixel = document.createElement('canvas');
    pixel.width = pixel.height = 1;
    const reader = pixel.getContext('2d', { willReadFrequently: true });
    // The canvas's own `color` is the probe. Its transitions are off meanwhile: under reduced
    // motion Parallax gives every element a 0.01 ms transition, and a colour in transition reads
    // as the one it starts from.
    const resolve = (value: string | undefined, fallback: string): Rgb => {
      if (!reader) return [0, 0, 0];
      element.style.setProperty('transition', 'none', 'important');
      element.style.color = fallback;
      if (value) element.style.color = value;
      const computed = getComputedStyle(element).color;
      element.style.removeProperty('color');
      element.style.removeProperty('transition');
      reader.clearRect(0, 0, 1, 1);
      reader.fillStyle = computed;
      reader.fillRect(0, 0, 1, 1);
      const [red = 0, green = 0, blue = 0] = reader.getImageData(0, 0, 1, 1).data;
      return [red, green, blue];
    };
    const darkScheme = matchMedia('(prefers-color-scheme: dark)');
    const recolour = () => {
      const isDark = scheme === 'dark' || (scheme === 'auto' && darkScheme.matches);
      const given = isDark ? palettes.dark : palettes.light;
      const base = isDark ? DARK : LIGHT;
      const ground = resolve(given.paper, base.paper);
      const pen = resolve(given.ink, base.ink);
      const blue = resolve(given.primary, base.primary);
      const amber = resolve(given.accent, base.accent);
      const steps = given.tints?.length
        ? given.tints.map((tint) => resolve(tint, base.primary))
        : TINT_STEPS.map((t) => mix(blue, ground, t));
      const bands = [blue, ...steps];
      while (bands.length < SPECIES) bands.push(mix(pen, ground, GREY_STEP));
      colours = {
        paper: rgb(ground),
        rule: rgb(pen, isDark ? 0.12 : 0.08),
        accent: rgb(amber),
        bands: bands.slice(0, SPECIES).map((band) => rgb(band)),
      };
      // The button's colours, from the same palette; its border grey keeps 3:1 on the paper.
      root.style.setProperty('--scene-paper', rgb(ground));
      root.style.setProperty('--scene-ink', rgb(pen));
      root.style.setProperty('--scene-accent', rgb(amber));
      root.style.setProperty('--scene-rule', rgb(mix(pen, ground, BORDER_STEP)));
      draw();
    };
    const draw = () => {
      if (colours && width > 0 && height > 0) paint(context, r, colours, width, height, density);
    };
    // The canvas covers its box at the device's density (at most DENSEST).
    const fit = () => {
      const next = [root.clientWidth, root.clientHeight, Math.min(DENSEST, devicePixelRatio || 1)];
      if (next[0] === width && next[1] === height && next[2] === density) return;
      [width, height, density] = next as [number, number, number];
      element.width = Math.round(width * density);
      element.height = Math.round(height * density);
      draw();
    };
    const frame = (now: number) => {
      tick = requestAnimationFrame(frame);
      if (last === 0) {
        last = now;
        return;
      }
      const elapsed = now - last;
      if (elapsed < 1000 / FPS - 2) return;
      last = now;
      advance(r, Math.min(elapsed / 1000, LONGEST));
      draw();
    };
    // The loop runs only while the scene plays and is on screen.
    const run = () => {
      const wanted = playing && onScreen;
      if (wanted && tick === 0) {
        last = 0;
        tick = requestAnimationFrame(frame);
      } else if (!wanted && tick !== 0) {
        cancelAnimationFrame(tick);
        tick = 0;
      }
    };
    const seen = new IntersectionObserver((entries) => {
      onScreen = entries.at(-1)?.isIntersecting ?? true;
      run();
    });
    const sized = new ResizeObserver(fit);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const still = (event: MediaQueryListEvent) => {
      if (event.matches) setPlaying(false);
    };
    fit();
    recolour();
    darkScheme.addEventListener('change', recolour);
    motion.addEventListener('change', still);
    seen.observe(element);
    sized.observe(root);
    run();
    return () => {
      cancelAnimationFrame(tick);
      tick = 0;
      darkScheme.removeEventListener('change', recolour);
      motion.removeEventListener('change', still);
      seen.disconnect();
      sized.disconnect();
    };
  }, [seed, playing, scheme, palettes]);

  return (
    <div ref={box} className={className ? `${styles.scene} ${className}` : styles.scene}>
      <canvas ref={canvas} className={styles.canvas} role="img" aria-label={LABEL} />
      <button type="button" className={styles.toggle} onClick={() => setPlaying(!playing)}>
        {playing ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}
