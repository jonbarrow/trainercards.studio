// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: {
		enabled: false,
	},
	modules: [
		'@nuxt/eslint',
		'@nuxt/image',
		'@nuxt/scripts',
		'@nuxt/ui'
	],
	css: ['~/assets/css/main.css'],
	compatibilityDate: '2025-07-15',
	eslint: {
		config: {
			stylistic: true
		}
	},
	app: {
		head: {
			charset: 'utf-8',
			viewport: 'width=device-width, initial-scale=1',
			title: 'Trainer Cards Studio - Create Custom Pokemon Trainer Cards',
			titleTemplate: '%s | Trainer Cards Studio',
			meta: [
				// * Primary Meta Tags
				{ name: 'description', content: 'Create and customize custom Pokémon trainer cards.' },
				{ name: 'keywords', content: 'pokemon trainer cards, custom trainer cards, pokemon card creator, trainer card generator, pokemon trainer id, personalized pokemon cards' },
				{ name: 'robots', content: 'index, follow' },
				{ name: 'language', content: 'English' },
				{ name: 'revist-after', content: '7 days' },
				{ name: 'author', content: 'Jonathan Barrow' },

				// * Open Graph / Facebook
				{ property: 'og:type', content: 'website' },
				{ property: 'og:url', content: 'https://trainercards.studio/' },
				{ property: 'og:title', content: 'Trainer Cards Studio - Create Custom Pokemon Trainer Cards' },
				{ property: 'og:description', content: 'Create and customize custom Pokémon trainer cards.' },
				// { property: 'og:image', content: '' }, // TODO - Add this
				// { property: 'og:image:width', content: '' }, // TODO - Add this
				// { property: 'og:image:height', content: '' }, // TODO - Add this
				{ property: 'og:image:alt', content: 'Trainer Cards Studio - Pokemon Trainer Card Creator' },
				{ property: 'og:site_name', content: 'Trainer Cards Studio' },
				{ property: 'og:locale', content: 'en_US' },

				// * Twitter
				{ name: 'twitter:card', content: 'summary_large_image' },
				{ name: 'twitter:url', content: 'https://trainercards.studio/' },
				{ name: 'twitter:title', content: 'Trainer Cards Studio - Create Custom Pokemon Trainer Cards' },
				{ name: 'twitter:description', content: 'Create and customize custom Pokémon trainer cards.' },
				// { name: 'twitter:image', content: '' }, // TODO - Add this
				{ name: 'twitter:image:alt', content: 'Trainer Cards Studio - Pokemon Trainer Card Creator' },
				{ name: 'twitter:creator', content: '@jondbarrow' },
				{ name: 'twitter:site', content: '@jondbarrow' },

				// * Additional Meta Tags
				{ name: 'theme-color', content: '#0F172B' }
			],
			link: [
				{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
				{ rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
				{ rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
				{ rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
				{ rel: 'manifest', href: '/site.webmanifest' },

				{ rel: 'canonical', href: 'https://trainercards.studio/' }
			]
		}
	}
});
