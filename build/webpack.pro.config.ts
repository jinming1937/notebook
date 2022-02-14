import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

// webpack 天生只理解JavaScript和JSON

function resolve(dir: string): string {
  return path.join(__dirname, '..', dir)
}

const config = {
  entry: {
    main: ['./src/css/base.less', './src/index.ts'],
    preview: ['./src/css/preview.less', './src/preview.ts'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  resolve: {
    alias: {
      '@': resolve('src')
    },
    extensions: [".ts", ".js", '.css', '.less']
  },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader' },
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
      { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] }
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
  mode: 'production',
};

export default config;
