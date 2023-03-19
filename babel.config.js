module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // NOTE: `expo-router/babel` is a temporary extension to `babel-preset-expo`.
            '@babel/plugin-proposal-export-namespace-from',
            'react-native-reanimated/plugin',
            require.resolve('expo-router/babel')
        ]
    };
};
