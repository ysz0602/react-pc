const path = require("path");
const { whenProd, getPlugin, pluginByName } = require("@craco/craco");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    // 配置CDN
    configure: (webpackConfig) => {
      let cdn = {
        js: [],
        css: [],
      };
      // 只有生产环境才配置
      whenProd(() => {
        webpackConfig.externals = {
          react: "React",
          "react-dom": "ReactDOM",
        };
        // 配置现成的CDN资源数组
        // 实际开发时 用公司自己的CDN服务器
        cdn = {
          js: [
            "https://cdn.bootcdn.net/ajax/libs/react/18.2.0/umd/react.production.min.js",
            "https://cdn.bootcdn.net/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
          ],
          css: [],
        };
      });

      // 配置HtmlWebpackPlugin插件用于注入到public/index.html
      const { isFound, match } = getPlugin(
        webpackConfig,
        pluginByName("HtmlWebpackPlugin")
      );
      if (isFound) {
        // 找到HtmlWebpackPlugin的插件
        match.userOptions.cdn = cdn;
      }
      return webpackConfig;
    },
  },
};
