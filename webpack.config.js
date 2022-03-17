import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
  entry: { main: './src/index.js' },
  mode: process.env.NODE_ENV || 'development',
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
  ],
};
