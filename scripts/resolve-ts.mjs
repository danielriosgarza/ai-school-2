// Lets Node's own tests import the site's TypeScript modules as they are. src/content imports its
// neighbours without an extension (`from './placeholder'`), as the bundler resolves them; Node's
// resolver does not, so this hook tries the specifier again with `.ts` when a relative import is
// not found. Node strips the types itself: on by default from Node 22.18, with
// --experimental-strip-types from 22.12 to 22.17. `npm test` loads it:
//
//   node --experimental-strip-types --import ./scripts/resolve-ts.mjs --test scripts/*.test.mjs
//
// No dependency. On the main thread this module registers itself; on the hooks' thread it is the
// hook.
import { register } from 'node:module';
import { isMainThread } from 'node:worker_threads';

/** Node's resolve hook: a relative specifier without an extension is tried as a `.ts` file. */
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    const bare = /^\.{1,2}\//.test(specifier) && !/\.[cm]?[jt]sx?$/.test(specifier);
    if (error?.code !== 'ERR_MODULE_NOT_FOUND' || !bare) throw error;
    return nextResolve(`${specifier}.ts`, context);
  }
}

if (isMainThread) register(import.meta.url);
