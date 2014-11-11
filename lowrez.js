window.document.title += ' [pac  v' + pac.VERSION + ']';

(function(){

  var ctn = document.getElementById('content');

  // get a scale so we occupy 100% height with the game
  var gameScale = ctn.clientHeight / 200;

  var game = pac.create();

  game.use('loader', pac.Loader, {
    'MM': 'assets/images/MM.png',
    'abstract': 'assets/images/abstract.png',
    'nokia-font': {
      texture: 'assets/fonts/nokia.png',
      definition: 'assets/fonts/nokia.json',
      type: 'bitmapFont'
    }
  });

  //game.use('renderer', pac.NativeRenderer, {
  game.use('renderer', pac.PixiRenderer, {
    container: ctn,
    backgroundColor: '#000000',
    size: {
      width: 320,
      height: 200
    },
    scale: gameScale
  });

  game.use('input', pac.MouseInput, {
    enabled: true,
    scale: gameScale
  });

  game.loader.on('complete', function(){
    createGame(game);
  });

  game.loader.load();

})();

function createGame(game){
  /* SCENE */

  var scene = new pac.Scene({
    name: 'MM',
    size: { width: 320, height: 200 },
    texture: 'MM'
  });
  var abstract = new pac.Sprite({
    texture: 'abstract',
    position: {
      x: 280,
      y: 100
    },
    size: {
      width: 32,
      height: 32
    }
  });

  var bitmapText = new pac.Text('Ha ha ha!!!', {
    font: '7px nokia-font',
    position: {
      x: 9,
      y: 20
    },
    isBitmapText: true
  });

  scene.addObject(abstract);
  scene.addObject(bitmapText);
  game.scenes.add(scene);

  game.start();

  game.on('update', function(){
    var pos = game.inputs.cursor.position;
    document.getElementById('pos').innerText = pos.x + ":" + pos.y;
  });
}
