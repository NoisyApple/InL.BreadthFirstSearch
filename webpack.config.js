const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  mode: "development",
  context: __dirname,
  entry: {
    app: ["./src/index.js"],
  },
  output: {
    path: path.resolve(__dirname, "build/"),
    filename: "bundle.js",
    publicPath: "./",
  },
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: ["pug-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.pug",
    }),
  ],
  devServer: {
    publicPath: "/server/",
    host: "192.168.100.136",
  },
};
