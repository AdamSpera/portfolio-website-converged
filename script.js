$(window).on('popstate', function () {
  var params = new URLSearchParams(window.location.search);
  var doc = params.get('doc');

  if (!doc) {
    $('#docs').empty().hide();
    $('#home').show();
    $(document).prop('title', 'Adam Spera | Home');
  } else {
    loadDoc(doc);
  }
});

$(document).ready(function () {
  $("#header-section").load("includes/header.html");
  $("#footer-section").load("includes/footer.html");

  var lastRequestTime = localStorage.getItem('lastRequestTime');
  var currentTime = new Date().getTime();

  if (lastRequestTime && currentTime - lastRequestTime < 24 * 60 * 60 * 1000) {
    // less than a day has passed since the last request, use cached data
    var result = JSON.parse(localStorage.getItem('cachedData'));
    console.log('Using cached documentation data:', result);
    populateDocs(result);
  } else {
    // a day or more has passed since the last request, make a new request
    $.ajax({
      url: "https://api.github.com/repos/adamspera/adamspera.dev/contents/documentation",
      cache: true,
      success: function (result) {
        console.log('Successfully fetched documentation data:', result);
        // store the time of the request and the data in localStorage
        localStorage.setItem('lastRequestTime', currentTime);
        localStorage.setItem('cachedData', JSON.stringify(result));
        populateDocs(result);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error('Error making AJAX request to /documentation:', textStatus, errorThrown);
      }
    });
  }

  var params = new URLSearchParams(window.location.search);
  var doc = params.get('doc');

  if (doc) {
    loadDoc(doc);
  }

  $('.category-button').click(function() {
    // Hide all sections
    $('#Articles').hide();
    $('#Projects').hide();
    $('#Certifications').hide();

    // Remove active class from all buttons
    $('.category-button').removeClass('active');

    // Add active class to the clicked button
    $(this).addClass('active');

    // Show the selected section
    var category = $(this).text();
    $('#' + category).show();
  });

});

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

      // Change the page title to the name of the file
      $(document).prop('title', doc.split('] ')[1].split('.md')[0]);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('Error making AJAX request to /documentation:', textStatus, errorThrown);
    }
  });
}

function populateDocs(result) {
  var fileNames = result.map(function (file) {
    return file.name;
  })

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

function expandSearch() {
  var searchBar = $('#search');

  searchBar.slideToggle(0, function() {
    if (searchBar.is(':visible')) {
      searchBar.focus();
    }
  });

  searchBar.keyup(function() {
    var searchTerm = $(this).val().toLowerCase();

    console.log(searchTerm);

    $('.docs a').css('color', '').filter(function() {
      return searchTerm && !$(this).text().toLowerCase().includes(searchTerm);
    }).css('color', 'grey');
  });
}