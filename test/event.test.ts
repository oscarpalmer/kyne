import {afterEach, beforeEach, expect, test} from 'vite-plus/test';
import {route, router} from '../src';
import {onClick, onPopState, onRoute} from '../src/event';
import {destroyRouter} from '../src/router';
import {resetHistory} from './.helper';

afterEach(() => {
	destroyRouter();
});

beforeEach(() => {
	resetHistory();
});

test('error', () => {
	let error = 0;

	router.set([route('another', () => {})], {
		error: () => {
			error += 1;
		},
	});

	expect(error).toBe(1);
});

test('popstate', async () => {
	let another = 0;
	let home = 0;

	const routes = [
		route('', () => {
			home += 1;
		}),
		route('another', () => {
			another += 1;
		}),
	];

	router.set(routes);

	expect(another).toBe(0);
	expect(home).toBe(1);

	routes[1].visit();

	expect(another).toBe(1);
	expect(home).toBe(1);

	await new Promise(resolve => {
		window.addEventListener('popstate', resolve, {once: true});

		window.history.back();
	});

	expect(another).toBe(1);
	expect(home).toBe(2);
});

test('popstate: state', () => {
	let home = 0;

	router.set([
		route('', () => {
			home += 1;
		}),
	]);

	expect(home).toBe(1);

	onPopState(new PopStateEvent('popstate', {state: null}));
	onPopState(new PopStateEvent('popstate', {state: {}}));

	expect(home).toBe(1);

	onPopState(new PopStateEvent('popstate', {state: {path: '/'}}));

	expect(home).toBe(2);

	onPopState(new PopStateEvent('popstate', {state: {path: '/', query: {a: 1}, search: 'a=1'}}));

	expect(home).toBe(3);
});

test('click: no anchor', () => {
	let home = 0;

	router.set([
		route('', () => {
			home += 1;
		}),
	]);

	document.body.innerHTML = '<p>Text</p>';

	document.querySelector('p')?.click();

	expect(home).toBe(1);

	document.body.innerHTML = '';
});

test('click: handler', () => {
	expect(() => onClick(new Event('click'))).not.toThrow();
});

test('route: defaults', () => {
	let home = 0;

	router.set([
		route('', () => {
			home += 1;
		}),
	]);

	expect(home).toBe(1);

	onRoute('/', {initial: true});

	expect(home).toBe(2);
});

test('route: patterns', () => {
	const visited: string[] = [];

	const routes = [
		route('a/:id', () => {
			visited.push('a');
		}),
		route('b/:id', () => {
			visited.push('b');
		}),
	];

	router.set(routes);

	routes[0].visit({id: 1});
	routes[1].visit({id: 2});

	expect(visited).toEqual(['a', 'b']);
});
