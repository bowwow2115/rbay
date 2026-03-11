import type { CreateItemAttrs } from '$services/types';
import { client } from '$services/redis';
import { serialize } from './serialize';
import { genId } from '$services/utils';
import { itemsKey, itemsByViewsKey, itemsByEndingAtKey } from '$services/keys';
import { deserialize } from './deserialize';

export const getItem = async (id: string) => {
	const item = await client.hGetAll(itemsKey(id));

	return deserialize(id, item);
};

export const getItems = async (ids: string[]) => {
	const commands = ids.map((id) => client.hGetAll(itemsKey(id)));
	const results = await Promise.all(commands);
	return results.map((result, i) => deserialize(ids[i], result));
};

export const createItem = async (attrs: CreateItemAttrs, userId: string) => {
	const id = genId();
	const serialized = serialize(attrs);

	await Promise.all([
		client.hSet(itemsKey(id), serialized),
		//새로운 아이템을 생성할 때 조회수 정렬에 추가
		client.zAdd(itemsByViewsKey(), { score: 0, value: id })
	]);
	//새로운 아이템을 생성할 때 종료 시간 정렬에 추가
	await client.zAdd(itemsByEndingAtKey(), { score: attrs.endingAt.toMillis(), value: id });
	return id;
};
