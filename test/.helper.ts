export function resetHistory(): void {
	history.pushState({path: '/', query: {}, search: ''}, '', '/');
}
