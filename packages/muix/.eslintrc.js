module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint/eslint-plugin',
        'react',
        'react-native',
    ],
    parserOptions: {
        "ecmaFeatures": {
            "jsx": true,
        }
    },
    env: {
        "browser": true,
        "react-native/react-native": true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ]
}