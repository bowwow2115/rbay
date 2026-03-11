import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import { client } from '$services/redis';
import { usersKey, usernamesUniqueKey, usernamesKey } from '$services/keys';

export const getUserByUsername = async (username: string) => {
	//유저 이름을 고유한 집합에서 검색하여 존재 여부를 확인
	const decimalId = await client.zScore(usernamesKey(), username);
	if (!decimalId) {
		throw new Error('User does not exist');
	}
	//16진수로 저장된 아이디를 10진수로 변환하여 검색
	const id = decimalId.toString(16);
	return getUserById(id);
};

export const getUserById = async (id: string) => {
	const user = await client.hGetAll(usersKey(id));
	return deserialize(id, user);
};

export const createUser = async (attrs: CreateUserAttrs) => {
	const id = genId();
	const exists = await client.sIsMember(usernamesUniqueKey(), attrs.username);
	if (exists) {
		throw new Error('Username already exists');
	}
	//유저 정보를 해시로 저장
	await client.hSet(usersKey(id), serialize(attrs));
	//유저 이름을 고유한 집합에 추가하여 중복 체크에 사용
	await client.sAdd(usernamesUniqueKey(), attrs.username);
	//유저 아이디를 16진수로 변환하여 점수로 사용하여 zAdd에 추가
	await client.zAdd(usernamesKey(), { score: parseInt(id, 16), value: attrs.username });
	return id;
};

const serialize = (users: CreateUserAttrs) => {
	return {
		username: users.username,
		password: users.password
	};
};

const deserialize = (id: string, user: { [key: string]: string }) => {
	return {
		id,
		username: user.username,
		password: user.password
	};
};
