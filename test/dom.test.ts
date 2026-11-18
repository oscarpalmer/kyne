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

test('anchor', () => {
	document.body.innerHTML = `
	<a href="/">Home</a>
	<a href="/yep/99">Yep</a>
	<a href="/nope">Nope</a>
	<a href="//example.com">External</a>`;

	const anchors = [...document.querySelectorAll('a')];

	const routes = [
		route('', () => {
			home += 1;
		}),
		route(
			'yep/:value',
			event => {
				yep += Number.parseInt(event.values.value as string, 10);
			},
			[
				() => {
					succeeded += 1;

					return true;
				},
			],
		),
		route(
			'nope',
			() => {
				nope += 1;
			},
			[
				() => {
					failed += 1;

					return false;
				},
			],
		),
	];

	let yep = 0;
	let failed = 0;
	let home = 0;
	let nope = 0;
	let succeeded = 0;

	router.set(routes, {
		autostart: false,
	});

	expect(router.route).toBeUndefined();

	expect(yep).toBe(0);
	expect(failed).toBe(0);
	expect(home).toBe(0);
	expect(nope).toBe(0);
	expect(succeeded).toBe(0);

	router.start();

	expect(router.route).toBe(routes[0]);
	expect(yep).toBe(0);
	expect(failed).toBe(0);
	expect(home).toBe(1);
	expect(nope).toBe(0);
	expect(succeeded).toBe(0);

	anchors.at(1)?.click();

	expect(router.route).toBe(routes[1]);
	expect(yep).toBe(99);
	expect(failed).toBe(0);
	expect(home).toBe(1);
	expect(nope).toBe(0);
	expect(succeeded).toBe(1);

	anchors.at(2)?.click();

	expect(router.route).toBe(routes[1]);
	expect(yep).toBe(99);
	expect(failed).toBe(1);
	expect(home).toBe(1);
	expect(nope).toBe(0);
	expect(succeeded).toBe(1);

	anchors.at(1)?.click();

	expect(router.route).toBe(routes[1]);
	expect(yep).toBe(99);
	expect(failed).toBe(1);
	expect(home).toBe(1);
	expect(nope).toBe(0);
	expect(succeeded).toBe(1);

	const {pathname} = window.location;

	anchors.at(3)?.click();

	expect(window.location.pathname).toBe(pathname);

	router.stop();

	anchors.at(0)?.click();

	expect(window.location.pathname).toBe(pathname);

	document.body.innerHTML = '';
});
