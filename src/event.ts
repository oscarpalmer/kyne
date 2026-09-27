import type {GenericCallback, PlainObject} from '@oscarpalmer/atoms/models';
import {fromQuery} from '@oscarpalmer/atoms/query';
import {findAncestor} from '@oscarpalmer/toretto';
import {storage, SYMBOL} from './constants';
import {normalizePath} from './helpers';
import type {InternalRoute, OnRouteOptions, RouteState} from './models';

// #region Functions

export function onClick(event: Event): void {
	const anchor = findAncestor(event, 'a');

	if (anchor == null || anchor.origin !== window.location.origin) {
		return;
	}

	const {search} = anchor;

	onRoute(normalizePath(anchor.pathname), {
		event,
		search,
		query: fromQuery(search.slice(1)),
	});
}

function onNotFound(
	path: string,
	query: PlainObject,
	search: string,
	push: boolean,
	event?: Event,
): void {
	const {router} = storage;

	if (router == null || router[SYMBOL].notFound == null) {
		return;
	}

	event?.preventDefault();

	onPushState(path, {}, query, search, router[SYMBOL].notFound, push);
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

function onPushState(
	path: string,
	values: PlainObject,
	query: PlainObject,
	search: string,
	callback: GenericCallback,
	push: boolean,
	route?: InternalRoute,
): void {
	if (push) {
		window.history.pushState(
			{
				path,
				query,
				search,
			},
			'',
			`${path}${search}`,
		);
	}

	callback({
		path,
		query,
		route,
		values,
		router: storage.router,
	});
}

export function onRoute(path: string, options: OnRouteOptions): void {
	const {keyed, patterned} = storage.routes;

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

				break;
			}
		}
	}

	const query = options.query ?? {};
	const search = options.search ?? '';

	options.event?.preventDefault();

	if (route == null || routeState == null) {
		onNotFound(path, query, search, options.push ?? true, options.event);

		return;
	}

	options.event?.preventDefault();

	if (
		window.location.pathname === path &&
		window.location.search === search &&
		(options.push ?? true) &&
		!(options.initial ?? false)
	) {
		return;
	}

	if (routeState.guards != null) {
		const {length} = routeState.guards;

		for (let index = 0; index < length; index += 1) {
			const guard = routeState.guards[index];

			if (guard({path, query, route, values, router: storage.router}) === false) {
				return;
			}
		}
	}

	onPushState(path, values, query, search, routeState.callback, options.push ?? true, route);
}

// #endregion
