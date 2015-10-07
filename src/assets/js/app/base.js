$(function () {
    "use strict";

    $('a[href=#]').on('click', function (e) {
        e.preventDefault();
    });


  var $button = $("<div id='source-button' class='btn btn-primary btn-xs'>&lt; &gt;</div>").click(function(){
    var html = $(this).parent().html();
    html = cleanSource(html);
    $("#source-modal pre").text(html);
    $("#source-modal").modal();
  });

  $('.bs-component [data-toggle="popover"]').popover();
  $('.bs-component [data-toggle="tooltip"]').tooltip();

  $(".bs-component").hover(function(){
    $(this).append($button);
    $button.show();
  }, function(){
    $button.hide();
  });

  function cleanSource(html) {
    var lines = html.split(/\n/);

    lines.shift();
    lines.splice(-1, 1);

    var indentSize = lines[0].length - lines[0].trim().length,
        re = new RegExp(" {" + indentSize + "}");

    lines = lines.map(function(line){
      if (line.match(re)) {
        line = line.substring(indentSize);
      }

      return line;
    });

    lines = lines.join("\n");

    return lines;
  }





    $('.minimize-box').on('click', function (e) {
        e.preventDefault();
        var $icon = $(this).children('i');
        if ($icon.hasClass('icon-chevron-down')) {
            $icon.removeClass('icon-chevron-down').addClass('icon-chevron-up');
        } else if ($icon.hasClass('icon-chevron-up')) {
            $icon.removeClass('icon-chevron-up').addClass('icon-chevron-down');
        }
    });
    $('.close-box').click(function () {
        $(this).closest('.box').hide('slow');
    });

    $('#changeSidebarPos').on('click', function (e) {
        $('body').toggleClass('hide-sidebar');
    });

    $('li.accordion-group > a').on('click', function (e) {
        $(this).children('span').children('i').toggleClass('icon-angle-down');
    });
    
    $('#menu-toggle').on('click', function(e){
        $('#left').toggleClass('opened');
        e.preventDefault();
    });
    


    metisChart(); 
    $(".scroll-pane").jScrollPane();
    

});
















