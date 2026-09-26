import {defineConfig} from 'vite-plus/pack';

const watch = process.argv.includes('--watch');

export default defineConfig({
	clean: !watch,
	copy: [
		{
			from: './dist/index.mjs',
			to: './dist',
			rename: 'kyne.full.mjs',
		},
	],
	deps: {
		// tsdown <0.23 compatibility: resolve external dependency subpaths.
		// Remove to preserve subpath imports as written (the new default).
		// https://tsdown.dev/options/dependencies#deps-resolvedepsubpath
		resolveDepSubpath: true,
		alwaysBundle: /^@oscarpalmer/,
		onlyBundle: false,
	},
	entry: './src/index.ts',
	ignoreWatch: ['./dist/*'],
	minify: 'dce-only',
	treeshake: {
		// Temporary workaround until my other package properly declares side effects
		// Neither package declares `sideEffects: false`, so treat them as pure
		moduleSideEffects: id => !id.includes('@oscarpalmer'),
	},
});
