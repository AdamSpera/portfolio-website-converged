function loadDoc(doc) {
  $('#home').hide();
  $('#docs').show();

  $.ajax({
    url: "/documentation/" + encodeURIComponent(doc) + ".md",
    dataType: "text",
    success: function (result) {
      var converter = new showdown.Converter();
      var html = converter.makeHtml(result);
      $('#docs').append(html);
      $('#docs').find('h1, h2, h3, h4, h5, h6').addClass('heading');
      $('#docs').find('h1, h2, h3, h4, h5, h6').after('<hr>');
      // $('#docs').find('hr:first').after('<br>');
    }
  });
}

function populateDocs(result) {
  var fileNames = result.map(function (file) {
    return file.name;
  });

  var docsElement = $(".docs");
  docsElement.empty();

  fileNames.forEach(function (fileName) {
    var splitName = fileName.split(' ');
    var topics = splitName[0];
    var name = splitName.slice(1).join(' ').replace('.md', '');

    // Remove the tags from the name
    name = name.replace(/\[.*?\]/g, '').trim();

    var link = $("<a href='#' data-topic='" + topics + "'>" + name + "</a>");
    link.click(function (e) {
      e.preventDefault();
      window.history.pushState({}, '', '?doc=' + encodeURIComponent(topics + " " + name));
      loadDoc(topics + " " + name);
    });

    docsElement.append("- ").append(link).append("<br>");
  });
}

function filterByTopic(topic) {
  $(event.target).toggleClass('active');

  var activeTopics = $('.toggle-button.active').map(function () {
    return $(this).text()[0];
  }).get();

  $('.docs a').each(function () {
    var linkTopics = $(this).attr('data-topic');
    var isActive = activeTopics.some(function (activeTopic) {
      return linkTopics.includes(activeTopic);
    });

    if (activeTopics.length > 0) {
      $(this).toggleClass('grey-out', !isActive);
    } else {
      $(this).removeClass('grey-out');
    }
  });

  console.log(activeTopics);
}