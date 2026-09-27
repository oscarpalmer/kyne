import {MESSAGE_ROUTE_CALLBACK, MESSAGE_ROUTE_PATH_TYPE, SYMBOL, TYPE_ROUTE} from './constants';
import type {InternalRoute, Route, RouteCallback} from './models';

// #region Instances

function Route(this: any, path: string, callback: RouteCallback): void {
	this[SYMBOL] = {
		callback,
		path: {
			normalized: path,
			original: path,
		},
		specificity: getRouteSpecificity(path),
		type: TYPE_ROUTE,
	};
}

Object.defineProperties(Route.prototype, {
	active: {
		enumerable: true,
		get: getRouteActive,
	},
});

// #endregion

// #region Functions

function getRouteActive(this: InternalRoute): boolean {
	return this[SYMBOL].router?.route === this;
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

export function route(path: string, callback: RouteCallback): Route {
	if (typeof path !== 'string') {
		throw new TypeError(MESSAGE_ROUTE_PATH_TYPE);
	}

	if (typeof callback !== 'function') {
		throw new TypeError(MESSAGE_ROUTE_CALLBACK);
	}

	// @ts-expect-error All good, no worries :-)
	return new Route(path, callback) as Route;
}

// #endregion
