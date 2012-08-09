$(document).ready(function() {
  $('#text pre').addClass('prettyprint');
  prettyPrint();
});

function put(article) {
  $.post('/put/'+article);
}
