import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';

// webpack 天生只理解JavaScript和JSON

const config = {
  entry: {
    main: './src/index.ts',
    // preview: './src/preview.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  resolve: {
    // Add `.ts` and `.css` as a resolvable extension.
    extensions: [".ts", ".js", '.css']
  },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader' },
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
      { test: /\.less$/, use: 'less-loader' }
    ],
  },
  plugins: [new HtmlWebpackPlugin({ template: './build/index.html' })],
  mode: 'production',
};

export default config;
