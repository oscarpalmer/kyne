import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {SYMBOL} from './constants';

// #region Types

export type Guard = (event: GuardEvent) => boolean;

export type GuardEvent = {
	path: string;
	query: PlainObject;
	route: Route;
	router: Router;
	values: PlainObject;
};

export type InternalRoute = {
	[SYMBOL]: RouteState;
} & Route;

export type InternalRouter = {
	[SYMBOL]: RouterState;
} & Router;

export type OnRouteOptions = {
	event?: Event;
	initial?: boolean;
	push?: boolean;
	query: PlainObject;
	search: string;
};

export type Route = {
	get active(): boolean;
	visit(query?: string | PlainObject): void;
};

export type RouteCallback = (event: RouterEvent) => void;

export type RouteQuery = {
	parameters?: PlainObject;
	search?: string;
};

export type RouteState = {
	callback: RouteCallback;
	guards?: Guard[];
	path: RouteStatePath;
	pattern?: URLPattern;
	specificity: number;
	type: Type;
};

export type RouteStatePath = {
	normalized: string;
	original: string;
};

export type Router = {
	get route(): Route | undefined;
	get routes(): Route[];
};

export type RouterOptions = {
	notFound?: (event: RouterEvent) => void;
	prefix: string;
};

export type RouterState = {
	route?: Route;
	routes: Route[];
	type: Type;
} & RouterOptions;

export type RouterEvent = {
	path: string;
	query: PlainObject;
	route: Route;
	router: Router;
	values: PlainObject;
};

export type Storage = {
	router?: InternalRouter;
	routes: StorageRoutes;
};

type StorageRoutes = {
	keyed: Record<string, InternalRoute>;
	patterned: InternalRoute[];
};

export type Type = 'route' | 'router';

// #endregion
