import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {fromQuery, toQuery} from '@oscarpalmer/atoms/query';
import {on} from '@oscarpalmer/toretto/event';
import {findAncestor} from '@oscarpalmer/toretto/find';
import {
	MESSAGE_PATTERN,
	MESSAGE_ROUTE_EXISTS,
	MESSAGE_ROUTE_TYPE,
	MESSAGE_ROUTES,
	SYMBOL,
} from './constants';
import type {
	HandleRouteOptions,
	InternalKyne,
	Kyne,
	Options,
	Route,
	Routes,
	Storage,
} from './models';

// #region Instances

function Kyne(this: any, routes: Routes, options: Options): void {
	this[SYMBOL] = {
		paths: [],
		patterns: [],
	};

	instances.add(this);

	setRoutes(this, routes, options);

	initializeHistory();
}

Object.defineProperties(Kyne.prototype, {
	route: {
		enumerable: true,
		get: getRoute,
	},
});

// #endregion

// #region Functions

function getOptions(input?: Partial<Options>): Options {
	const values = isPlainObject(input) ? input : {};

	return {
		prefix: normalizePath(typeof values.prefix === 'string' ? values.prefix : ''),
	};
}

function getRoute(this: InternalKyne): Route | undefined {
	return this[SYMBOL].route;
}

function handleClick(event: Event): void {
	const anchor = findAncestor(event, 'a');

	if (anchor == null || anchor.origin !== window.location.origin) {
		return;
	}

	const {search} = anchor;

	handleRoute(normalizePath(anchor.pathname), {
		event,
		search,
		query: fromQuery(search.slice(1)),
	});
}

function handlePopState(event: PopStateEvent): void {
	if ('path' in event.state) {
		const {path, query, search} = event.state;

		handleRoute(normalizePath(path), {
			push: false,
			query: query ?? {},
			search: search ?? '',
		});
	}
}

function handleRoute(path: string, options: HandleRouteOptions): void {
	let route: Route | undefined;

	if (path in storage.keyed) {
		route = storage.keyed[path];
	}

	let values = {};

	if (route == null) {
		for (const [pattern, item] of storage.mapped) {
			const match = pattern.exec({pathname: path});

			if (match != null) {
				route = item;
				values = match.pathname.groups;

				break;
			}
		}
	}

	for (const instance of instances) {
		const state = instance[SYMBOL];

		if (instance === route?.kyne) {
			state.route = route;
		} else {
			state.route = undefined;
		}
	}

	if (route == null) {
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

	route.callback({
		values,
		query,
		kyne: route.kyne,
	});
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

	on(document, 'click', handleClick, {
		capture: true,
		passive: false,
	});

	window.addEventListener('popstate', handlePopState);

	handleRoute(path, {
		query,
		search,
		initial: true,
		push: false,
	});
}

export function kyne(routes: Routes, options?: Partial<Options>): Kyne {
	validateRoutes(routes);

	// @ts-expect-error All good, no worries :-)
	return new Kyne(routes, getOptions(options)) as Kyne;
}

function normalizePath(path: string): string {
	const normalized = path.replaceAll(/(^\/+|\/+$)/g, '').replaceAll(/\/+/g, '/');

	return normalized.length === 0 ? '/' : `/${normalized}/`;
}

export function setQuery(value: string | PlainObject): void {
	let query: PlainObject | undefined;
	let search: string | undefined;

	if (typeof value === 'string') {
		query = fromQuery(value);
		search = toQuery(query);
	} else if (isPlainObject(value)) {
		query = value;
		search = toQuery(value);
	}

	if (query == null || search == null) {
		return;
	}

	const path = normalizePath(window.location.pathname);

	handleRoute(path, {
		query,
		search: `?${search}`,
	});
}

function setRoutes(kyne: InternalKyne, input: Routes, options: Options): void {
	const {paths, patterns} = kyne[SYMBOL];

	const keys = Object.keys(input);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const callback = input[key];

		const path = normalizePath(`${options.prefix}${key}`);

		if (path in storage.keyed) {
			throw new Error(MESSAGE_ROUTE_EXISTS.replace(MESSAGE_PATTERN, path));
		}

		const pattern = new URLPattern({pathname: path});
		const route: Route = {callback, kyne, path, pattern};

		paths.push(path);
		patterns.push(pattern);

		storage.keyed[path] = route;
		storage.mapped.set(pattern, route);
	}
}

function validateRoutes(input: unknown): asserts input is Routes {
	if (!isPlainObject(input)) {
		throw new TypeError(MESSAGE_ROUTES);
	}

	const keys = Object.keys(input);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const value = input[key];

		if (typeof value !== 'function') {
			throw new TypeError(MESSAGE_ROUTE_TYPE.replace(MESSAGE_PATTERN, key));
		}
	}
}

// #endregion

// #region Variables

const instances = new Set<InternalKyne>();

const storage: Storage = {
	keyed: {},
	mapped: new Map<URLPattern, Route>(),
};

let initialized = false;

// #endregion
