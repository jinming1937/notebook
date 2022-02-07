import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';

const config = {
  entry: {
    main: ['./src/css/base.css', './src/index.ts'],
    preview: ['./src/css/preview.css', './src/preview.ts'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".js", '.css']
  },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.less$/, use: 'less-loader' }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['main'],
      template: './build/index.html'
    }),
    new HtmlWebpackPlugin({
      filename: 'preview.html',
      chunks: ['preview'],
      template: './build/preview.html',
    })
  ],
  mode: 'development',
};

export default config;
