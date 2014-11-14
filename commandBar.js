window.document.title += ' [pac  v' + pac.VERSION + ']';

(function(){

  var ctn = document.getElementById('content');

  // get a scale so we occupy 100% height with the game
  var gameScale = ctn.clientHeight / 200;

  var game = pac.create();

  game.use('loader', pac.Loader, {
    'MM': 'assets/images/MM.png',
    'abstract': 'assets/images/abstract.png',
    'kidNM': {
      path: 'assets/images/kid_sprites.png',
      atlas: 'assets/images/kid_sprites.json'
    },
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

// ACTION: Follow Input
var WalkTo = pac.Action.extend({

  vel: 50,

  init: function(target){
    this.target = target;
  },

  onStart: function(){
    var obj = this.actions.owner;
    this.dir = this.target.subtract(obj.position).normalize();
  },

  update: function(dt) {
    var obj = this.actions.owner;

    if (this.target){
      var m = this.vel * dt;
      var move = new pac.Point(m * this.dir.x, m * this.dir.y);
      obj.position = obj.position.add(move);

      if (this.target.subtract(obj.position).length() < 5){
        this.target = null;
        this.isFinished = true;
      }
    }
  }

});

function createGame(game){
  /* SCENE */

  var scene = new pac.Scene({
    name: 'MM',
    size: { width: 320, height: 200 },
    texture: 'MM'
  });

  var abstract = new pac.Sprite({
    name: 'Weird Thing',
    texture: 'abstract',
    layer: 'background',
    shape: true,
    actions: [ new pac.actions.Hoverable(), new pac.actions.Clickable(), new pac.actions.Command() ],
    position: {
      x: 280,
      y: 100
    },
    size: {
      width: 32,
      height: 32
    }
  });

  abstract.onCommand = {
    use: function(){
      return 'I don\'t know how to use that';
    },
    pickup: function(){
      return 'I\'m scared to touch that';
    },
    walkto: function(){
      var kid = this.scene.findObject('Kid');
      kid.actions.pushFront(new WalkTo(this.position));
    }
  };

  var kid = new pac.Sprite({
    name: 'Kid',
    texture: 'kidNM',
    layer: 'background',
    frame: 'walk_0',
    shape: true,
    actions: [ new pac.actions.Hoverable(), new pac.actions.Clickable(), new pac.actions.Command() ],
    position: {
      x: 100,
      y: 50
    },
    size: {
      width: 35,
      height: 60
    },
  });

  kid.onCommand = {
    use: function(){
      return 'How would I Use a Kid?';
    },
    pickup: function(){
      return 'That kid is to heavy to carry';
    }
  };

  var commBar = new pac.prefabs.CommandBar({
    layer: 'gui',

    position: new pac.Point(0, 140),
    size: { width: 319, height: 59 },

    fill: '#000000',
    stroke: '#666666',

    cannotHolder: 'I certain cannot {{action}} that',

    messageBox: {
      position: new pac.Point(10, 5),
      font: '10px Arial',
      fill: '#ffffff'
    },

    commands: {
      'use': 'Use',
      'give': 'Give',

      'push': 'Push',
      'pull': 'Pull',

      'open': 'Open',
      'close': 'Close',

      'pickup': 'Pick Up',
      'lookat': 'Look At',
      'walkto': 'Walk To',
    },

    current: 'use',

    style: {

      position: new pac.Point(10, 15),
      margin: { x: 5, y: 3 },
      size: { width: 40, height: 10 },

      text: {
        font: '10px Arial',
        fill: '#ffffff',
      },

      hover:{
        font: '10px Arial',
        fill: '#ffff00',
      },

      active: {
        font: '10px Arial',
        fill: '#00ff00',
      },

      grid: [
        ['push', 'open',  'walkto'],
        ['pull', 'close', 'pickup'],
        ['use',  'give',  'lookat']
      ],
    },

  });

  scene.addObject(abstract);
  scene.addObject(kid);
  scene.addObject(commBar);

  game.scenes.add(scene);

  game.start();

  game.on('update', function(){
    var pos = game.inputs.cursor.position;
    document.getElementById('pos').innerText = pos.x + ":" + pos.y;
  });
}
