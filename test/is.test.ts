import {afterEach, beforeEach, expect, test} from 'vite-plus/test';
import {isPattern, isRoute, isRouter, route, router} from '../src';
import {destroyRouter} from '../src/router';
import {fixture} from './.fixture';
import {resetHistory} from './.helper';

const {values} = fixture;

afterEach(() => {
	destroyRouter();
});

beforeEach(() => {
	resetHistory();
});

test('isPattern', () => {
	for (let index = 0; index < values.length; index += 1) {
		expect(isPattern(values.array[index] as never)).toBe(false);
	}

	expect(isPattern('/some/:pattern')).toBe(true);
});

test('isRoute', () => {
	for (let index = 0; index < values.length; index += 1) {
		expect(isRoute(values.array[index] as never)).toBe(false);
	}

	expect(isRoute(route('', () => {}))).toBe(true);
});

test('isRouter', () => {
	for (let index = 0; index < values.length; index += 1) {
		expect(isRouter(values.array[index] as never)).toBe(false);
	}

	expect(isRouter(router)).toBe(true);
});
