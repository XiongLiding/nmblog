/**
  routes
  ======

  根据启动的是 Server 或 Client ，开启这里的不同功能

*/

'use strict';

var fs = require('fs');
var send = require('send');

module.exports = function (app) {

  /**
   getArticle
   ----------

   获得 article 指定的文章的内容

   ### 参数 ###

   - article `String` 文章名称，对应 _article_ 目录下的一个目录名称
   - fn `Function` 回调函数 `function (err, content)`

   ### 回调参数 ###

   - err `Error` 错误信息，成功时为 `null`
   - content `String` 指定文章的内容

  */
   
  function getArticle(article, fn) {
    // 文件名不能出现 `/`，以防非法访问
    if (article.indexOf('/') !== -1) {
      return fn(new Error('`/` is not allowed'));
    }

    // 列出目录下所有文件，以便找出命名匹配 article.* 的文件
    fs.readdir('./article/' + article, function (err, files) {
      if (err) {
        return fn(err);
      }

      for (var i = 0; i < files.length; i++) {

        // markdown 文件有多种后缀，找到第一个匹配 article.* 的文件进行渲染
        // 使用 \w 是为了防止匹配某些编辑器产生的临时文件，比如 vim 产生的 article.markdown~
        if (/^article\.\w*$/.test(files[i])) {
          console.log(files[i]);
          fs.readFile('./article/' + article + '/' + files[i], 'utf-8', function(err, content) {
            if (err) {
              return fn(err);
            }

            // 返回文章内容
            return fn(null, content);
          });
          return ; 
        }
      }

      // 没有匹配的文件，提示错误
      return fn(new Error('article.* not exist'));
    });
  }

  var routes = {};

  // 首页
  routes.index = function (req, res) {
    fs.readFile('./article/config.js', 'utf-8', function (err, string) {
      var config = JSON.parse(string);
      getArticle(config.index, function (err, content) {
        if (err) {
          content = err.message;
        }
        var matches = content.match(/^(.*)[\n\r]/);
        var title = matches ? matches[1].trim() : content;
        res.render('preview', {pageTitle: title, articleContent: content});
      });
    });
  };

  // 客户端预览
  routes.preview = function (req, res) {
    getArticle(req.params.article, function (err, content) {
      if (err) {
        content = err.message;
      }
      var matches = content.match(/^(.*)[\n\r]/);
      var title = matches ? matches[1].trim() : content;
      res.render('preview', {pageTitle: title, articleContent: content});
    });
  };

  function sendAttachment(article, attachment, req, res) {
    send(req, attachment).root('article/'+article+'/attachments').pipe(res);
  }

  // 依靠 Referer 识别附件
  routes.attachmentReferer = function (req, res) {
    var article = req.get('Referer').match(/\/([^\/]*)$/)[1];
    sendAttachment(article, req.params.attachment, req, res);
  };

  // 直接访问附件
  routes.attachmentDirect = function (req, res) {
    sendAttachment(req.params.article, req.params.attachment, req, res);
  };

  return routes;
};
