// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
	rules: {
		'nuxt/nuxt-config-keys-order': 'off',

		'semi': ['error', 'always'],
		'@stylistic/semi': ['error', 'always'],

		'quotes': ['error', 'single'],
		'@stylistic/quotes': ['error', 'single'],

		'comma-dangle': ['error', 'never'],
		'@stylistic/comma-dangle': ['error', 'never'],

		'indent': ['error', 'tab', { SwitchCase: 1 }],
		'@stylistic/indent': ['error', 'tab', { SwitchCase: 1 }],
		'@stylistic/no-tabs': 'off',
		'vue/html-indent': ['error', 'tab'],
		'vue/script-indent': ['error', 'tab'],

		'@stylistic/eol-last': ['error', 'always'],
		'@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],

		'no-restricted-imports': ['error', {
			patterns: [{
				group: ['~/*'],
				message: 'Use @/ instead of ~/ for local imports'
			}]
		}],

		'@stylistic/member-delimiter-style': ['error', {
			multiline: {
				delimiter: 'semi',
				requireLast: true
			},
			singleline: {
				delimiter: 'semi',
				requireLast: false
			}
		}],

		'vue/max-attributes-per-line': 'off',
		'vue/singleline-html-element-content-newline': 'off'
	}
});
