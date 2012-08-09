/**
  routes
  ======

  根据启动的是 Server 或 Client ，开启这里的不同功能

*/

'use strict';

var fs = require('fs');
var send = require('send');
var async = require('async');
var needle = require('needle');

module.exports = function (app) {

  /**
    getArticle
    ----------

    获得 article 指定的文章的内容

    ### 参数 ###

    - article `String` 文章名称，对应 _article_ 目录下的一个目录名称
    - fn `Function` 回调函数 `function (err, content)`

    ### 回调 ###

    - err `Error` 错误信息，成功时为 `null`
    - content `String` 指定文章的内容

  */
   
  function getArticle(article, fn) {
    // 文件名不能出现 `/`，以防非法访问
    if (article.indexOf('/') !== -1) {
      return fn(new Error('`/` is not allowed'));
    }

    // 获取源文件的名称
    getSource(article, function(err, source) {
      if (err) {
        return fn(err);
      }

      // 成功取得名称则尝试获取其内容
      fs.readFile('./article/' + article + '/' + source, 'utf-8', function(err, content) {
        if (err) {
          return fn(err);
        }

        // 返回文件内容
        return fn(null, content);
      });
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

  /**
    getSource
    ---------

    得到源文件的文件名，源文件可以有多种后缀，所以名称为 article.* 的均可认为是源文件。
    此函数只返回第一个匹配的文件名

    ### 参数 ###

    - article `String` 文章名称，对应 _article_ 目录下的一个目录名称
    - fn `Function` 回调函数 `function (err, content)`

    ### 回调 ###

    - err `Error` 错误信息，成功时为 `null`
    - source `String` 源文件的文件名

  */

  function getSource(article, fn) {
    // 列出目录下所有文件，以便找出命名匹配 article.* 的文件
    fs.readdir('./article/' + article, function (err, files) {
      if (err) {
        return fn(err);
      }

      for (var i = 0; i < files.length; i++) {

        // markdown 文件有多种后缀，找到第一个匹配 article.* 的文件
        // 使用 \w 是为了防止匹配某些编辑器产生的临时文件，比如 vim 产生的 article.markdown~
        if (/^article\.\w*$/.test(files[i])) {
          return fn(null, files[i]);
        }
      }

      return fn(new Error('file not exist'));
    });
  }

  /**
    getAttachments
    --------------

    得到源文件的文件名，源文件可以有多种后缀，所以名称为 article.* 的均可认为是源文件。
    此函数只返回第一个匹配的文件名

    ### 参数 ###

    - article `String` 文章名称，对应 _article_ 目录下的一个目录名称
    - fn `Function` 回调函数 `function (err, files)`

    ### 回调 ###

    - err `Error` 错误信息，成功时为 `null`
    - files `Array` 附件的文件名组成的数组

  */

  function getAttachments(article, fn) {
    fs.readdir('./article/' + article + '/attachments', function (err, files) {
      if (err) {
        return fn(err);
      }

      return fn(null, files);
    });
  }

  routes.test = function (req, res) {
    getSource('nmblog', function (err, source) {
      res.end(source);
    });
  };

  routes.put = function (req, res) {
    var attachment_path = './article/' + req.params.article + '/attachments';
    fs.readdir(attachment_path, function (err, files) {
      async.mapSeries(files, fs.readFile, function (err, contents) {

      });
    });
    getArticle(req.params.article, function (err, content) {

    });
  };

  routes.get = function (req, res) {

  };

  return routes;
};
