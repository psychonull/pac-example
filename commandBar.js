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

  var kid = new Kid({
    name: 'kid',
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

  // TODO: add to game.addObject() the auto assing of the game into the object.
  kid.game = this;
  commBar.game = this;

  this.addObject(kid);
  this.addObject(commBar);
}

var MMScene = pac.Scene.extend({

  texture: 'MM',
  size: { width: 320, height: 200 },

  init: function(options){

  },

  onEnter: function(scene){

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
      },
      lookat: function(){
        //TODO: a better way to get current scene name
        if (this.game.scenes.current.name === 'MM'){
          this.game.loadScene('psychScene');
        }
        else {
          this.game.loadScene('MM');
        }
      }
    };

    var walkableArea = new pac.prefabs.WalkableArea({
      layer: 'background',

      position: new pac.Point(0, 120),
      //shape: new pac.Rectangle({ size: { width: 320, height: 20 }})
      shape: new pac.Polygon([ 30,20 , 80,0 , 320,0 , 320,20 ]),

      // comment line below to use "any" command for walking
      commands: [ 'walkto' ]
    });

    this.addObject(abstract);
    this.addObject(walkableArea);




    // make a default command on the commandbar
    // it should be set everytime the scene changes
    var cmdBar = this.game.findOne('CommandBar');
    var use = cmdBar.children.findOne({ command: 'use'})
    cmdBar.onCommandClick(use);


    var kid = this.game.findOne('kid');
    kid.position = new pac.Point(150, 70);

    // how to make this automagically?
    kid.actions.removeAll(pac.actions.Walker);

    kid.actions.add(new pac.actions.Walker({
      velocity: 40,
      feet: new pac.Point(17, 50)
    }));
  },

  onExit: function(scene){

  },

  update: function(dt){

  }


});

var PsychoScene = pac.Scene.extend({

  texture: 'bg_school',
  size: { width: 320, height: 200 },

  init: function(options){

  },

  onEnter: function(scene){
    this.addObject(scene.findOne('Weird Thing'));

    // make a default command on the commandbar
    // it should be set everytime the scene changes
    var cmdBar = this.game.findOne('CommandBar');
    var use = cmdBar.children.findOne({ command: 'use'})
    cmdBar.onCommandClick(use);

    // walkable area should be set into each Scene, there is no
    // real advantage of adding it everytime the scene is loaded
    var walkableArea = new pac.prefabs.WalkableArea({
      layer: 'background',

      position: new pac.Point(0, 0),
      //shape: new pac.Rectangle({ size: { width: 320, height: 20 }})
      shape: new pac.Polygon([ 0,140 , 0,60 , 320,60 , 320,140 ]),

      // comment line below to use "any" command for walking
      commands: [ 'walkto' ]
    });

    this.addObject(walkableArea);

    var kid = this.game.findOne('kid');
    kid.position = new pac.Point(30, 65);

    // how to make this automagically?
    kid.actions.removeAll(pac.actions.Walker);

    kid.actions.add(new pac.actions.Walker({
      velocity: 40,
      feet: new pac.Point(17, 50)
    }));
  },

  onExit: function(scene){

  },

  update: function(dt){

  }


});