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
    onEnd: function(){
      this.insertInFrontOfMe(new MoveLeft({ 
        vel: this.vel, 
        bounds: this.bounds 
      }));
    }
  });

  var MoveLeft = MoveH.extend({
    dir: -1,
    onEnd: function(){
      this.insertInFrontOfMe(new MoveRight({ 
        vel: this.vel, 
        bounds: this.bounds 
      }));
    }
  });


  var LogoPrefab = pac.Sprite.extend({
    texture: 'logo'
  });

  var logoBig = new LogoPrefab({
    actions: [ new MoveRight({ vel: 500 }) ],
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
    actions: [ new MoveLeft({ vel: 200 }) ],
    position: {
      x: 400,
      y: 400
    },
    size: {
      width: 202,
      height: 67
    }
  });

  var logoSmall2 = new LogoPrefab({
    actions: [ new MoveRight({ vel: 300, bounds: { min: 100, max: 400 } }) ],
    position: {
      x: 100,
      y: 300
    },
    size: {
      width: 202,
      height: 67
    }
  });

  scene.addObject(logoBig);
  scene.addObject(logoSmall);
  scene.addObject(logoSmall2);

  game.scenes.add(scene);

  game.loader.on('complete', function(){
    game.start();
  });

  game.loader.load();

})();
