// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
	rules: {
		'semi': ['error', 'always'],
		'@stylistic/semi': ['error', 'always'],

		'quotes': ['error', 'single'],
		'@stylistic/quotes': ['error', 'single'],

		'comma-dangle': ['error', 'never'],
		'@stylistic/comma-dangle': ['error', 'never'],

		'indent': ['error', 'tab'],
		'@stylistic/indent': ['error', 'tab'],
		'@stylistic/no-tabs': 'off',

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
		}]
	}
});
