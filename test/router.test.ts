import {isHeraldEvents} from '@oscarpalmer/atoms/herald';
import {afterEach, beforeEach, expect, test} from 'vite-plus/test';
import {route, router} from '../src';
import {destroyRouter} from '../src/router';
import {resetHistory} from './.helper';
import {PlainObject} from '@oscarpalmer/atoms/models';

afterEach(() => {
	destroyRouter();
});

beforeEach(() => {
	resetHistory();
});

const routes = [route('', () => {})];

test('router: initial query', () => {
	let query: PlainObject | undefined;

	router.set(
		[
			route('', event => {
				query = event.query;
			}),
		],
		{
			autostart: false,
		},
	);

	window.history.pushState(null, '', '/?foo=bar&baz=1');

	router.start();

	expect(query).toEqual({
		foo: 'bar',
		baz: 1,
	});
});

test('router: properties', () => {
	router.set(routes);

	expect(router.active).toBeTypeOf('boolean');
	expect(isHeraldEvents(router.events)).toBe(true);
	expect(router.route).toBe(routes[0]);
	expect(router.routes).toEqual(routes);
});

test('router: set', () => {
	expect(() => router.set(123 as never)).toThrow();
	expect(() => router.set([])).toThrow();
	expect(() => router.set([{} as any])).toThrow();

	expect(() =>
		router.set(routes, {
			autostart: 123 as never,
		}),
	).toThrow();

	expect(() =>
		router.set(routes, {
			error: 123 as never,
		}),
	).toThrow();

	expect(() =>
		router.set(routes, {
			prefix: 123 as never,
		}),
	).toThrow();

	router.set(routes, {
		autostart: false,
	});

	router.start();
	router.start();

	router.set([route('another', () => {})]);

	expect(() => router.set([route('another', () => {})])).toThrow();
});

test('router: start + stop', () => {
	let home = 0;

	router.set(
		[
			route('', () => {
				home += 1;
			}),
		],
		{autostart: false},
	);

	expect(router.active).toBe(false);

	router.start();

	expect(router.active).toBe(true);
	expect(home).toBe(1);

	router.stop();

	expect(router.active).toBe(false);

	router.start();

	expect(router.active).toBe(true);
	expect(home).toBe(1);
});
