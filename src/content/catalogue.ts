// What a page can tell from the catalogue it receives at build time (`PageProps['catalogue']`):
// whether the site holds a course, so that a page links a course only once it is published.
import type { PageProps } from 'parallax-site/pages';

/** Whether the catalogue holds a course of this folder name (`first-edition-2025`). */
export function hasCourse(catalogue: PageProps['catalogue'] | undefined, course: string): boolean {
  return (catalogue?.instructors ?? []).some((instructor) =>
    instructor.courses.some((each) => each.slug === course),
  );
}

/** The address of a course of the catalogue, or undefined while the site does not hold it. */
export function courseAddress(
  catalogue: PageProps['catalogue'] | undefined,
  course: string,
): string | undefined {
  return hasCourse(catalogue, course) ? `/courses/${course}` : undefined;
}
