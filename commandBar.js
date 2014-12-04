window.document.title += ' [pac  v' + pac.VERSION + ']';

window.onload = function(){

  pac.DEBUG = true;

  var ctn = document.getElementById('content');

  // get a scale so we occupy 100% height with the game
  var gameScale = ctn.clientHeight / 200;

  var game = pac.create();

  game.use('loader', pac.Loader, {
    'MM': 'assets/images/MM.png',
    'bg_school': 'assets/images/school_front_small.png',
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

  game.use('scenes', {
    'MM': new MMScene(),
    'psychScene': new PsychoScene()
  });

  game.loader.on('complete', function(){
    game.start('MM');
  });

  game.on('ready', createGameObjects);

  game.on('update', function(){
    var pos = game.inputs.cursor.position;
    document.getElementById('pos').innerText = pos.x + ":" + pos.y;
  });

  game.loader.load();
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
  texture: 'kidNM',
  layer: 'front',
  shape: true,
  actions: [
    new pac.actions.Commander()
  ],
  animations: kidAnimations,
  size: {
    width: 35,
    height: 60
  },

  init: function(){
    this.lastSide = 'Left';

    this.walkerAct = {
      velocity: 40,
      feet: new pac.Point(17, 50)
    };

    this.onCommand = {
      use: function(){
        return 'How would I Use a Kid?';
      },
      pickup: function(){
        return 'That kid is to heavy to carry';
      }
    };
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
  },

  onEnterScene: function(){

    this.actions
      .removeAll(pac.actions.WalkTo)
      .removeAll(pac.actions.Walker)
      .add(new pac.actions.Walker(this.walkerAct));

    switch (this.game.getScene().name){
      case 'MM': this.position = new pac.Point(150, 70); break;
      case 'psychScene': this.position = new pac.Point(30, 65); break;
    }
  }

});

var Abstract = pac.Sprite.extend({
  name: 'Weird Thing',
  texture: 'abstract',
  layer: 'front',
  shape: true,
  actions: [ new pac.actions.Commander() ],
  position: {
    x: 280,
    y: 20
  },
  size: {
    width: 32,
    height: 32
  },

  init: function(){

    this.onCommand = {
      use: function(){
        return 'I don\'t know how to use that';
      },
      pickup: function(){
        return 'I\'m scared to touch that';
      },
      walkto: function(){
        return 'Is too high, I can\'t reach it';
      },
      lookat: function(){
        if (this.game.getScene().name === 'MM'){
          this.game.loadScene('psychScene');
        }
        else {
          this.game.loadScene('MM');
        }
      }
    };

  }
});

function createGameObjects(){

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

  this
    .addObject(new Kid({}))
    .addObject(commBar);
}

var WalkableScene = pac.Scene.extend({

  init: function(){

    this.walkableArea = new pac.prefabs.WalkableArea({
      layer: 'background',
      shape: this.walkableShape,
      commands: [ 'walkto' ]
    });

  },

  onEnter: function(){
    this.addObject(this.walkableArea);
  },

  onExit: function(){
    this.walkableArea.clearWalkers();
  },

});

var MMScene = WalkableScene.extend({

  texture: 'MM',
  size: { width: 320, height: 200 },

  walkableShape: new pac.Polygon([ 30,140 , 80,120 , 320,120 , 320,140 ]),

  onEnter: function(scene){
    MMScene.__super__.onEnter.apply(this, arguments);

    this.addObject(new Abstract({}));
  },

  onExit: function(scene){
    MMScene.__super__.onExit.apply(this, arguments);
  },

  update: function(dt){

  }
});

var PsychoScene = WalkableScene.extend({

  texture: 'bg_school',
  size: { width: 320, height: 200 },

  walkableShape: new pac.Polygon([ 0,140 , 0,60 , 320,60 , 320,140 ]),

  onEnter: function(scene){
    PsychoScene.__super__.onEnter.apply(this, arguments);

    this.addObject(scene.findOne('Weird Thing'));
  },

  onExit: function(scene){
    PsychoScene.__super__.onExit.apply(this, arguments);
  },

  update: function(dt){

  }
});