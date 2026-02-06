import 'dotenv/config';
import { client } from '../src/services/redis';

const run = async () => {
	await client.del('car'); // Delete the old key first
	await client.hSet('car', {
		color: 'red',
		year: 1950
	});

	const car = await client.hGetAll('car');

	console.log(car);
};
run();
