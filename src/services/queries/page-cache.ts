const cacheRoutes = ['/about', '/privacy', '/auth/signin', '/auth/signup'];

export const getCachedPage = (route: string) => {
	if (cacheRoutes.includes(route)) {
		// Return cached page content
	}
};

export const setCachedPage = (route: string, page: string) => {};
