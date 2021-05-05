const path = require('path')
const tsLoader = [require.resolve("ts-loader")];
const rootNodeModules = path.resolve(__dirname, "../../../../node_modules")

if (process.env.USE_DOCGEN === "TRUE") tsLoader.push({
	loader: require.resolve("react-docgen-typescript-loader"),
	options: {
		tsconfigPath: "tsconfig.json"
	}
})

module.exports = ({ config }) => {
	config.module.rules.unshift(
		{
			test: /\.(ts|tsx)$/,
			exclude: /node_modules/,
			use: {
				loader: 'ts-loader',
				options: {
					transpileOnly: true
				}
			}
		},
	);
	
	config.resolve.extensions.unshift(".web.js", ".web.ts");

	config.resolve.alias = {
		'core-js/modules': path.resolve(rootNodeModules, 'core-js/modules'),
		'react-native$': path.resolve(rootNodeModules, 'react-native-web'),
		'@storybook/react-native': path.resolve(rootNodeModules, '@storybook/react'),
	};

	config.node = {
		fs: "empty"
	};

	return config;
};
