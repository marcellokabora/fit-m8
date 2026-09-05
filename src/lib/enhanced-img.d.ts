// @sveltejs/enhanced-img only ambient-declares the bare "*?enhanced" suffix, so imports that
// add a per-image transform (e.g. "?quality=45&enhanced") need their own matching declaration.
// This must stay a script file (no top-level import/export) so `declare module` here registers
// a new ambient module instead of being treated as an augmentation of an existing one.
declare module '*?quality=45&enhanced' {
    import type { Picture } from 'vite-imagetools';

    const value: Picture;
    export default value;
}
