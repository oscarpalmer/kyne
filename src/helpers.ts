import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {GenericCallback, PlainObject} from '@oscarpalmer/atoms/models';
import {fromQuery, toQuery} from '@oscarpalmer/atoms/query';
import {
	CHARACTER_ASTERISK,
	CHARACTER_SLASH,
	EXPRESSION_INTEGER_PREFIX_PATTERN,
	EXPRESSION_INTEGER_PREFIX_REPLACEMENT,
	EXPRESSION_NORMALIZE_INSIDE,
	MESSAGE_OPTIONS_AUTOSTART,
	MESSAGE_OPTIONS_ERROR,
	MESSAGE_OPTIONS_PREFIX,
	SYMBOL,
	TRIM_SLASH,
} from './constants';
import {onRoute} from './event';
import type {RouteQuery, RouterOptions} from './models';
import {internalRouter} from './router';

// #region Functions

export function getOptions(input?: Partial<RouterOptions>): RouterOptions {
	const values = isPlainObject(input) ? input : {};

	if (values.autostart != null && typeof values.autostart !== 'boolean') {
		throw new TypeError(MESSAGE_OPTIONS_AUTOSTART);
	}

	if (values.prefix != null && typeof values.prefix !== 'string') {
		throw new TypeError(MESSAGE_OPTIONS_PREFIX);
	}

	if (values.error != null && typeof values.error !== 'function') {
		throw new TypeError(MESSAGE_OPTIONS_ERROR);
	}

	return {
		autostart: typeof values.autostart === 'boolean' ? values.autostart : true,
		error: values.error as GenericCallback,
		prefix: normalizePath(values.prefix ?? ''),
	};
}

export function getPath(pattern: string, input?: PlainObject): [string, PlainObject] {
	const values = isPlainObject(input) ? input : {};
	const keys = Object.keys(values);
	const {length} = keys;

	let path = pattern;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const value = values[key];

		if (key === CHARACTER_ASTERISK || EXPRESSION_INTEGER_PREFIX_PATTERN.test(key)) {
			path = path.replace(EXPRESSION_INTEGER_PREFIX_REPLACEMENT, String(value));
		} else {
			path = path.replace(`:${key}`, String(value));
		}
	}

	return [path, values];
}

export function getQuery(value?: string | PlainObject): RouteQuery {
	let parameters: PlainObject | undefined;
	let search: string | undefined;

	if (typeof value === 'string') {
		parameters = fromQuery(value);
		search = toQuery(parameters);
	} else if (isPlainObject(value)) {
		parameters = value;
		search = toQuery(value);
	}

	return {parameters, search};
}

export function normalizePath(path: string, removeWildcards?: boolean): string {
	let normalized = path;

	if (removeWildcards ?? false) {
		normalized = normalized.replaceAll(CHARACTER_ASTERISK, '');
	}

	normalized = normalizeSlashes(normalized);

	return normalized.length === 0
		? CHARACTER_SLASH
		: `${CHARACTER_SLASH}${normalized}${CHARACTER_SLASH}`;
}

function normalizeSlashes(path: string): string {
	let start = 0;
	let end = path.length;

	while (start < end && path.codePointAt(start) === TRIM_SLASH) {
		start += 1;
	}

	while (end > start && path.codePointAt(end - 1) === TRIM_SLASH) {
		end -= 1;
	}

	const trimmed = start === 0 && end === path.length ? path : path.slice(start, end);

	return trimmed.replaceAll(EXPRESSION_NORMALIZE_INSIDE, CHARACTER_SLASH);
}

export function redirect(path: string, query?: string | PlainObject): void {
	if (typeof path === 'string') {
		visit(query, path);
	}
}

export function setQuery(query: string | PlainObject): void {
	visit(query);
}

function visit(query?: string | PlainObject, path?: string): void {
	let {parameters, search} = getQuery(query);

	if (parameters == null && path != null) {
		parameters = {};
		search = '';
	}

	if (parameters != null && search != null) {
		const normalizedPath = normalizePath(
			path == null ? window.location.pathname : `${internalRouter[SYMBOL].options.prefix}${path}`,
		);

		onRoute(normalizedPath, {
			search,
			query: parameters,
		});
	}
}

// #endregion
