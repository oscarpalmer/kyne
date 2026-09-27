import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {SYMBOL} from './constants';

// #region Types

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
};

export type RouteCallback = (event: RouterEvent) => void;

export type RouteState = {
	callback: RouteCallback;
	router?: InternalRouter;
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
	prefix: string;
};

export type RouterState = {
	route?: Route;
	routes: Route[];
	type: Type;
};

export type RouterEvent = {
	router: Router;
	query: PlainObject;
	values: PlainObject;
};

export type Storage = {
	routers: Set<InternalRouter>;
	routes: StorageRoutes;
};

type StorageRoutes = {
	keyed: Record<string, InternalRoute>;
	patterned: InternalRoute[];
};

export type Type = 'route' | 'router';

// #endregion
