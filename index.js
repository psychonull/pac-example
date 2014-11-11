window.document.title += ' [pac  v' + pac.VERSION + ']';

(function(){

  var ctn = document.getElementById('content');

  var game = pac.create();

  game.use('renderer', pac.NativeRenderer, {
  //game.use('renderer', pac.PixiRenderer, {
    container: ctn,
    backgroundColor: '#000000',
    size: {
      width: 800,
      height: 500
    },
    layers: [ 'back', 'front' ]
  });

  game.use('loader', pac.Loader, {
    'logo': 'assets/images/psychonull_logo_pac.png',
    'kid': {
      path: 'assets/images/kid_sprites.png',
      frames: getKidFrames()
    },
    'kidNM': {
      path: 'assets/images/kid_sprites.png',
      atlas: 'assets/images/kid_sprites.json'
    },
    'bg_school': 'assets/images/school_front.png'
  });

  game.use('input', pac.MouseInput, {
    enabled: true
  });

  game.loader.on('complete', function(){
    createGame(game);
  });

  game.loader.load();

})();

function getKidFrames(){
  var kidframes = [];
  var w = 70, h = 120;

  for (var i=0; i<10; i++){
    kidframes.push({ x: i*w , y: 0, width: w, height: h });
  }

  return kidframes;
}

