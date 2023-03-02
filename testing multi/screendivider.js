function list() {
	var a = arrayfromargs(arguments);
	const [counter, n] = a;
	const dividers = {
		0: [],
		1: [[0., 0., 1.]],
		2: [
			[0., 0.,1.],
			[0.5, 0.,1.],
		],
		3: [
			[0, 0,0.5],
			[0.5, 0,0.5],
			[0.25, 0.5,0.5],
		],
		4: [
			[0, 0],
			[0.5, 0],
			[0, 0.5],
			[0.5, 0.5],
		],
	};

	outlet(0, dividers[counter][n]);
}
