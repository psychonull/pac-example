window.document.title += ' [pac  v' + pac.VERSION + ']';

(function(){

  var ctn = document.getElementById('content');

  var game = pac.create();

  //game.use('renderer', pac.NativeRenderer, {
  game.use('renderer', pac.PixiRenderer, {
    container: ctn,
    backgroundColor: '#000000',
    size: {
      width: 700,
      height: 500
    }
  });

  game.use('loader', pac.Loader, {
    'logo': 'assets/images/psychonull_logo_pac.png'
  });

  var scene = new pac.Scene({
    name: 'cool-scene',
    size: { width: 500, height: 400 }
  });

  var logoBig = new pac.Sprite({
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

  var logoSmall = new pac.Sprite({
    texture: 'logo',
    position: {
      x: 400,
      y: 400
    },
    size: {
      width: 202,
      height: 67
    }
  });

  scene.addObject(logoBig);
  scene.addObject(logoSmall);

  game.scenes.add(scene);

  game.loader.on('complete', function(){
    game.start();
  });

  game.loader.load();

})();
