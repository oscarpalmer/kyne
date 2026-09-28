import type {GenericCallback, PlainObject} from '@oscarpalmer/atoms/models';
import {fromQuery} from '@oscarpalmer/atoms/query';
import {findAncestor} from '@oscarpalmer/toretto';
import {storage, SYMBOL} from './constants';
import {normalizePath} from './helpers';
import type {InternalRoute, InternalRouter, OnRouteOptions, Route, RouteState} from './models';

// #region Types

type OnVisitParameters = {
	initial?: boolean;
	path: string;
	push: boolean;
	query: PlainObject;
	route: Route;
	router: InternalRouter;
	search: string;
	state: RouteState;
	values: PlainObject;
};

type PushStateParameters = {
	callback: GenericCallback;
	path: string;
	push: boolean;
	query: PlainObject;
	route?: InternalRoute;
	router: InternalRouter;
	search: string;
	values: PlainObject;
};

// #endregion

// #region Functions

export function onClick(event: Event): void {
	const anchor = findAncestor(event, 'a');

	if (anchor == null || anchor.origin !== window.location.origin) {
		return;
	}

	const {search} = anchor;
	const query = fromQuery(search.slice(1));

	onRoute(normalizePath(anchor.pathname), {event, search, query});
}

function onNotFound(
	path: string,
	query: PlainObject,
	search: string,
	push: boolean,
	event?: Event,
): void {
	const {router} = storage;
	const callback = router?.[SYMBOL].notFound;

	if (router == null || callback == null) {
		return;
	}

	event?.preventDefault();

	onPushState({callback, path, push, query, router, search, values: {}});
}

export function onPopState(event: PopStateEvent): void {
	if ('path' in event.state) {
		const {path, query, search} = event.state;

		onRoute(normalizePath(path), {
			push: false,
			query: query ?? {},
			search: search ?? '',
		});
	}
}

function onPushState(parameters: PushStateParameters): void {
	const {callback, path, push, query, search, route, router, values} = parameters;

	if (push) {
		window.history.pushState(
			{path, query, search},
			'',
			`${path}${search.length === 0 ? '' : `?${search}`}`,
		);
	}

	callback({path, query, route, router, values});
}

export function onRoute(path: string, options: OnRouteOptions): void {
	const {router, routes} = storage;

	if (router == null) {
		return;
	}

	const {keyed, patterned} = routes;

	let route: InternalRoute | undefined;
	let routeState: RouteState | undefined;

	if (path in keyed) {
		route = keyed[path];
		routeState = route[SYMBOL];
	}

	let values = {};

	if (route == null) {
		const {length} = patterned;

		for (let index = 0; index < length; index += 1) {
			const item = patterned[index];
			const state = item[SYMBOL];
			const match = state.pattern?.exec({pathname: path});

			if (match != null) {
				route = item;
				routeState = state;
				values = match.pathname.groups;

				console.log(match);

				break;
			}
		}
	}

	const push = options.push ?? true;
	const query = options.query ?? {};
	const search = options.search ?? '';

	options.event?.preventDefault();

	if (route == null || routeState == null) {
		onNotFound(path, query, search, push, options.event);

		return;
	}

	options.event?.preventDefault();

	onVisit({
		path,
		push,
		query,
		route,
		router,
		search,
		values,
		initial: options.initial,
		state: routeState,
	});
}

export function onVisit(parameters: OnVisitParameters): void {
	const {initial, path, push, query, route, router, search, state, values} = parameters;

	if (
		window.location.pathname === path &&
		window.location.search === search &&
		push &&
		!(initial ?? false)
	) {
		return;
	}

	if (state.guards != null) {
		const {length} = state.guards;

		for (let index = 0; index < length; index += 1) {
			const guard = state.guards[index];

			if (guard({path, query, route, router, values}) === false) {
				return;
			}
		}
	}

	onPushState({path, push, query, search, route, router, values, callback: state.callback});
}

// #endregion
