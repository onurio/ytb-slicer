function list() {
	var a = arrayfromargs(arguments);
	const [counter, n] = a;
	const dividers = {
		0: [],
		1: [[1., 0.]],
		2: [
			[0.5, 0.0],
			[0.5, 1.0],
		],
		3: [
			[0.3333, 0.0],
			[0.3333, 0.5],
			[0.3333, 1.],
		],
		4: [
			[0.25, 0.],
			[0.5, 0.333],
			[0, 0.666],
			[0.5, 1.],
		],
	};

	outlet(0, dividers[counter][n]);
}
