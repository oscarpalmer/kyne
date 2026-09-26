import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {SYMBOL} from './constants';

// #region Types

export type HandleRouteOptions = {
	event?: Event;
	initial?: boolean;
	push?: boolean;
	query: PlainObject;
	search: string;
};

export type InternalKyne = {
	[SYMBOL]: State;
} & Kyne;

export type Kyne = {
	get route(): Route | undefined;
};

export type KyneEvent = {
	kyne: Kyne;
	query: PlainObject;
	values: PlainObject;
};

export type Options = {
	prefix: string;
};

export type Route = {
	callback: RouteHandler;
	kyne: InternalKyne;
	path: string;
	pattern: URLPattern;
};

export type RouteHandler = (event: KyneEvent) => void;

export type Routes = Record<string, RouteHandler>;

export type State = {
	paths: string[];
	patterns: URLPattern[];
	route?: Route;
};

export type Storage = {
	keyed: Record<string, Route>;
	mapped: Map<URLPattern, Route>;
};

// #endregion
