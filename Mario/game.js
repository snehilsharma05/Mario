let config = {
    type: Phaser.AUTO,

    scale:{
        mode:Phaser.Scale.FIT,
        width:800,
        height:600,
    },
    backgroundColor:0xffffcc,
    physics:{
        default: 'arcade',
        arcade:{
            gravity:{
                y:1000,
            },
            debug:false,
        }
    },
    scene:{
        preload: preload,
        create:create,
        update:update
    }
};
let player_config = {
    player_speed:200,
    player_jumpspeed:-600
}
let game = new Phaser.Game(config);


function preload()
{
    this.load.image("ground","Assets/topground.png");
    this.load.image("sky","Assets/background.png");
    this.load.image("apple","Assets/apple.png");
    this.load.image("ray","Assets/ray.png");
    this.load.spritesheet("dude","Assets/dude.png",{frameWidth:32,frameHeight:48});
}
function create()
{
    W = game.config.width;
    H = game.config.height;

    //tile sprite for repeating ground image to full extend (width and height(128))
    let ground = this.add.tileSprite(0,H-128,W,128,'ground');
    ground.setOrigin(0,0);

    //sky background
    let background = this.add.sprite(0,0,'sky');
    background.setOrigin(0,0);
    background.displayWidth = W;
    background.displayHeight = H;
    background.depth = -2; //so that sky image doesn't overlap with ground image

    //create rays on top of background
    let rays= [];
    for(let i=-10;i<=10;i++)
    {
        let ray  = this.add.sprite(W/2,H-100,'ray');
        ray.displayHeight = 1.2*H;
        ray.setOrigin(0.5,1);
        ray.alpha = 0.2;
        ray.angle = i*20;
        ray.depth = -1;
        rays.push(ray);
    }

    //tween
    this.tweens.add({
        targets:  rays,
        props: {
            angle:{
                value: "+=20"
            }
        },
        duration :8000,
        repeat : -1
    });
    //player
    this.player = this.physics.add.sprite(100,100,'dude',4);//4 is default img to be shown since imgs of player are in form of spritesheet
    //bouncing effect on player
    this.player.setBounce(0.5);
    this.player.setCollideWorldBounds(true);
    //player animations and player movements

    this.anims.create({
        key:'left',
        frames : this.anims.generateFrameNumbers('dude',{start:0,end:3}),
        frameRate:10,
        repeat : -1 //infinitely play frames
    });
    this.anims.create({
        key:'middle',
        frames : this.anims.generateFrameNumbers('dude',{start:4,end:4}),
        frameRate:10,
    });
    this.anims.create({
        key:'right',
        frames : this.anims.generateFrameNumbers('dude',{start:5,end:8}),
        frameRate:10,
        repeat : -1
    });
    //keyboard
    this.cursors = this.input.keyboard.createCursorKeys();

    //apple group-->physical obects
    let fruits = this.physics.add.group({
        key : "apple",
        repeat:8,
        setScale:{x:0.2,y:0.2},
        setXY:{x:10,y:0,stepX:100},
    });
    //adding random bounce effects on all fruits
    fruits.children.iterate(function(f){
        f.setBounce(Phaser.Math.FloatBetween(0.4,0.7));
    });

    //Adding more platforms
    let platforms = this.physics.add.staticGroup();
    platforms.create(550,380,'ground').setScale(2,0.5).refreshBody();
    platforms.create(595,172,'ground').setScale(2,0.5).refreshBody();
    platforms.create(150,250,'ground').setScale(2,0.5).refreshBody();
    platforms.add(ground);
    this.physics.add.existing(ground,true ); //adding physics to ground since we want to detect collision etc.
   
   // ground.body.allowGravity = false; //but ground should not fall down..It should remain at its place
    //ground.body.immovable = true;//so that ground doesn't fall due to gravity of player landing on it


    //adding collision detector between ground and player
    this.physics.add.collider(platforms,this.player);
    //this.physics.add.collider(ground,fruits);
    this.physics.add.collider(platforms,fruits);
    this.physics.add.overlap(this.player,fruits,eatFruit,null,this);

    //create cameras
    this.cameras.main.setBounds(0,0,W,H);
    this.physics.world.setBounds(0,0,W,H);

    this.cameras.main.startFollow(this.player,true,true);
    this.cameras.main.setZoom(1.5);
}
function update()
{
    if(this.cursors.left.isDown)
    {
        this.player.setVelocityX(-player_config.player_speed);
        this.player.anims.play('left',true);
    }
    else if(this.cursors.right.isDown){
        this.player.setVelocityX(player_config.player_speed);
        this.player.anims.play('right',true);
    }
    else{
        this.player.setVelocityX(0);
        this.player.anims.play('middle',true);
    }
    //jumping ability

    if(this.cursors.up.isDown && this.player.body.touching.down)
    {
        this.player.setVelocityY(player_config.player_jumpspeed);
    }
}
function eatFruit(player,fruit)
{
    fruit.disableBody(true,true); //disable body as well as hide body
}