function createGame(game){
  /* SCENE */

  var scene = new pac.Scene({
    name: 'cool-scene',
    size: { width: 800, height: 500 },
    texture: 'bg_school'
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
      var obj = this.actions.owner;

      obj.position.x += this.vel * dt * this.dir;

      if (obj.position.x + obj.size.width > this.bounds.max ||
        obj.position.x <= this.bounds.min ) {

          this.isFinished = true;
      }
    }

  });

  var MoveRight = MoveH.extend({

    onStart: function(){
      var obj = this.actions.owner;
      if (obj.animations)
        obj.animations.play('walkright');
    },

    onEnd: function(){
      this.insertInFrontOfMe(new pac.actions.Delay(2));
      this.insertInFrontOfMe(new MoveLeft({
        vel: this.vel,
        bounds: this.bounds
      }));
    }
  });

  var MoveLeft = MoveH.extend({
    dir: -1,

    onStart: function(){
      var obj = this.actions.owner;

      if (obj.animations)
        obj.animations.play('walkleft');
    },

    onEnd: function(){
      this.insertInFrontOfMe(new pac.actions.Delay(2));
      this.insertInFrontOfMe(new MoveRight({
        vel: this.vel,
        bounds: this.bounds
      }));
    }
  });

  // ACTION: Follow Input
  var FollowInput = pac.Action.extend({

    vel: 50,

    init: function(options){
      this.vel = (options && options.vel) || this.vel;
      this.target = null;
      this.dir = null;
    },

    update: function(dt) {
      var obj = this.actions.owner;
      var cursor = obj.game.inputs.cursor;

      if (cursor.isDown){
        this.target = cursor.position;
        this.dir = this.target.subtract(obj.position).normalize();
      }

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

  var kidAnimations = new pac.AnimationList({
    idle: new pac.Animation({ frames: [0] }),
    walkleft: new pac.Animation({ fps: 20, frames: [5,6,7,8,9] }),
    walkright: new pac.Animation({ fps: 10, frames: [0,1,2,3,4] })
  }, {
    default: 'idle'
  });

  var kidAnimationsNamed = new pac.AnimationList({
    walk: new pac.Animation({
      fps: 10,
      frames: ['walk_0','walk_1','walk_2','walk_3','walk_4']
    }),
    idle: new pac.Animation({
      frames: ['walk_0']
    })
  }, {
    default: 'walk',
    autoplay: true
  });

  var kidAnimationsNamed2 = new pac.AnimationList({
    walk: new pac.Animation({
      fps: 10,
      frames: ['walk_0','walk_1','walk_2','walk_3','walk_4']
    }),
    idle: new pac.Animation({
      frames: ['walk_0']
    })
  }, {
    default: 'idle',
    autoplay: true
  });

  var KidMover = pac.Sprite.extend({
    texture: 'kidNM',
    layer: 'front',
    shape: true,
    update: function(dt){
      if (this.isHover) {

        if (this.animations.current._name !== 'walk'){
          //TODO: check on AnimationList if it's running a play of the same
          // as the current --> DO NOT do a re-play
          // it causes the animation to never change, since it is
          // doing a play, stop, play, and so on.
          this.animations.play('walk');
        }

        return;
      }

      if (this.animations.current._name !== 'idle'){
        this.animations.play('idle');
      }
    }
  });

  var aKidMove = new KidMover({
    frame: 'walk_0',
    animations: kidAnimationsNamed2,
    actions: [ new pac.actions.Hoverable(), new pac.actions.Clickable() ],
    position: {
      x: 300,
      y: 200
    },
    size: {
      width: 35,
      height: 60
    },
  });

  aKidMove.on('click', function(){
    this.actions.pushFront(new FollowInput({ vel: 50 }));
    this.actions.pushFront(new pac.actions.Delay(0.1));
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

  var aKidFrame = new KidPrefab({
    layer: 'front',
    frame: 2,
    actions: [ ],
    position: {
      x: 250,
      y: 350
    },
    size: {
      width: 70,
      height: 120
    },
  });

  var aKidNamedFrames = new pac.Sprite({
    texture: 'kidNM',
    layer: 'front',
    animations: kidAnimationsNamed,
    position: {
      x: 350,
      y: 350
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

  var ChangeRandomTextFill = pac.Action.extend({

    interval: 0.250,
    _currentInterval: 0,

    init: function(options){
      this.interval = (options && options.interval) || this.interval;
    },

    update: function(dt) {
      var obj = this.actions.owner;
      this._currentInterval += dt;
      if(this._currentInterval >= this.interval){
        obj.fill = '#'+Math.floor(Math.random()*16777215).toString(16);
        obj.stroke = '#'+Math.floor(Math.random()*16777215).toString(16);
        obj.strokeThickness = Math.floor(Math.random()*4);
        obj.font = pac._.random(12,46).toString(10) + 'px ' +
          pac._.sample(['Arial', 'Helvetica', 'Comic Sans']);
        obj.position.x = pac._.random(0,150);
        this._currentInterval = 0;
      }
    }

  });

  var title = new pac.Text('OP Example',{
    actions: [ new ChangeRandomTextFill() ]
  });

  var wrapText = new pac.Text('A long text so we can wrap it at 140px width, and bla, bla blah.',
  {
    wordWrap: 140,
    fill: 'white',
    font: '14px Arial',
    position: {
      x: 595,
      y: 292
    }
  });

  // SHAPES
  var circle = new pac.Circle({
    layer: 'front',
    position: {
      x: 280,
      y: 50
    },
    radius: 30,
    fill: '#2add2a',
    stroke: '#641cea',
    lineWidth: 2
  });

  var rect = new pac.Rectangle({
    layer: 'front',
    position: {
      x: 300,
      y: 50
    },
    size: {
      width: 100,
      height: 50
    },
    fill: '#c138a3',
    stroke: '#ff4f4f',
    lineWidth: 2
  });

  //test for changing shapes
  setTimeout(function(){
    rect.fill = '#00ff00';
    rect.size.width *= 2;
    rect.position.x += 100;

    circle.fill = '#ff0000';
    circle.radius *= 1.5;
    circle.position.x += 50;
  }, 3000);

  // add objects in a weird order to proove the layer sorting
  scene.addObject(circle);
  scene.addObject(rect);

  scene.addObject(logoSmall);
  scene.addObject(aKid);
  scene.addObject(logoBig);
  scene.addObject(aKidFrame);
  scene.addObject(logoSmall2);
  scene.addObject(aKidNamedFrames);
  scene.addObject(title);
  scene.addObject(wrapText);
  scene.addObject(aKidMove);

  game.scenes.add(scene);

  game.start();

  game.on('update', function(){
    var pos = game.inputs.cursor.position;
    document.getElementById('pos').innerText = pos.x + ":" + pos.y;
  });
}
