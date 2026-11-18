import type {RouterEventType, StoredRoutes, Type} from './models';

// #region Variables

export const CHARACTER_ASTERISK = '*';

export const CHARACTER_COLON = ':';

export const CHARACTER_SLASH = '/';

export const EXPRESSION_INTEGER_PREFIX_PATTERN: RegExp = /^\d+/;

export const EXPRESSION_INTEGER_PREFIX_REPLACEMENT: RegExp = /\*|\([^()]*\)/;

export const EXPRESSION_INVALID_PATH: RegExp = /(:|\([^()]*\))/;

export const EXPRESSION_NORMALIZE_INSIDE: RegExp = /\/+/g;

export const EXPRESSION_URL_PATTERNS: RegExp[] = [
	// Named groups
	/:\w/,
	// Wildcards
	/\*/,
	// Pattern groups
	/(?<!\\)\([^()]*\)/,
	// Group delimiters with modifiers
	/\{[^{}]*\}[?+*]/,
];

export const EVENT_CHANGE = 'change';

export const EVENT_ERROR = 'error';

export const MESSAGE_OPTIONS_AUTOSTART = 'Autostart option must be a boolean.';

export const MESSAGE_OPTIONS_ERROR = 'Error handler must be a function.';

export const MESSAGE_OPTIONS_PREFIX = 'Router prefix must be a string.';

export const MESSAGE_PATTERN = '<>';

export const MESSAGE_ROUTE_CALLBACK = 'Route callback must be a function.';

export const MESSAGE_ROUTE_GUARD_ARRAY = 'Guards must be an array of functions.';

export const MESSAGE_ROUTE_GUARD_TYPE = 'A guard must be a function.';

export const MESSAGE_ROUTE_PATH_EXISTS = "Route '<>' already exists.";

export const MESSAGE_ROUTE_PATH_TYPE = 'Route path must be a string.';

export const MESSAGE_ROUTE_TYPE = 'Route must be a Route.';

export const MESSAGE_ROUTE_VALUES = 'Route wildcard(s) must be specified.';

export const MESSAGE_ROUTES = 'Routes must be an array of routes';

export const PROPERTY_PATH = 'path';

export const SYMBOL: unique symbol = Symbol('kyne');

export const TAG_ANCHOR = 'a';

export const TRIM_SLASH = CHARACTER_SLASH.codePointAt(0) as number;

export const TYPE_ROUTE: Type = 'route';

export const TYPE_ROUTER: Type = 'router';

export const events: RouterEventType[] = [EVENT_CHANGE, EVENT_ERROR];

export const storedRoutes: StoredRoutes = {
	keyed: {},
	patterned: [],
};

// #endregion
