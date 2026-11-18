import {expect, test} from 'vite-plus/test';
import {router} from '../src';
import {getQuery, normalizePath, redirect, setQuery} from '../src/helpers';
import {route} from '../src/route';
import {fixture} from './.fixture';

const {paths} = fixture;

test('getQuery', () => {
	const original = {
		query: {},
		search: '',
	};

	const fromQuery = getQuery(original.query);

	expect(fromQuery.parameters).toEqual(original.query);
	expect(fromQuery.search).toEqual(original.search);

	const fromSearch = getQuery(original.search);

	expect(fromSearch.parameters).toEqual(original.query);
	expect(fromSearch.search).toEqual(original.search);
});

test('normalizePath', () => {
	for (let index = 0; index < paths.length; index += 1) {
		const [input, expected, removeWildcards] = paths.array[index];

		expect(normalizePath(input, removeWildcards)).toBe(expected);
	}
});

test('redirect', () => {
	expect(window.location.pathname).toBe('/');

	router.set([route('/nope', () => {})]);

	redirect('/nope');

	expect(window.location.pathname).toBe('/nope/');

	redirect(123 as never);

	expect(window.location.pathname).toBe('/nope/');
});

test('setQuery', () => {
	expect(window.location.search).toBe('');

	router.set([route('', () => {})]);

	setQuery({foo: 'bar'});

	expect(window.location.search).toBe('?foo=bar');
});
