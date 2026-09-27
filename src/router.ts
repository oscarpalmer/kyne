import {isPlainObject} from '@oscarpalmer/atoms/is';
import {fromQuery} from '@oscarpalmer/atoms/query';
import {on} from '@oscarpalmer/toretto/event';
import {
	MESSAGE_PATTERN,
	MESSAGE_ROUTE_EXISTS,
	MESSAGE_ROUTE_PATH_EXISTS,
	MESSAGE_ROUTE_TYPE,
	MESSAGE_ROUTES,
	storage,
	SYMBOL,
	TYPE_ROUTER,
} from './constants';
import {onClick, onPopState, onRoute} from './event';
import {normalizePath} from './helpers';
import {isPattern, isRoute} from './is';
import type {InternalRoute, InternalRouter, RouterOptions, Route, Router} from './models';
import {sort} from '@oscarpalmer/atoms/array/sort';

// #region Instances

function Router(this: any, routes: Route[], options: RouterOptions): void {
	this[SYMBOL] = {
		routes: [],
		type: TYPE_ROUTER,
	};

	storage.routers.add(this);

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

	return {
		prefix: normalizePath(typeof values.prefix === 'string' ? values.prefix : ''),
	};
}

function getRoute(this: InternalRouter): Route | undefined {
	return this[SYMBOL].route;
}

function getRoutes(this: InternalRouter): Route[] {
	return this[SYMBOL].routes;
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

		routeState.router = router;

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

		const state = (route as InternalRoute)[SYMBOL];

		if (state?.router != null) {
			throw new Error(MESSAGE_ROUTE_EXISTS);
		}
	}
}

// #endregion

// #region Variables

let initialized = false;

// #endregion
