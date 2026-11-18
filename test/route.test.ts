import {afterEach, beforeEach, expect, test} from 'vite-plus/test';
import {route, router} from '../src';
import {destroyRouter} from '../src/router';
import {resetHistory} from './.helper';

afterEach(() => {
	destroyRouter();
});

beforeEach(() => {
	resetHistory();
});

const path = 'path';
const callback = () => 'callback';
const guard = () => true;

const basic = route('', callback);

test('route: setup', () => {
	expect(() => route(path, callback, [guard])).not.toThrow();

	expect(() => route(path, callback, guard as never)).toThrow();
	expect(() => route(path, callback, [path] as never)).toThrow();
	expect(() => route(path, path as never)).toThrow();
	expect(() => route(callback as never, callback)).toThrow();
});

test('route: visit + properties', () => {
	const rootdir = basic;
	const subdir = route(path, callback);

	expect(rootdir.active).toBe(false);
	expect(subdir.active).toBe(false);

	expect(subdir.toJSON()).toEqual({
		path: {
			original: path,
			normalized: path,
		},
		active: false,
	});

	router.set([rootdir, subdir]);

	expect(rootdir.active).toBe(true);
	expect(subdir.active).toBe(false);

	subdir.visit();

	expect(window.location.pathname).toBe(`/${path}/`);

	expect(rootdir.active).toBe(false);
	expect(subdir.active).toBe(true);

	expect(subdir.toJSON()).toEqual({
		path: {
			original: path,
			normalized: `/${path}/`,
		},
		active: true,
	});

	router.stop();

	rootdir.visit();

	expect(rootdir.active).toBe(false);
	expect(subdir.active).toBe(true);
});

test('route: visit, complex', () => {
	const complex = route('/complex/:id/(\\d+)/*', callback);

	expect(complex.active).toBe(false);

	router.set([basic, complex]);

	expect(complex.active).toBe(false);

	complex.visit();

	expect(window.location.pathname).toBe('/');
	expect(complex.active).toBe(false);

	complex.visit({id: 123});

	expect(window.location.pathname).toBe('/');
	expect(complex.active).toBe(false);

	complex.visit({id: 123, 0: 999});

	expect(window.location.pathname).toBe('/complex/123/999/');
	expect(complex.active).toBe(true);

	complex.visit({id: 123, 0: 'xyz', 1: 'abc'});

	expect(window.location.pathname).toBe('/complex/123/999/');
	expect(complex.active).toBe(true);

	complex.visit({id: 123, 0: 999, 1: 'abc'});

	expect(window.location.pathname).toBe('/complex/123/999/abc/');
	expect(complex.active).toBe(true);

	basic.visit();

	expect(window.location.pathname).toBe('/');
	expect(complex.active).toBe(false);

	complex.visit({id: 123, 0: 999, 1: ['abc']});

	expect(window.location.pathname).toBe('/complex/123/999/abc/');
	expect(complex.active).toBe(true);
});
