import {sort} from '@oscarpalmer/atoms/array/sort';
import {herald, type HeraldEvents} from '@oscarpalmer/atoms/herald';
import {fromQuery} from '@oscarpalmer/atoms/query';
import {on} from '@oscarpalmer/toretto/event';
import {
	events,
	MESSAGE_PATTERN,
	MESSAGE_ROUTE_PATH_EXISTS,
	MESSAGE_ROUTE_TYPE,
	MESSAGE_ROUTES,
	storedRoutes,
	SYMBOL,
	TYPE_ROUTER,
} from './constants';
import {onClick, onPopState, onRoute} from './event';
import {getOptions, normalizePath} from './helpers';
import {isPattern, isRoute} from './is';
import type {
	InternalRoute,
	InternalRouter,
	Route,
	Router,
	RouterEvents,
	RouterOptions,
} from './models';

// #region Instances

function Router(this: InternalRouter): void {
	this[SYMBOL] = {
		active: false,
		herald: herald({
			names: events,
		}),
		options: getOptions(),
		routes: [],
		type: TYPE_ROUTER,
	};
}

Router.prototype.set = setRoutes;
Router.prototype.start = startRouter;
Router.prototype.stop = stopRouter;

Object.defineProperties(Router.prototype, {
	active: {
		enumerable: true,
		get: getActive,
	},
	events: {
		enumerable: true,
		get: getEvents,
	},
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

/**
 * Used for destroying and resetting routers during testing
 *
 * @internal
 */
export function destroyRouter(): void {
	const state = internalRouter[SYMBOL];

	initialized = false;

	state.active = false;
	state.route = undefined;

	state.herald.clear();
	state.options = getOptions();
	state.routes.splice(0);

	storedRoutes.keyed = {};
	storedRoutes.patterned.splice(0);
}

function getActive(this: InternalRouter): boolean {
	return this[SYMBOL].active;
}

function getEvents(this: InternalRouter): HeraldEvents<RouterEvents> {
	return this[SYMBOL].herald.events;
}

function getRoute(this: InternalRouter): Route | undefined {
	return this[SYMBOL].route;
}

function getRoutes(this: InternalRouter): Route[] {
	return this[SYMBOL].routes.slice();
}

function initialize(): void {
	initialized = true;

	const {search} = window.location;

	const path = normalizePath(window.location.pathname);
	const query = fromQuery(search.slice(1));

	const full = search.length === 0 ? path : `${path}?${search}`;

	if (!evented) {
		evented = true;

		window.history.pushState(
			{
				path,
				query,
				search,
			},
			'',
			full,
		);

		on(document, 'click', onClick, {
			capture: true,
			passive: false,
		});

		window.addEventListener('popstate', onPopState);
	}

	onRoute(path, {
		query,
		search,
		initial: true,
		push: false,
	});
}

function setRoutes(this: InternalRouter, routes: Route[], options?: RouterOptions): void {
	validateRoutes(routes);

	const routerState = this[SYMBOL];

	routerState.options = getOptions(options);

	const {length} = routes;

	for (let index = 0; index < length; index += 1) {
		const route = routes[index] as InternalRoute;
		const routeState = route[SYMBOL];

		const path = normalizePath(`${routerState.options.prefix}${routeState.path.original}`);

		routeState.path.normalized = path;

		if (path in storedRoutes.keyed) {
			throw new Error(MESSAGE_ROUTE_PATH_EXISTS.replace(MESSAGE_PATTERN, routeState.path.original));
		}

		const pathIsPattern = isPattern(path);

		if (pathIsPattern) {
			routeState.pattern = new URLPattern({pathname: path});
		}

		routerState.routes.push(route);

		if (pathIsPattern) {
			storedRoutes.patterned.push(route);
		} else {
			storedRoutes.keyed[path] = route;
		}
	}

	sort(storedRoutes.patterned, route => route[SYMBOL].specificity, true);

	if (routerState.options.autostart) {
		startRouter.call(this);
	}
}

function startRouter(this: InternalRouter): void {
	const state = this[SYMBOL];

	if (state.active) {
		return;
	}

	state.active = true;

	if (!initialized) {
		initialize();
	}
}

function stopRouter(this: InternalRouter): void {
	this[SYMBOL].active = false;
}

function validateRoutes(value: unknown): asserts value is Route[] {
	if (!Array.isArray(value) || value.length === 0) {
		throw new TypeError(MESSAGE_ROUTES);
	}

	if (value.some(route => !isRoute(route))) {
		throw new TypeError(MESSAGE_ROUTE_TYPE);
	}
}

// #endregion

// #region Variables

// @ts-expect-error All good, no worries :-)
const internalRouter = new Router() as InternalRouter;

const router = internalRouter as Router;

let evented = false;

let initialized = false;

// #endregion

// #region Exports

export {internalRouter, router};

// #endregion
