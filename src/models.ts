import type {Herald, HeraldEvents} from '@oscarpalmer/atoms/herald';
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

export type RouteCallback = (event: RouterChangeEvent) => void;

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
	readonly active: boolean;
	readonly events: HeraldEvents<RouterEvents>;
	get route(): Route | undefined;
	get routes(): Route[];
	start(): void;
	stop(): void;
};

export type RouterChangeEvent = {
	path: string;
	query: PlainObject;
	route: Route;
	router: Router;
	values: PlainObject;
};

export type RouterErrorEvent = {
	path: string;
	query: PlainObject;
	route?: Route;
	router: Router;
};

export type RouterEventType = 'change' | 'error';

export type RouterEvents = {
	change(event: RouterChangeEvent): void;
	error(event: RouterErrorEvent): void;
};

export type RouterOptions = {
	autostart: boolean;
	error: (event: RouterErrorEvent) => void;
	prefix: string;
};

export type RouterState = {
	active: boolean;
	herald: Herald<RouterEvents>;
	route?: Route;
	routes: Route[];
	type: Type;
} & RouterOptions;

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
