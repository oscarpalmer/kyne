const paths = [
	['', '/', false],
	['///', '/', false],
	['///this///is///a///path///', '/this/is/a/path/', false],
	['///*///*///*///', '/', true],
] as const;

const values = [
	null,
	undefined,
	true,
	123,
	123n,
	'hello, world!',
	[],
	{},
	() => {},
	new Map(),
	new Set(),
];

export const fixture = {
	paths: {
		length: paths.length,
		array: paths,
	},
	values: {
		length: values.length,
		array: values,
	},
};
