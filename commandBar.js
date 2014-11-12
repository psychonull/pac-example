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
    scale: gameScale,
    layers: ['background', 'gui']
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
    layer: 'background',
    position: {
      x: 280,
      y: 100
    },
    size: {
      width: 32,
      height: 32
    }
  });

  var commBar = new pac.prefabs.CommandBar({
    layer: 'gui',

    position: new pac.Point(0, 140),
    size: { width: 319, height: 59 },

    fill: '#000000',
    stroke: '#666666',

    commands: {
      'use': 'Use',
      'give': 'Give',

      'push': 'Push',
      'pull': 'Pull',

      'open': 'Open',
      'close': 'Close',

      'pickup': 'Pick To',
      'lookat': 'Look At',
      'walkto': 'Walk To',
    },

    current: 'use',

    style: {

      text: {
        font: '12px Arial',
        fill: '#ffffff',
      },

      hover:{
        font: '12px Arial',
        fill: '#ffff00',
      },

      active: {
        font: '12px Arial',
        fill: '#00ff00',
      },

      margin: { x: 5, y: 7 },
      size: { width: 45, height: 10 },

      grid: [
        ['push', 'open',  'walkto'],
        ['pull', 'close', 'pickup'],
        ['use',  'give',  'lookat']
      ],
    },

  });

  scene.addObject(abstract);
  scene.addObject(commBar);

  game.scenes.add(scene);

  game.start();

  game.on('update', function(){
    var pos = game.inputs.cursor.position;
    document.getElementById('pos').innerText = pos.x + ":" + pos.y;
  });
}
