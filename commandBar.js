window.document.title += ' [pac  v' + pac.VERSION + ']';

(function(){

  pac.DEBUG = true;

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
    layers: ['background', 'front', 'gui']
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
/*
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
*/
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
    layer: 'front',
    shape: true,
    actions: [ new pac.actions.Command() ],
    position: {
      x: 280,
      y: 20
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
      return 'Is too high, I can\'t reach it';
    }
    /*
    walkto: function(){
      var kid = this.scene.findObject('Kid');
      kid.actions.pushFront(new WalkTo(this.position));
    }
    */
  };

  var kidAnimations = new pac.AnimationList({
    walkRight: new pac.Animation({
      fps: 10,
      frames: ['walk_0','walk_1','walk_2','walk_3','walk_4']
    }),
    walkLeft: new pac.Animation({
      fps: 10,
      frames: ['walk_5','walk_6','walk_7','walk_8','walk_9']
    }),
    idleRight: new pac.Animation({
      frames: ['walk_0']
    }),
    idleLeft: new pac.Animation({
      frames: ['walk_9']
    })
  }, {
    default: 'idleRight',
    autoplay: true
  });

  var Kid = pac.Sprite.extend({
    name: 'Kid',
    texture: 'kidNM',
    layer: 'front',
    animations: kidAnimations,

    init: function(){
      this.lastSide = 'Left';
    },

    update: function(dt){

      if (this.walkingTo){
        var dir = this.walkingTo;

        if (dir.x >= 0){
          this.animations.play('walkRight');
          this.lastSide = 'Right';
        }
        else {
          this.animations.play('walkLeft');
          this.lastSide = 'Left';
        }
      }
      else {
        this.animations.play('idle' + this.lastSide);
      }
    }

  });

  var kid = new Kid({
    shape: true,
    actions: [
      new pac.actions.Command(),
      new pac.actions.Walker({
        velocity: 40,
        // comment this line below to try out discover feet
        feet: new pac.Point(17, 50)
      })
    ],
    position: {
      x: 150,
      y: 70
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

  var walkableArea = new pac.prefabs.WalkableArea({
    layer: 'background',

    position: new pac.Point(0, 120),
    //shape: new pac.Rectangle({ size: { width: 320, height: 20 }})
    shape: new pac.Polygon([ 30,20 , 80,0 , 320,0 , 320,20 ]),

    // comment line below to use "any" command for walking
    commands: [ 'walkto' ]
  });

  scene.addObject(walkableArea);
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
