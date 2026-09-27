import type {PlainObject} from '@oscarpalmer/atoms/models';
import {EXPRESSION_URL_PATTERNS, SYMBOL, TYPE_ROUTE, TYPE_ROUTER} from './constants';
import type {Route, Router} from './models';

// #region Functions

function isInstance(type: string, value: unknown): boolean {
	return (
		typeof value === 'object' &&
		value !== null &&
		SYMBOL in value &&
		((value as PlainObject)[SYMBOL] as PlainObject).type === type
	);
}

export function isPattern(value: string): boolean {
	return typeof value === 'string' && EXPRESSION_URL_PATTERNS.some(pattern => pattern.test(value));
}

export function isRoute(value: unknown): value is Route {
	return isInstance(TYPE_ROUTE, value);
}

export function isRouter(value: unknown): value is Router {
	return isInstance(TYPE_ROUTER, value);
}

// #endregion
