var map;
var win = $(this);
var videoItemPrototype = $('.video-item.wz-prototype');
var state = 0; // 0 == startScreen, 1 == listScreen; 2 == playing; 3 == playingThumbnail
var videoPlayer = $('.playing-screen iframe');

function initYoutube() {
  gapi.client.setApiKey("AIzaSyDf_MlUhD3VU9fsg3LKBUAxkj81gNPWYB0");
  gapi.client.load("youtube", "v3", function() {
    console.log("cargo api");
  });

}

var loadList = function( searchQuery ){

  $('.list-screen .video-item').not('.wz-prototype').remove();

  var request = gapi.client.youtube.search.list({

     part: "id,snippet",
     type: "video",
     q: encodeURIComponent( searchQuery ).replace(/%20/g, "+"),
     maxResults: 10

   });

  request.execute(function(response) {

     var results = response.result;
     var videoItems  = [];
     $.each(results.items, function(index, item) {

       var clonedItem = videoItemPrototype.clone();
       clonedItem.removeClass('wz-prototype');
       clonedItem.data('videoId', item.id.videoId);
       clonedItem.find('.thumbnail figure i').css( 'background-image', 'url(' + item.snippet.thumbnails.medium.url  + ')' );
       clonedItem.find('.video-info .title').text( item.snippet.title );
       clonedItem.find('.video-info .channel').text( item.snippet.channelTitle );
       clonedItem.find('.video-info .date').text( item.snippet.publishedAt );
       clonedItem.find('.video-info .description').text( item.snippet.description );
       //clonedItem.children('iframe').attr('src', '//www.youtube.com/embed/' + item.id.videoId);
       videoItems.push(clonedItem);
       //$(".content").append(tplawesome(data, [{"title":item.snippet.title, "videoid":item.id.videoId}]));

     });

    $('.video-list').append(videoItems);
    if( state != 3){
      state = 1;
    }

  });

}

var backToList = function (){

  if( state == 2 ){

    $('.playing-screen').removeClass('full');

    $('.list-screen').animate({

      'margin-left': '0px'},800
      ,function(){
        $('.ui-header').removeClass('playing');
        $('.ui-window-content').removeClass('playing');

      }

    );

    $('.playing-screen').animate({
      right: '30px', bottom: '20px' , width: '320px', height: '180px'},800, function(){
      }
    );

    $('.playing-screen .playing-cover').addClass('active');

    state = 3;

  }else if ( state == 3 ) {

    $('.playing-screen').animate({
      'opacity' : '0'},800, function(){
        $('.playing-screen').removeClass('active');
        videoPlayer.attr('src', '');
        var rightValue = '-' + $('.ui-window-content').css('width');
        //console.log()
        $('.playing-screen').css({'right': rightValue,'bottom': '0px', 'width': '100%', 'height': "100%", 'opacity' : '1'})
        state = 2;
        $('.playing-screen .playing-cover').removeClass('active');
      }
    );

  }

}

var playVideo = function ( videoId ){

  $('.playing-screen').addClass('active');

  if( state != 3 || typeof videoId !== 'undefined' ){
    videoPlayer.attr('src', '//www.youtube.com/embed/' + videoId + '?autoplay=1');
  }

  var width = $('.ui-window-content').css('width');
  width = '-' + width;

  $('.list-screen').animate({

    'margin-left': width},800
    ,function(){
      $('.ui-header').addClass('playing');
      $('.ui-window-content').addClass('playing');
      $('.playing-screen').addClass('full');
      state = 2;
    }

  );

  if ( state == 3 ){

    $('.playing-screen .playing-cover').removeClass('active');

    $('.playing-screen').animate({
      'right': '0px', 'bottom': '0px', 'width': '100%', 'height': $('.ui-window-content').css('height'), function(){
        $('.playing-screen').addClass('full');
      }},800
    );

  }else{

    $('.playing-screen').animate({
      'right': '0px'},800
    );

  }

}

win.on( 'click', '.ui-input-search .search-icon i' , function(){

  //loadList( $(this).parents('.ui-input-search').find('input').val() );

})

.on( 'click', '.video-item .title, .video-item .thumbnail' , function(){

  playVideo( $(this).parents('.video-item').data('videoId') );

})

.on( 'click', '.ui-header .arrow i' , function(){

  backToList();

})

.on( 'click' , '.playing-screen .playing-cover.active', function(e){

  if( state == 3 ){
    playVideo();
    $(this).removeClass('active');
  }

})

.on( 'click' , '.playing-screen .playing-cover.active i', function(e){

  backToList();
  e.stopPropagation();

})

.on( 'ui-view-resize-start' , function(e){

  if(state != 3){
    $('.playing-cover').addClass('active');
  }

})

.on( 'ui-view-resize-end' , function(e){

  if(state != 3){
    $('.playing-cover').removeClass('active');
  }

})

.key( 'enter', function(){

  var searchQuery;

  if( state == 0 ){

    var height = $('.ui-window-content').css('height');
    height = '-' + height;

    $('.ui-header .ui-input-search input').val( $('.startScreen .ui-input-search input').val() );
    $('.startScreen').animate({
      'margin-top': height},800
      ,function(){
        $('.startScreen').css('display', 'none');
        $('.ui-header.firstStart').removeClass('firstStart');
        $('.ui-window-content.firstStart').removeClass('firstStart');
      }
    );
    searchQuery = $('.startScreen .ui-input-search input').val();

  }else if ( state == 2) {

    searchQuery = $('.ui-header .ui-input-search input').val();
    backToList();

  }else{
    searchQuery = $('.ui-header .ui-input-search input').val();
  }

  loadList( searchQuery );

});

var interval = setInterval(function(){

  if( typeof gapi !== 'undefined' && typeof gapi.client !== 'undefined' ){
    clearInterval( interval );
    initYoutube();
  }

}, 50);
