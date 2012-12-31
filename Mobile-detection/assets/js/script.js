
//document ready function
$(function(){
   
   // constant vars for the canvas min height and width
   var maxWidth = 480;
   var maxHeight = 440;
   
   var initialWidth = $('canvasElement').attr('width');
   var initialHeight = $('canvasElement').attr('height');
   
   // variable to detect if touch device
   var touchDevice = !!('ontouchstart' in document);
   
   var handleResize = function(){
       // get the window width and height
       var w = window.innerWidth || window.documentElement.clientWidth || window.document.body.clientWidth;
       var h = window.innerHeight || window.documentElement.clientHeight || window.document.body.clientHeight;
       var newDim = null;
       
       if (w <= maxWidth){
           newDim = {width:Math.min(w, maxWidth), height:Math.min(h, maxHeight)};
           $('#container').css('width', 'auto');
           $('#canvasElement').css({position:'absoulte', top:0, left:0});
       }else{
           newDim = {width:initialWidth, height:initialHeight};
           $('#container').css('width', maxWidth);
           $('#canvasElement').css('position', 'relative');
       }
       
       $('#canvasElement').attr(newDim);
       
    };
    
    // run the handle resize on load
    handleResize();
    
    // because some mobiles do not class orientation change as rezise we do this little fix
    var resizeEvent = touchDevice ? 'orientationchange' : 'resize';
    $(window).bind(resizeEvent, handleResize);
    
    //prevent scrolling and zooming on mobile
    $(document).on('touchmove', function(event){
        event.preventDefault();
    })
}); 