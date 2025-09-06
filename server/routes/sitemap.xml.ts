import { SitemapStream, streamToPromise } from 'sitemap';

export default eventHandler(async (event) => {
	const documents = await queryCollection(event, 'content').all();
	const sitemap = new SitemapStream({
		hostname: 'https://trainercards.studio'
	});

	sitemap.write({
		url: '/',
		changefreq: 'daily',
		priority: 0.9
	});

	for (const document of documents) {
		sitemap.write({
			url: document.path,
			changefreq: 'monthly',
			priority: 0.1
		});
	}
	sitemap.end();

	return streamToPromise(sitemap);
});
