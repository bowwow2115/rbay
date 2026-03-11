import { client } from '$services/redis';
import { itemsByViewsKey, itemsKey } from '$services/keys';

export const incrementView = async (itemId: string, userId: string) => {
	return Promise.all([
		//아이템의 조회수를 해시에서 1 증가
		client.hIncrBy(itemsKey(itemId), 'views', 1),
		//조회수 정렬에서도 1 증가
		client.zIncrBy(itemsByViewsKey(), 1, itemId)
	]);
};
