import {expect, test} from 'vite-plus/test';
import * as Kyne from '../src';
import {destroyRouter} from '../src/router';

const values = [
	null,
	undefined,
	true,
	123,
	123n,
	'hello, world!',
	[],
	{},
	() => {},
	new Map(),
	new Set(),
];

const {length} = values;

test('isPattern', () => {
	for (let index = 0; index < length; index += 1) {
		expect(Kyne.isPattern(values[index] as never)).toBe(false);
	}

	expect(Kyne.isPattern('/some/:pattern')).toBe(true);
});

test('isRoute', () => {
	for (let index = 0; index < length; index += 1) {
		expect(Kyne.isRoute(values[index] as never)).toBe(false);
	}

	expect(Kyne.isRoute(Kyne.route('', () => {}))).toBe(true);
});

test('isRouter', () => {
	for (let index = 0; index < length; index += 1) {
		expect(Kyne.isRouter(values[index] as never)).toBe(false);
	}

	const instance = Kyne.router([Kyne.route('', () => {})]);

	expect(Kyne.isRouter(instance)).toBe(true);

	destroyRouter(instance);
});

test('redirect', () => {
	expect(window.location.pathname).toBe('/');

	const instance = Kyne.router([Kyne.route('/nope', () => {})]);

	Kyne.redirect('/nope');

	expect(window.location.pathname).toBe('/nope/');

	destroyRouter(instance);
});

test('setQuery', () => {
	expect(window.location.search).toBe('');

	const instance = Kyne.router([Kyne.route('', () => {})]);

	Kyne.setQuery({foo: 'bar'});

	expect(window.location.search).toBe('?foo=bar');

	destroyRouter(instance);
});
