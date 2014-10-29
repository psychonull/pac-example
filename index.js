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

  var LogoPrefab = pac.Sprite.extend({
    texture: 'logo',
    update: function(dt){
      this.position.x += 50 * dt;

      if (this.position.x + this.size.width > 700){
        this.position.x = 0;
      }
    }
  });

  var logoBig = new LogoPrefab({
    texture: 'logo',
    position: {
      x: 100,
      y: 100
    },
    size: {
      width: 405,
      height: 135
    },
  });

  var logoSmall = new LogoPrefab({
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
