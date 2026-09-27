import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {fromQuery, toQuery} from '@oscarpalmer/atoms/query';
import {EXPRESSION_NORMALIZE_INSIDE, EXPRESSION_NORMALIZE_TRIM} from './constants';
import {onRoute} from './event';

// #region Functions

export function normalizePath(path: string): string {
	const normalized = path
		.replaceAll(EXPRESSION_NORMALIZE_TRIM, '')
		.replaceAll(EXPRESSION_NORMALIZE_INSIDE, '/');

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

	if (query != null && search != null) {
		onRoute(normalizePath(window.location.pathname), {
			query,
			search: `?${search}`,
		});
	}
}

// #endregion
