import path from 'path';
import OptimizeCSSPlugin from 'optimize-css-assets-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { Configuration } from 'webpack';

// webpack 天生只理解JavaScript和JSON

function resolve(dir: string): string {
  return path.join(__dirname, '..', dir)
}

const config: Configuration = {
  context: path.resolve(__dirname, '../'),
  entry: {
    main: ['./src/index.ts'],
    preview: ['./src/preview.ts'],
    link: ['./src/link.ts'],
    map: ['./src/map.ts'],
  },
  output: {
    path: resolve('dist'),
    filename: 'static/[name].[chunkhash:8].js',
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
      {
        test: /\.css$/, use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { publicPath: "/static/img/" }
          },
          'css-loader'
        ]
      },
      {
        test: /\.less$/, use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { publicPath: "/static/img/" }
          }, 'css-loader', 'less-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        // use: [{options: { publicPath: "static/img/" }}]
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Notebook',
      minify: true,
      filename: 'index.html',
      chunks: ['main'],
      template: './build/index.html'
    }),
    new HtmlWebpackPlugin({
      title: 'preview',
      minify: true,
      filename: 'preview.html',
      chunks: ['preview'],
      template: './build/preview.html',
    }),
    new HtmlWebpackPlugin({
      title: 'search',
      minify: true,
      filename: 'link.html',
      chunks: ['link'],
      template: './build/link.html',
    }),
    new HtmlWebpackPlugin({
      title: 'map',
      minify: true,
      filename: 'map.html',
      chunks: ['map'],
      template: './build/map.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'static/[name].[chunkhash:8].css',
      chunkFilename: '[id].css'
    }),

    new OptimizeCSSPlugin(),
  ],
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true,
    // namedModules: true,
    // noEmitOnErrors: true
  }
};

export default config;
