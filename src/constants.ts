import type {InternalRouter, Storage, Type} from './models';

// #region Variables

export const EXPRESSION_NORMALIZE_INSIDE: RegExp = /\/+/g;

export const EXPRESSION_NORMALIZE_TRIM: RegExp = /(^\/+|\/+$)/g;

export const EXPRESSION_URL_PATTERNS: RegExp[] = [
	// Named groups
	/:[\w]+/,
	// Wildcards
	/\*/,
	// Pattern groups
	/(?<!\\)\(.*\)/,
	// Group delimiters with modifiers
	/\{.*\}[?+*]/,
	// Group modifiers
	/:[\w]+[?+*]/,
];

export const MESSAGE_OPTIONS_NOT_FOUND = 'Not found-handler must be a function.';

export const MESSAGE_OPTIONS_PREFIX = 'Router prefix must be a string.';

export const MESSAGE_PATTERN = '<>';

export const MESSAGE_ROUTE_CALLBACK = 'Route callback must be a function.';

export const MESSAGE_ROUTE_GUARD_ARRAY = 'Guards must be an array of functions.';

export const MESSAGE_ROUTE_GUARD_TYPE = 'A guard must be a function.';

export const MESSAGE_ROUTE_PATH_EXISTS = "Route '<>' already exists.";

export const MESSAGE_ROUTE_PATH_TYPE = 'Route path must be a string.';

export const MESSAGE_ROUTE_TYPE = 'Route must be a Route.';

export const MESSAGE_ROUTER = 'A router has already been defined.';

export const MESSAGE_ROUTES = 'Routes must be an array of routes';

export const SYMBOL: symbol = Symbol('kyne');

export const TYPE_ROUTE: Type = 'route';

export const TYPE_ROUTER: Type = 'router';

export const instances: Set<InternalRouter> = new Set();

export const storage: Storage = {
	routes: {
		keyed: {},
		patterned: [],
	},
	router: undefined as never,
};

// #endregion
