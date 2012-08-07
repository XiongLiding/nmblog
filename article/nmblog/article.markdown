Node-Markdown-Blog
==================

获取本文的最新版本：<http://www.bnlt.org/nmblog>

## 特性介绍 ##

- 用流行的 markdown 语言编写日志
- 本地编辑，可以使用你最喜欢的编辑器
- 快速预览，刷新浏览器即可预览，免去 markdown 到 html 的手动转换
- 便捷同步，一键上传 markdown 主文件和图片等附件

## 快速入门 ##

执行 `node client.js` 启动客户端，用浏览器访问 `http://127.0.0.1:3000/nmblog`，即可看到本文。

在 article 目录下，你会看到一个名为 nmblog 的目录，里面的 article.markdown 就是本文的源代码。attachments 里则是图片等附件。

要建立另一篇日志，只需在 article 目录下建立一个新的目录，如 `another-article`，并在该目录下新建一个名为 article.markdown 的文件——也可以使用 .md 或 .mdown 等其他后缀。

编辑并保存 article.markdown 文件，用浏览器访问 `http://127.0.0.1:3000/nmblog` 预览效果。

## 部署到服务器 ##
