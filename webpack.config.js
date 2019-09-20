const HtmlWebpackPlugin = require('html-webpack-plugin');

const Port = process.env.Port || 3000;

module.exports = {
  devServer: {
    contentBase: './dist',
    open: true,
    port: Port,
    compress: true,
    publicPath: '/',
    historyApiFallback: true,
    // headers: {
    //   'Access-Control-Allow-Origin': '*',
    //   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    //   'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    // },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.html/,
        use: {
          loader: 'html-loader',
        },
      },
      {
        test: /\.s[ac]ss/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'react-svg-loader',
            options: {
              jsx: true, // true outputs JSX tags
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'url-loader',
          // options: {
          //   limit: 25000,
          // },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
};
