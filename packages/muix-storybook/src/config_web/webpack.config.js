const path = require('path')
const tsLoader = [require.resolve("ts-loader")];
const rootNodeModules = path.resolve(__dirname, "../../../../node_modules")

if (process.env.USE_DOCGEN === "TRUE") tsLoader.push({
	loader: require.resolve("react-docgen-typescript-loader"),
	options: {
		tsconfigPath: "tsconfig.json"
	}
})

module.exports = {
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							transpileOnly: true
						}
					}
				]
			}
		]
	},
	resolve: {
		extensions: [".ts", ".tsx"],
		alias: {
			'core-js/modules': path.resolve(rootNodeModules, 'core-js/modules'),
			'react-native$': path.resolve(rootNodeModules, 'react-native-web'),
			'@storybook/react-native': path.resolve(rootNodeModules, '@storybook/react'),	
		}
	},
	node: {
		fs: "empty"
	}
}

