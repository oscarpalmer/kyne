import type {PlainObject} from '@oscarpalmer/atoms/models';
import {
	MESSAGE_ROUTE_CALLBACK,
	MESSAGE_ROUTE_GUARD_ARRAY,
	MESSAGE_ROUTE_GUARD_TYPE,
	MESSAGE_ROUTE_PATH_TYPE,
	storage,
	SYMBOL,
	TYPE_ROUTE,
} from './constants';
import {getPath, getQuery} from './helpers';
import type {Guard, InternalRoute, Route, RouteCallback} from './models';
import {onVisit} from './event';

// #region Instances

function Route(this: any, path: string, callback: RouteCallback, guards?: Guard[]): void {
	this[SYMBOL] = {
		callback,
		guards,
		path: {
			normalized: path,
			original: path,
		},
		specificity: getRouteSpecificity(path),
		type: TYPE_ROUTE,
	};
}

Route.prototype.visit = visitRoute;

Object.defineProperties(Route.prototype, {
	active: {
		enumerable: true,
		get: getRouteActive,
	},
});

// #endregion

// #region Functions

function getRouteActive(this: InternalRoute): boolean {
	return storage.router?.[SYMBOL].route === this;
}

function getRouteSpecificity(path: string): number {
	const parts = path.split('/');
	const {length} = parts;

	let score = 0;

	for (let index = 0; index < length; index += 1) {
		const part = parts[index];

		if (part === '' || part === '/') {
			continue;
		}

		if (part.startsWith(':')) {
			score += 10;
		} else {
			score += part === '*' ? 1 : 100;
		}
	}

	return score;
}

export function route(path: string, callback: RouteCallback, guards?: Guard[]): Route {
	if (typeof path !== 'string') {
		throw new TypeError(MESSAGE_ROUTE_PATH_TYPE);
	}

	if (typeof callback !== 'function') {
		throw new TypeError(MESSAGE_ROUTE_CALLBACK);
	}

	if (guards != null) {
		validateGuards(guards);
	}

	// @ts-expect-error All good, no worries :-)
	return new Route(path, callback, guards) as Route;
}

function validateGuards(input: unknown): asserts input is Guard[] {
	if (!Array.isArray(input)) {
		throw new TypeError(MESSAGE_ROUTE_GUARD_ARRAY);
	}

	const guards = input as Guard[];
	const {length} = guards;

	for (let index = 0; index < length; index += 1) {
		const guard = guards[index];

		if (typeof guard !== 'function') {
			throw new TypeError(MESSAGE_ROUTE_GUARD_TYPE);
		}
	}
}

function visitRoute(this: InternalRoute, values?: PlainObject, query?: string | PlainObject): void {
	if (storage.router == null) {
		return;
	}

	const state = this[SYMBOL];
	const {parameters, search} = getQuery(query);

	let path: string;
	let params: PlainObject = {};

	if (state.pattern == null) {
		path = state.path.normalized;
	} else {
		[path, params] = getPath(state.path.normalized, values);

		if (!state.pattern.test({pathname: path})) {
			return;
		}
	}

	onVisit({
		path,
		state,
		push: true,
		query: parameters ?? {},
		route: this,
		router: storage.router,
		search: search ?? '',
		values: params,
	});
}

// #endregion
