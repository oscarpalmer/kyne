import {sort} from '@oscarpalmer/atoms/array/sort';
import {isPlainObject} from '@oscarpalmer/atoms/is';
import {fromQuery} from '@oscarpalmer/atoms/query';
import {on} from '@oscarpalmer/toretto/event';
import {
	MESSAGE_OPTIONS_NOT_FOUND,
	MESSAGE_OPTIONS_PREFIX,
	MESSAGE_PATTERN,
	MESSAGE_ROUTE_PATH_EXISTS,
	MESSAGE_ROUTE_TYPE,
	MESSAGE_ROUTER,
	MESSAGE_ROUTES,
	storage,
	SYMBOL,
	TYPE_ROUTER,
} from './constants';
import {onClick, onPopState, onRoute} from './event';
import {normalizePath} from './helpers';
import {isPattern, isRoute} from './is';
import type {InternalRoute, InternalRouter, Route, Router, RouterOptions} from './models';

// #region Instances

function Router(this: any, routes: Route[], options: RouterOptions): void {
	this[SYMBOL] = {
		...options,
		routes: [],
		type: TYPE_ROUTER,
	};

	storage.router = this;

	setRoutes(this, routes, options);

	initializeHistory();
}

Object.defineProperties(Router.prototype, {
	route: {
		enumerable: true,
		get: getRoute,
	},
	routes: {
		enumerable: true,
		get: getRoutes,
	},
});

// #endregion

// #region Functions

function getOptions(input?: Partial<RouterOptions>): RouterOptions {
	const values = isPlainObject(input) ? input : {};

	if (values.prefix != null && typeof values.prefix !== 'string') {
		throw new TypeError(MESSAGE_OPTIONS_PREFIX);
	}

	if (values.notFound != null && typeof values.notFound !== 'function') {
		throw new TypeError(MESSAGE_OPTIONS_NOT_FOUND);
	}

	return {
		notFound: values.notFound,
		prefix: normalizePath(values.prefix ?? ''),
	};
}

function getRoute(this: InternalRouter): Route | undefined {
	return this[SYMBOL].route;
}

function getRoutes(this: InternalRouter): Route[] {
	return this[SYMBOL].routes.slice();
}

function initializeHistory(): void {
	if (initialized) {
		return;
	}

	initialized = true;

	const {search} = window.location;

	const path = normalizePath(window.location.pathname);
	const query = fromQuery(search.slice(1));

	window.history.pushState(
		{
			path,
			query,
			search,
		},
		'',
		`${path}${search}`,
	);

	on(document, 'click', onClick, {
		capture: true,
		passive: false,
	});

	window.addEventListener('popstate', onPopState);

	onRoute(path, {
		query,
		search,
		initial: true,
		push: false,
	});
}

export function router(routes: Route[], options?: Partial<RouterOptions>): Router {
	if (storage.router != null) {
		throw new Error(MESSAGE_ROUTER);
	}

	validateRoutes(routes);

	// @ts-expect-error All good, no worries :-)
	return new Router(routes, getOptions(options)) as Router;
}

function setRoutes(router: InternalRouter, routes: Route[], options: RouterOptions): void {
	const routerState = router[SYMBOL];

	const {length} = routes;

	for (let index = 0; index < length; index += 1) {
		const route = routes[index];
		const routeState = (route as InternalRoute)[SYMBOL];

		const path = normalizePath(`${options.prefix}${routeState.path.original}`);

		routeState.path.normalized = path;

		if (path in storage.routes.keyed) {
			throw new Error(MESSAGE_ROUTE_PATH_EXISTS.replace(MESSAGE_PATTERN, routeState.path.original));
		}

		const pathIsPattern = isPattern(path);

		if (pathIsPattern) {
			routeState.pattern = new URLPattern({pathname: path});
		}

		routerState.routes.push(route);

		if (pathIsPattern) {
			storage.routes.patterned.push(route);
		} else {
			storage.routes.keyed[path] = route;
		}
	}

	sort(storage.routes.patterned, route => route[SYMBOL].specificity, true);
}

function validateRoutes(input: unknown): asserts input is Route[] {
	if (!Array.isArray(input) || input.length === 0) {
		throw new TypeError(MESSAGE_ROUTES);
	}

	const {length} = input;

	for (let index = 0; index < length; index += 1) {
		const route = input[index];

		if (!isRoute(route)) {
			throw new TypeError(MESSAGE_ROUTE_TYPE);
		}
	}
}

// #endregion

// #region Variables

let initialized = false;

// #endregion
