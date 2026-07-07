// Single Lenis instance shared app-wide: created in App, consumed by BackToTop.
export let lenis = null;

export function setLenis(instance) {
  lenis = instance;
}
