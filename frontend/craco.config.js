const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "crypto": require.resolve("crypto-browserify"),
          "stream": require.resolve("stream-browserify"),
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
          "zlib": require.resolve("browserify-zlib"),
          "url": require.resolve("url/"),
          "buffer": require.resolve("buffer/"),
          "process": require.resolve("process/browser"),
          "vm": false
        }
      },
      devtool: false
    },
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer']
        })
      ]
    }
  }
};