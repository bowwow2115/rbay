import { client } from '$services/redis';
import { itemsKey, userLikesKey } from '$services/keys';
import { getItems } from './items';

export const userLikesItem = async (itemId: string, userId: string) => {};

export const likedItems = async (userId: string) => {
	//유저 정보에서 좋아요한 아이템 목록 조회
	const ids = await client.sMembers(userLikesKey(userId));
	return getItems(ids);
};

export const likeItem = async (itemId: string, userId: string) => {
	const inserted = await client.sAdd(userLikesKey(userId), itemId); // 사용자 정보에 좋아요한 아이템 추가
	if (inserted) {
		return client.hIncrBy(itemsKey(itemId), 'likes', 1); // 아이템 정보에 좋아요 수 증가
	}
};

export const unlikeItem = async (itemId: string, userId: string) => {
	const removed = await client.sRem(userLikesKey(userId), itemId); // 사용자 정보에 좋아요한 아이템 추가
	if (removed) {
		return client.hIncrBy(itemsKey(itemId), 'likes', -1); // 아이템 정보에 좋아요 수 증가
	}
};

export const commonLikedItems = async (userOneId: string, userTwoId: string) => {
	const commonIds = await client.sInter([userLikesKey(userOneId), userLikesKey(userTwoId)]); // 두 사용자 정보에서 좋아요한 아이템 목록 조회
	return getItems(commonIds);
};
