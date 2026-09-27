import {fromQuery} from '@oscarpalmer/atoms/query';
import {findAncestor} from '@oscarpalmer/toretto';
import {storage, SYMBOL} from './constants';
import {normalizePath} from './helpers';
import type {OnRouteOptions, InternalRoute, InternalRouter, RouteState} from './models';

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

export function onRoute(path: string, options: OnRouteOptions): void {
	const {keyed, patterned} = storage.routes;

	let route: InternalRoute | undefined;
	let routeState: RouteState | undefined;
	let router: InternalRouter | undefined;

	if (path in keyed) {
		route = keyed[path];
		routeState = route[SYMBOL];
		router = routeState.router;
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
				router = state.router;
				values = match.pathname.groups;

				break;
			}
		}
	}

	for (const instance of storage.routers) {
		instance[SYMBOL].route = instance === router ? route : undefined;
	}

	if (route == null || routeState == null || router == null) {
		return;
	}

	options.event?.preventDefault();

	const search = options.search ?? '';

	if (
		window.location.pathname === path &&
		window.location.search === search &&
		(options.push ?? true) &&
		!(options.initial ?? false)
	) {
		return;
	}

	const query = options.query ?? {};

	if (options.push ?? true) {
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

	routeState.callback({
		router,
		query,
		values,
	});
}

// #endregion
