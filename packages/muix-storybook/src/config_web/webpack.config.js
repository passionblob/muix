const path = require('path')
const tsLoader = [require.resolve("ts-loader")];

if(process.env.USE_DOCGEN === "TRUE") tsLoader.push({
    loader: require.resolve("react-docgen-typescript-loader"),
    options: {
        tsconfigPath: "tsconfig.json"
    }
})

module.exports = ({ config }) => {
    config.module.rules.push(
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
    );
    config.resolve.extensions.push(".ts", ".tsx");
    config.resolve.alias = {
        'core-js/modules': path.resolve(__dirname, '../../node_modules/core-js/modules'),
        'react': path.resolve(__dirname, '../../node_modules/react'),
        'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
        'react-native$': path.resolve(__dirname, '../../node_modules/react-native-web'),
        "@monthem/muix": path.resolve(__dirname, "../../../muix-components/src"),
        '@storybook/react-native': '@storybook/react',
        "styled-components/native": "styled-components",
    };
    config.node = {
        fs: "empty"
    };
    return config;
};
