$(document).ready(function() {
    $('#city-search').hide()
    $('#search-form').hide()
    $('#city-search').fadeIn(1000);
    $('#search-form').fadeIn(1000);

	$("#main-background>.bg-img:gt(0)").hide();
    	setInterval(function() {
        	$('#main-background > .bg-img:first')
            	.fadeOut(500)
            	.next()
            	.fadeIn(500)
            	.end()
            	.appendTo('#main-background');
    	},  4500);

    $("#nav-content").hide();

    $("#nav-button").click(function() {
    	$("#nav-content").animate({
      		height: 'toggle'
    	});
  	});
});