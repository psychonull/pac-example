window.document.title += ' [pac  v' + pac.VERSION + ']';

(function(){

  var ctn = document.getElementById("content");

  var game = pac.create();

  //game.use("renderer", pac.NativeRenderer, {
  game.use("renderer", pac.PixiRenderer, {
    container: ctn,
    backgroundColor: "#000000",
    size: {
      width: 700,
      height: 500
    }
  });

  game.use("loader", pac.Loader, {
    'logo': 'assets/images/psychonull_logo_pac.png'
  });

  game.loader.on("complete", function(){
    console.log('logo is: ', game.cache.images.get('logo'));
    var logoSprite = new pac.Sprite({
      texture: 'logo',
      position: {
        x: 100,
        y: 100
      },
      size: {
        width: 405,
        height: 135
      }
    });
    game.renderer.stage.add(logoSprite);
    game.start();
  });

  game.loader.load();
  //START -  hack for test render
  /*game.renderer.stage.add({
    resource: 'assets/images/psychonull_logo_pac.png',
    position: {
      x: 100,
      y: 100
    },
    size: {
      width: 405,
      height: 135
    }
  });*/
  //END -

  game.start();

})();
