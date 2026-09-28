import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {fromQuery, toQuery} from '@oscarpalmer/atoms/query';
import {EXPRESSION_NORMALIZE_INSIDE, EXPRESSION_NORMALIZE_TRIM, storage, SYMBOL} from './constants';
import {onRoute} from './event';
import type {RouteQuery} from './models';

// #region Functions

export function getPath(pattern: string, input?: PlainObject): [string, PlainObject] {
	const values = isPlainObject(input) ? input : {};
	const keys = Object.keys(values);
	const {length} = keys;

	let path = pattern;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const value = values[key];

		if (/^\d+/.test(key)) {
			path = path.replace(/\*|\(.*?\)/, String(value));
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

export function normalizePath(path: string): string {
	const normalized = path
		.replaceAll(EXPRESSION_NORMALIZE_TRIM, '')
		.replaceAll(EXPRESSION_NORMALIZE_INSIDE, '/');

	return normalized.length === 0 ? '/' : `/${normalized}/`;
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
	if (storage.router == null) {
		return;
	}

	let {parameters, search} = getQuery(query);

	if (parameters == null && path != null) {
		parameters = {};
		search = '';
	}

	if (parameters != null && search != null) {
		const normalizedPath = normalizePath(
			path == null ? window.location.pathname : `${storage.router[SYMBOL].prefix}${path}`,
		);

		onRoute(normalizedPath, {
			query: parameters,
			search: search.length > 0 ? `?${search}` : '',
		});
	}
}

// #endregion
