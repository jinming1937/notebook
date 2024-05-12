import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

function resolve(dir: string): string {
  return path.join(__dirname, '..', dir)
}

const config = {
  entry: {
    main: ['./src/css/base.less', './src/index.ts'],
    preview: ['./src/css/preview.less', './src/preview.ts'],
    link: ['./src/css/link.less', './src/link.ts'],
    map: ['./src/map.ts', './src/css/map.less'],
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
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
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
    }),
    new HtmlWebpackPlugin({
      filename: 'link.html',
      chunks: ['link'],
      template: './build/link.html',
    }),
    new HtmlWebpackPlugin({
      filename: 'map.html',
      chunks: ['map'],
      template: './build/map.html',
    }),
  ],
  devServer: {
    port: 9292,
    proxy:  {
      '/api': {
        target: `http://127.0.0.1:9960`,
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    },
  },
  mode: 'development',
};

export default config;
