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
    },
    layers: [ 'back', 'front' ]
  });

  game.use('loader', pac.Loader, {
    'logo': 'assets/images/psychonull_logo_pac.png',
    'kid': 'assets/images/kid_sprites.png'
  });

  game.loader.on('complete', function(){
    createGame(game);
  });

  game.loader.load();

})();


function createGame(game){

  /* KID TEXTURE FRAMES */

  var kid = game.cache.images.get('kid');

  var kidframes = [];
  var w = 70, h = 120;

  for (var i=0; i<10; i++){
    kidframes.push({ x: i*w , y: 0, width: w, height: h });
  }

  kid.frames = new pac.List(kidframes);


  /* SCENE */

  var scene = new pac.Scene({
    name: 'cool-scene',
    size: { width: 500, height: 400 }
  });


  // ACTION: Horizontal movement of an object 
  var MoveH = pac.Action.extend({

    vel: 50,
    dir: 1,
    bounds: { min: 0, max: 700 },

    init: function(options){
      this.vel = (options && options.vel) || this.vel;
      this.bounds = (options && options.bounds) || this.bounds;
    },

    update: function(dt) {
      var obj = this.actionList.owner;

      obj.position.x += this.vel * dt * this.dir;

      if (obj.position.x + obj.size.width > this.bounds.max || 
        obj.position.x <= this.bounds.min ) {

          this.isFinished = true;
      }
    }

  });

  var MoveRight = MoveH.extend({

    onStart: function(){
      var obj = this.actionList.owner;
      if (obj.animations)
        obj.animations.play('walkright');
    },

    onEnd: function(){
      this.insertInFrontOfMe(new MoveLeft({ 
        vel: this.vel, 
        bounds: this.bounds 
      }));
    }
  });

  var MoveLeft = MoveH.extend({
    dir: -1,
 
    onStart: function(){
      var obj = this.actionList.owner;

      if (obj.animations)
        obj.animations.play('walkleft');
    },

    onEnd: function(){
      this.insertInFrontOfMe(new MoveRight({ 
        vel: this.vel, 
        bounds: this.bounds 
      }));
    }
  });

  var kidAnimations = new pac.AnimationList({
    idle: new pac.Animation({ frames: [0] }),
    walkleft: new pac.Animation({ fps: 20, frames: [5,6,7,8,9] }),
    walkright: new pac.Animation({ fps: 10, frames: [0,1,2,3,4] })
  }, {
    default: 'idle'
  }); 

  var KidPrefab = pac.Sprite.extend({
    texture: 'kid'
  });

  var aKid = new KidPrefab({
    layer: 'front',
    actions: [ new MoveRight({ vel: 50, bounds: { min: 250, max: 500 } }) ],
    animations: kidAnimations,
    position: {
      x: 250,
      y: 150
    },
    size: {
      width: 70,
      height: 120
    },
  });

  /* LOGO */

  var LogoPrefab = pac.Sprite.extend({
    texture: 'logo'
  });

  var logoBig = new LogoPrefab({
    layer: 'back',
//    zIndex: 0,
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
    layer: 'back',
    zIndex: 1,
    position: {
      x: 280,
      y: 190
    },
    size: {
      width: 202,
      height: 67
    }
  });

  var logoSmall2 = new LogoPrefab({
    layer: 'back',
    zIndex: 2,
    position: {
      x: 370,
      y: 230
    },
    size: {
      width: 142,
      height: 42
    }
  });

  // add objects in a weird order to proove the layer sorting
  scene.addObject(logoSmall);
  scene.addObject(aKid);
  scene.addObject(logoBig);
  scene.addObject(logoSmall2);

  game.scenes.add(scene);

  game.start();
}