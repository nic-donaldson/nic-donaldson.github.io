var last_time = 0;
var time = 0;
var objects = [];
var timed_events = [];

var sounds = {};
var images = {};
var broccoli = {};
var score = 0;
var hiscore = 0;
var godmode = false;
var dark = true;
var loadedSounds = 0;
var loadedImages = 0;
var scoreup = function () {};
var bossdefeated = false;

function printObjects () {
    objects.forEach(function (o) {
        console.log(o);
    });
}

function setup() {
    createCanvas(windowWidth-20, windowHeight-20);
    colorMode(HSB);
    frameRate(60);

    var sc = function() { loadedSounds++; };
    var ic = function() { loadedImages++; };

    // load sounds
    soundFormats('mp3', 'wav');
    sounds['tick'] = loadSound('assets/tick.wav', sc);
    sounds['majorminor'] = loadSound('assets/majorminor.wav', sc);
    sounds['broccolishoot'] = loadSound('assets/kelly_shoot.wav', sc);
    sounds['shipexplode'] = loadSound('assets/shipexplode.wav', sc);
    sounds['bossexplosion'] = loadSound('assets/boss_explosion.wav', sc);
    sounds['chargebeam'] = loadSound('assets/charge_beam.wav', sc);
    sounds['shootbeam'] = loadSound('assets/shoot_beam.wav', sc);
    sounds['broccolihit'] = loadSound('assets/kellyhit.wav', sc);
    sounds['bosshealthup'] = loadSound('assets/bosshealthup.wav', sc);
    sounds['resurrection'] = loadSound('assets/resurrection.wav', sc);

    // load images
    images['banana2'] = loadImage('assets/banana2.png', ic);
    images['bananadesat'] = loadImage('assets/bananadesat.png', ic);
    images['broccoli'] = loadImage('assets/broccoli.png', ic);

    setupPoints();

    var wait = function() {
        if (loadedSounds != 10 || loadedImages != 3) {
            setTimeout(wait, 1000);
        } else {
            clockScene();
        }
    };
    wait();
}

function gameOver() {
    if (score > hiscore) {
        hiscore = score;
    }
    score = 0;
    bossdefeated = false;
    objects = [];
    timed_events = [];
    timed_events.push({
        when: time + 2000,
        func: bananaIntroScene
    });
}

// ++++++====== Clock scene ======++++++

// +++=== Clock ===+++
function updateClock(dt, clock) {
    if (clock.state === 'start') {
        clock.state = 'ticking-waiting';
        timed_events.push({
            when: time + 1000,
            func: (function () {
                clock.state = 'ticking';

                var tick = (function () {
                    clock.rotate = 0;
                    clock.tick++;
                    sounds['tick'].play();
                });

                // 4 slow ticks
                for (i = 0; i < 4; i++) {
                    timed_events.push({
                        when: time + 2000 + i*1000,
                        func: tick
                    });
                }

                // 8 fast ticks
                var then = time + 5000;
                for (i = 0; i < 8; i++) {
                    timed_events.push({
                        when: then + 1000 + i*500,
                        func: tick
                    });
                }

                // 16 faster ticks
                then += 4500;
                for (i = 0; i < 16; i++) {
                    timed_events.push({
                        when: then + 500 + i*250,
                        func: tick
                    });
                }
                then += 500 + 15*250;

                // Then stop and scene change
                timed_events.push({
                    when: then + 10,
                    func: (function () {
                        clock.state = 'done';
                        clock.rotate = 0;
                    })
                });

                timed_events.push({
                    when: then + 1000,
                    func: bananaIntroScene
                });
            })
        });
    } else if (clock.state === 'ticking') {
        clock.rotate += (dt/1000) * (PI/16);
    }
}

function drawClock(clock) {
    push();
    fill('white');
    stroke('white');
    strokeWeight(2);
    translate(width/2, height/2);

    // draw centre
    ellipse(0, 0, 10, 10);

    var radius = clock.radius;
    push();
    for (i = 0; i < 4; i++) {
        // draw major tick
        line(0, -radius+10, 0, -radius-10);
        rotate(PI/4);
        // draw minor tick
        line(0, -radius+5, 0, -radius-5);
        rotate(PI/4);
    }
    pop();

    rotate(-(clock.rotate + clock.tick*PI/4));
    line(0, 0, 0, -25);

    pop();
}

function makeClock() {
    return {
        id: 'clock',
        draw: drawClock,
        update: updateClock,
        radius: 70,
        state: 'start',
        tick: 0,
        rotate: 0
    };
}

// +++=== Scene ===+++
function clockScene() {
    objects = [];
    timed_events = [];
    objects.push(makeClock());
}

// ++++++====== Banana introduction scene ======++++++

// +++=== Void ===+++
function drawVoid(the_void) {
    push();
    translate(width/2, height/2);
    fill(color(0, 0, 0, 0.8));
    ellipse(0, 0, the_void.radius);
    pop();
}

function updateVoid(dt, the_void) {
    // Cap it somewhere sensible
    the_void.radius = min(2*max(windowWidth,windowHeight), 100 + ((time-the_void.start)/100)**2);
}

function makeVoid() {
    return {
        id: 'the_void',
        update: updateVoid,
        draw: drawVoid,
        radius: 100,
        start: time
    };
}

// +++=== Cosmic banana ===+++
function cosmicBananaIntroUpdate(dt, banana) {
    banana.opacity = min(1.0, (time-banana.start)/5000);
}

function cosmicBananaIntroDraw(banana) {
    push();
    var scalef = 0.5;
    var sw = scalef*images['banana2'].width;
    var sh = scalef*images['banana2'].height;

    translate(width/2 - sw/2, (1 + sin(time/1000))*20);
    scale(scalef);
    //tint(100, banana.opacity);
    //image(images['banana2'], 0, 0);
    tint((180 + frameCount/5.0) % 360.0, 100, 100, banana.opacity);
    image(images['bananadesat'], 0, 0);

    pop();
}

function makeCosmicBananaIntro(when) {
    return {
        id: 'cosmic_banana_intro',
        update: cosmicBananaIntroUpdate,
        draw: cosmicBananaIntroDraw,
        start: when,
        opacity: 0.0
    };
}

// +++=== Cosmic banana text ===+++
function bananaTextDraw(t) {
    push();
    translate(width/2, 2*height/3);
    textSize(30);
    textAlign(CENTER);
    fill('green');
    text("THE COSMIC BANANA SPEAKS", 0, 0);
    fill('white');
    textSize(20);
    textAlign(CENTER);
    text("ARE YOU A BAD ENOUGH BROCCOLI TO DEFEAT ME?", 0, 30);

    textSize(15);
    text("set godmode=true to play through the whole game :)\n there's only one boss", 0, 50);
    pop();
}

// +++=== Game starting text ===+++
function gameStartTextDraw(t) {
    push();
    translate(width/2, 0.8*height);
    fill('pink');
    textSize(20);
    textAlign(CENTER);
    text("GAME START IN " + int(t.count) + ".\nARROWS TO MOVE, SPACE TO SHOOT.", 0, 0);
    pop();
}

function gameStartTextUpdate(dt, t) {
    t.count = max(0, 10 - (time-t.start)/1000);
    if (t.count === 0) {
        timed_events.push({
            when: time+500,
            func: infiniteLevelScene
        });
    }
};

function makeGameStartTextUpdate(when) {
    return {
        id: 'cosmic_banana_count_text',
        draw: gameStartTextDraw,
        update: gameStartTextUpdate,
        count: 10,
        start: when
    };
}

// +++=== scene ===+++
function bananaIntroScene() {
    // The ordering of objects is important for drawing
    objects = [];
    timed_events = [];
    objects.push(makeVoid());

    var x = time;

    timed_events.push({
        when: x + 3000,
        func: (function () {
            sounds['majorminor'].play();
        })
    });

    timed_events.push({
        when: x + 6000,
        func: (function () {
            objects.push(makeCosmicBananaIntro(x+6000));
        })
    });

    timed_events.push({
        when: x + 8000,
        func: (function () {
            objects.push({
                id: 'cosmic_banana_intro_text',
                draw: bananaTextDraw
            });
            objects.push(makeGameStartTextUpdate(x+8000));
        })
    });
}

// ++++++====== Level one scene ======++++++
// +++=== utility code: path following, collision detection ===+++
var points = {};
function setupPoints() {
    points['left_to_right'] = [
        {x: -100,
         y: -100,
         when: 0},
        {x: width/2,
         y: height/2,
         when: 2000},
        {x: width/2,
         y: height/2,
         when: 2500},
        {x: width+100,
         y:-100,
         when: 4500},
    ];
    points['right_to_left'] = [
        {x: width+100,
         y: -100,
         when: 0},
        {x: 2*width/3,
         y: height/2,
         when: 2000},
        {x: width/3,
         y: height/2,
         when:4000},
        {x: -100,
         y: -100,
         when: 5000}
    ];
    points['top_triangle'] = [
        {x: width/2,
         y: -100,
         when: 0},
        {x: width/3,
         y: height/2,
         when: 3000},
        {x: 2*width/3,
         y: height/2,
         when: 6000},
        {x: width/2,
         y: -100,
         when: 9000}
    ];
}
function pointPath(points, start) {
    var f = function () {
        var i;
        for (i = 0; i < points.length; i++) {
            if (points[i].when + start >= time) {
                break;
            }
        }

        if (i === points.length) {
            // we're done
            return null;
        }

        if (points[i].when + start < time) {
            // we have a problem, probably just do nothing...
            return null;
        }

        var next_point;
        var prev_point;

        if (i <= 0) {
            next_point = points[1];
            prev_point = points[0];
        } else {
            next_point = points[i];
            prev_point = points[i-1];
        }

        var interpolated_coords = [];
        var rel_time = time - start;
        var p = (rel_time-prev_point.when)/(next_point.when - prev_point.when);

        var x1 = prev_point.x;
        var x2 = next_point.x;
        interpolated_coords.push(lerp(x1, x2, p));

        var y1 = prev_point.y;
        var y2 = next_point.y;
        interpolated_coords.push(lerp(y1, y2, p));

        return interpolated_coords;
    };

    return f;
}

function rectCollision(x1, x2, y1, y2, w1, w2, h1, h2) {
    var top1 = y1;
    var top2 = y2;
    var left1 = x1;
    var left2 = x2;
    var bottom1 = top1 + h1;
    var bottom2 = top2 + h2;
    var right1 = left1 + w1;
    var right2 = left2 + w2;

    return left1 <= right2 && right1 >= left2 && top1 <= bottom2 && bottom1 >= top2;
}

// +++=== broccoli bullets ===+++
function updateBroccoliBullet(dt, bullet) {
    bullet.y += bullet.vy;
    if (bullet.y < 0) {
        bullet.remove = true;
    }
}

function drawBroccoliBullet(bullet) {
    push();
    translate(bullet.x, bullet.y);
    noStroke();
    fill(0, 100, 100, 0.5);
    ellipse(0, 0, 10, 20);
    fill(0, 100, 100);
    ellipse(0, 0, 5, 10);
    pop();
}

function makeBroccoliBullet(x, y, vy) {
    return {
        id: 'bullet',
        x: x,
        y: y,
        vy: vy,
        draw: drawBroccoliBullet,
        update: updateBroccoliBullet
    };
}

// +++=== broccoli ===+++
function broccoliDraw(broccoli) {
    push();
    translate(broccoli.x, broccoli.y);
    scale(broccoli.scale);
    image(images['broccoli'], 0, 0);

    /*
    // helmet
    if (broccoli.damaged) {
        noFill();
        stroke('black');
    } else {
        fill('grey');
        noStroke();
    }
    rect(0, 0, broccoli.w,  broccoli.h);
    noStroke();

    // eyes
    fill('white');
    var eyex = broccoli.w/5;
    var eyey = broccoli.h/5;
    var eyew = 3*broccoli.w/5;
    var eyeh = broccoli.h/5;
    rect(eyex, eyey, eyew, eyeh);
    fill('black');
    rect(eyex + 10, eyey + eyeh/4, 5, eyeh/2);
    rect(eyex + 30, eyey + eyeh/4, 5, eyeh/2);

    // guns
    rect(0, 0, eyex, -broccoli.gunh);
    rect(broccoli.w-eyex, 0, eyex, -broccoli.gunh);
    rect(eyex, 0, -3*eyex/2, eyex);
    rect(broccoli.w-eyex, 0, 3*eyex/2, eyex);

    // thrusters
    fill('orange');
    triangle(0, broccoli.h, broccoli.w/4, broccoli.h+eyex-broccoli.vy, 2*eyex, broccoli.h);
    triangle(broccoli.w-2*eyex, broccoli.h, 3*broccoli.w/4, broccoli.h+eyex-broccoli.vy, broccoli.w, broccoli.h);
    */

    pop();
}

var guns = {};
function setupGuns() {
    guns['basic'] = function (broccoli) {
        objects.push(makeBroccoliBullet(
            broccoli.x + broccoli.w/2,
            broccoli.y - broccoli.gunh,
            min(-20, broccoli.vy - 10)
        ));
    };

    guns['double'] = function (broccoli) {
        var p = 0.3;
        objects.push(makeBroccoliBullet(
            broccoli.x + broccoli.w - p*broccoli.w,
            broccoli.y - broccoli.gunh,
            min(-20, broccoli.vy - 10)
        ));
        objects.push(makeBroccoliBullet(
            broccoli.x + p*broccoli.w,
            broccoli.y - broccoli.gunh,
            min(-20, broccoli.vy - 10)));
    };

    guns['triple'] = function (broccoli) {
        var p = 0.2;
        objects.push(makeBroccoliBullet(
            broccoli.x + broccoli.w - p*broccoli.w,
            broccoli.y - broccoli.gunh,
            min(-20, broccoli.vy - 10)
        ));
        objects.push(makeBroccoliBullet(
            broccoli.x + broccoli.w/2,
            broccoli.y - broccoli.gunh,
            min(-20, broccoli.vy - 20)
        ));
        objects.push(makeBroccoliBullet(
            broccoli.x + p*broccoli.w,
            broccoli.y - broccoli.gunh,
            min(-20, broccoli.vy - 10)));
    };
}

function broccoliUpdate(dt, broccoli) {
    broccoli.x = constrain(broccoli.x + broccoli.vx, 0, width-broccoli.w);
    broccoli.y = constrain(broccoli.y + broccoli.vy, broccoli.gunh, height-broccoli.h);

    // TODO: use flyweight pattern here
    // TODO use dt instead of frameCount
    if (broccoli.shooting && frameCount % 8 === 0) {
        sounds['broccolishoot'].play();
        broccoli.gun(broccoli);
    }
}

function makeBroccoli() {
    // Making the ship global so bullets can see it
    var scalef = 0.1;
    var sw = scalef*images['broccoli'].width;
    var sh = scalef*images['broccoli'].height;

    setupGuns();

    broccoli = {
        id: 'broccoli',
        draw: broccoliDraw,
        update: broccoliUpdate,
        gun: guns['basic'],
        gunh: 30,
        w: sw,
        h: sh,
        x: width/2,
        y: height - sh - 10,
        scale: scalef,
        vx: 0,
        vy: 0,
        shooting: false,
        lives: 5,
        damaged: false
    };
}

// +++=== enemy bullets ===+++

function hitBroccoli() {
    sounds['broccolihit'].play();
    broccoli.damaged = true;
    broccoli.lives -= 1;
    if (broccoli.lives <= 0) {
        sounds['shipexplode'].play();
        broccoli.remove = true;
        gameOver();
    } else {
        timed_events.push({
            when: time + 2000,
            func: (function () {
                broccoli.damaged = false;
            })
        });
    }
}

function enemyBulletUpdate(dt, bullet) {
    bullet.x += bullet.dx;
    bullet.y += bullet.dy;
    if (bullet.y < 0 || bullet.y > height || bullet.x < 0 || bullet.x > width) {
        bullet.remove = true;
    }

    // check for collision with broccoli
    if (!godmode && !broccoli.damaged && rectCollision(bullet.x, broccoli.x, bullet.y, broccoli.y, 15, broccoli.w, 15, broccoli.h)) {
        bullet.remove = true;
        hitBroccoli();
    }
}

function enemyBulletDraw(bullet) {
    push();
    translate(bullet.x, bullet.y);
    noStroke();
    var c = bullet.color;
    if (c.length != 4) {
        c.push(0.5);
    }
    fill([c[0], c[1], c[2], 0.5]);
    ellipse(0, 0, 20);
    fill([c[0], c[1], c[2], 1.0]);
    ellipse(0, 0, 10);
    pop();
};

function makeEnemyBullet(x, y, dx, dy, color) {
    return {
        id: 'ebullet',
        x: x,
        y: y,
        dx: dx,
        dy: dy,
        color: color,
        draw: enemyBulletDraw,
        update: enemyBulletUpdate
    };
}

// +++=== enemy ship
function enemyShipDraw(ship) {
    push();
    translate(ship.x, ship.y);
    var shipwidth = ship.w;
    var shipheight = ship.h;

    fill(ship.hue, 100, 100);
    noStroke();
    rect(0, 0, shipwidth, shipwidth/2);
    translate(0, shipwidth/2);
    triangle(0, 0, shipwidth/2, shipwidth/2, shipwidth, 0);
    pop();
}

// Check for collision with broccoli bullets
// TODO make this efficient if needed
function bulletCheck(ship) {
    objects.forEach(function (o) {
        if (o.id === 'bullet' && !o.remove) {
            if (rectCollision(ship.x, o.x, ship.y, o.y, ship.w, 10, ship.h, 20)) {
                ship.health -= 25;
                if (ship.health <= 0 && !ship.remove) {
                    ship.remove = true;
                    sounds['shipexplode'].play();
                    if (ship.hasOwnProperty('score')) {
                        addScore(ship.score);
                    } else {
                        addScore(100);
                    }
                }
                o.remove = true;
            }
        }
    });
}

function enemyShipEmitter(ship) {
    var ang = random([PI/4, 3*PI/4, PI/2]);

    objects.push({
        id: 'ebullet',
        x: ship.x + cos(ang)*10,
        y: ship.y + sin(ang)*10,
        dx: cos(ang)*10,
        dy: sin(ang)*10,
        color: [ship.hue || 0, 100, 100],
        draw: enemyBulletDraw,
        update: enemyBulletUpdate
    });
}

function rotatingEnemyShipEmitter(ship) {
    var ang = ship.rotate;
    var arms = int(lerp(0, 4, ship.health/ship.max_health));
    for (i = 0; i < arms; i++) {
        ang += 2*PI/arms;
        objects.push({
            id: 'ebullet',
            x: ship.x + cos(ang)*10,
            y: ship.y + sin(ang)*10,
            dx: cos(ang)*5,
            dy: sin(ang)*5,
            color: [140, 100, 100],
            draw: enemyBulletDraw,
            update: enemyBulletUpdate
        });
    }
}

function emit(ship) {
    var interval = 750;
    if (ship.hasOwnProperty('emit_interval')) {
        interval = ship.emit_interval;
    }
    if (!ship.last_emit && (time - ship.start) > 500) {
        enemyShipEmitter(ship);
        ship.last_emit = time;
    } else if (time - ship.last_emit > interval) {
        ship.last_emit = time;
        ship.emitter(ship);
        //enemyShipEmitter(ship, 20, 40);
    }
}

function enemyShipUpdate(dt, ship) {
    var new_coords = ship.path();
    if (new_coords != null) {
        ship.x = new_coords[0];
        ship.y = new_coords[1];
    } else {
        ship.remove = true;
    }

    emit(ship);
    bulletCheck(ship);
}

function makeEnemyShip(x, y, start, path) {
    return {
        emitter: enemyShipEmitter,
        id: 'enemy_ship',
        draw: enemyShipDraw,
        update: enemyShipUpdate,
        x: x,
        y: y,
        w: 40,
        h: 60,
        start: start,
        last_emit: null,
        path: path,
        health: 100.0,
        hue: random(360.0)
    };
}

function rotatingEnemyShipDraw(ship) {
    var r = ship.radius;
    push();
    translate(ship.x, ship.y);
    fill('blue');
    noStroke();
    ellipse(0, 0, r/2);

    push();
    fill('yellow');
    stroke('black');
    rotate(ship.rotate);
    var arms = int(lerp(0, 4, ship.health/ship.max_health));
    for (i = 0; i < arms; i++) {
        rotate(2*PI/arms);
        translate(0, r/2);
        triangle(-r/4, 0, 0, r/4, r/4, 0);
        translate(0, -r/2);
    }
    pop();

    pop();
}

function rotatingEnemyShipUpdate(dt, ship) {
    ship.rotate += dt/500;
    enemyShipUpdate(dt, ship);
}

function rotatingEnemyShipMake(x, y, start, path, emit_interval) {
    return {
        score: 250,
        emit_interval: emit_interval || 500,
        emitter: rotatingEnemyShipEmitter,
        rotate: 0,
        id: 'rotating_enemy_ship',
        draw: rotatingEnemyShipDraw,
        update: rotatingEnemyShipUpdate,
        x: x,
        y: y,
        w: 20,
        h: 20,
        start: start,
        path: path,
        radius: 40,
        health: 200,
        max_health: 200,
        start: start,
        last_emit: null
    };
}


// +++=== information panel ===+++
// used for lives and score and stuff
function addScore(points) {
    score += points;
    scoreup();
}

function drawInfoPanel(panel) {
    push();
    translate(panel.x, panel.y);
    noFill();
    stroke('black');
    if (panel.outline) {
        rect(0, 0, panel.w, panel.h);
    }
    if (dark) {
        stroke('white');
        fill('white');
    } else {
        stroke('black');
        fill('white');
    }
    textSize(14);
    text("LIVES: " + str(broccoli.lives), 30, 30);
    text("SCORE: " + str(score), 30, 50);
    text("HIGH SCORE: " + str(max(hiscore, score)), 30, 70);
    pop();
}

function makeInfoPanel() {
    return {
        id:'info_panel',
        x: 10,
        y: 10,
        w: 200,
        h: 100,
        draw: drawInfoPanel,
        outline: false
    };
}

// +++=== scene ===+++
function bindBroccoliControls () {
    keyPressed = function() {
        if (keyCode === LEFT_ARROW) {
            broccoli.vx -= 15;
        } else if (keyCode === RIGHT_ARROW) {
            broccoli.vx += 15;
        } else if (keyCode === UP_ARROW) {
            broccoli.vy -= 15;
        } else if (keyCode === DOWN_ARROW) {
            broccoli.vy += 15;
        } else if (keyCode === 32) { // space bar
            broccoli.shooting = true;
        }
    };

    keyReleased = function() {
        if (keyCode === LEFT_ARROW) {
            broccoli.vx += 15;
        } else if (keyCode === RIGHT_ARROW) {
            broccoli.vx -= 15;
        } else if (keyCode === UP_ARROW) {
            broccoli.vy += 15;
        } else if (keyCode === DOWN_ARROW) {
            broccoli.vy -= 15;
        } else if (keyCode === 32) { // space bar
            broccoli.shooting = false;
        }
    };
}

function levelOneScene() {
    timed_events = [];
    objects = [];
    makeBroccoli();
    objects.push(broccoli);
    objects.push(makeInfoPanel());
    bindBroccoliControls();

    // First wave
    var waveOne = function (when) {
        for (i = 0; i < 10; i++) {
            timed_events.push({
                when: when+i*500,
                func: (function (i) {
                    function x() {
                        console.log("wave 1 " + i);
                        objects.push(makeEnemyShip(
                            -100, -100, when+i*500, pointPath(points['left_to_right'], when+i*500)
                        ));
                    }
                    return x;})(i)
            });
        }
    };

    var waveTwo = function (when) {
        // Second wave
        for (i = 0; i < 10; i++) {
            timed_events.push({
                when: when + i*1000,
                func: (function (i) {
                    function x() {
                        console.log("wave 2 " + i);
                        objects.push(makeEnemyShip(
                            width+100, -100, when+i*1000, pointPath(points['right_to_left'], when+i*1000)
                        ));
                    }
                    return x;
                })(i)
            });
        }
    };

    var waveThree = function (when) {
        timed_events.push({
            when: when,
            func: function () {
                objects.push(rotatingEnemyShipMake(
                    points[0].x, points[0].y, when, pointPath(points['top_triangle'], when), 500
                ));
            }
        });
    };

    waveOne(time+1000);
    waveTwo(time+5000);
    waveThree(time + 13000);
}

// ++++++====== Infinite level ======++++++
function buildingDraw(building) {
    push();
    translate(building.x, building.y);

    fill(building.hue, 53, 56);
    stroke('black');

    if (building.shape === 'square') {
        rect(0, 0, building.w, building.h);
    } else if (building.shape === 'circle') {
        ellipse(0, 0, building.w);
    }

    var p = building.y/height - 0.5;

    if (building.x > width/2) {
        translate(10, p*20.0);
    } else {
        translate(-10, p*20.0);
    }

    fill(building.hue, 53, 100);
    if (building.shape === 'square') {
        rect(0, 0, building.w, building.h);
    } else if (building.shape === 'circle') {
        ellipse(0, 0, building.w);
    }

    pop();
}

function buildingUpdate(dt, building) {
    if (!building.still) {
        building.y += dt/5;
    }
    if (building.y >= height || building.y < 0) {
        building.remove = true;
    }

    // TODO use dt
    if (building.emitter && frameCount % 6 == 0) {
        building.emitter(building);
    }
}

function makeBuilding(x, y, w, h, emitter, still) {
    x = x || 50;
    y = y || 0;
    w = w || 50;
    h = h || 50;
    return {
        id: 'building',
        draw: buildingDraw,
        update: buildingUpdate,
        hue: random(360),
        shape: random(['square', 'circle']),
        x: x,
        y: y,
        w: w,
        h: h,
        emitter: emitter,
        still: still || false
    };
}

// +++=== circular emitter ===+++
function circularEmitter(building) {
    var ang = lerp(0, 2*PI, (time % 3000)/3000.0);
    var x = building.x;
    var y = building.y;
    if (building.shape === 'square') {
        x += building.w/2;
        y += building.h/2;
    }

    objects.push(makeEnemyBullet(
        x + cos(ang)*10,
        y + sin(ang)*10,
        cos(ang)*10,
        sin(ang)*10,
        [180, 100, 100]
    ));
}


function drawRoad(road) {
    push();

    // lines
    var left = 0.4*width;
    var right = 0.6*width;
    /*
    stroke('black');
    strokeWeight(2);
    line(left, 0, left, height);
    line(right, 0, right, height);
    */
    fill('grey');
    rect(left, 0, right-left, height);

    // stripes
    var stripe_width = 10;
    var stripe_length = 20;
    fill('black');
    translate(0, road.offset % 120);
    for (i = -1; i < height/40 + 1; i++) {
        if (i === 0 || i % 3 === 0) {
            rect(width/2, i*40, stripe_width, stripe_length);
        }
    }
    pop();
}

function updateRoad(dt, road) {
    road.offset += dt/5;
}

function makeRoad() {
    return {
        offset: 0,
        id: 'road',
        draw: drawRoad,
        update: updateRoad
    };
}

function setupGroup() {
    return {
        id: 'environment_group',
        subobjects: [],
        draw: function (g) {
            drawObjects(g.subobjects);
        },
        update: function (dt, g) {
            updateObjects(g.subobjects);
            g.subobjects = filterObjects(g.subobjects);
        }
    };
}

function infiniteLevelScene() {
    timed_events = [];
    objects = [];
    scoreup = function () {
        if (score > 2000) {
            broccoli.gun = guns['triple'];
        } else if (score > 1000) {
            broccoli.gun = guns['double'];
        }
        if (score > 5000) {
            // Move to boss scene
            if (!bossdefeated) {
                bananaBossScene();
            }
        }
    };

    if (bossdefeated) {
        broccoli.gun = guns['triple'];
    }

    // Grouping environment objects for rendering order
    var environment_group = setupGroup();

    makeBroccoli();
    objects.push(environment_group);
    environment_group.subobjects.push(makeRoad());

    objects.push(broccoli);
    objects.push(makeInfoPanel());
    bindBroccoliControls();

    var buildingCreator = function () {
        // if score is > 3000, 1/10 chance of an emitter on building

        if (score > 3000 && random() < 0.1) {
            environment_group.subobjects.push(makeBuilding(random([50, 100, width-200, width-100]), 0, 75, 75,
                                                           circularEmitter));
        } else {
            environment_group.subobjects.push(makeBuilding(random([50, 100, width-200, width-100]), 0, 75, 75));
        }

        timed_events.push({
            when: time + random(1000, 5000),
            func: buildingCreator
        });
    };

    // Slowly progress in difficulty as the game goes on
    var enemyCreator = function () {
        var path_name = random(['left_to_right', 'right_to_left', 'top_triangle']);
        var sx = points[path_name][0].x;
        var sy = points[path_name][0].y;
        var next = 1000;

        if (score < 1000) {
            objects.push(makeEnemyShip(sx, sy, time+500, pointPath(points[path_name], time+500)));
            next = 2000;
        } else if (score < 3000) {
            if (random() < 0.03) {
                objects.push(rotatingEnemyShipMake(
                    sx, sy, time+500, pointPath(points[path_name], time+500), 500
                ));
            } else {
                objects.push(makeEnemyShip(sx, sy, time+500, pointPath(points[path_name], time+500)));
            }
            next = 1000;
        } else {
            if (random() < 0.1) {
                objects.push(rotatingEnemyShipMake(
                    sx, sy, time+500, pointPath(points[path_name], time+500), 500
                ));
            } else {
                objects.push(makeEnemyShip(sx, sy, time+500, pointPath(points[path_name], time+500)));
            }
            next = 1000;
        }


        timed_events.push({
            when: time+next,
            func: enemyCreator
        });
    };
    buildingCreator();
    enemyCreator();
}

// ++++++====== Banana boss scene ======++++++

function makeExplosion (x, y, color) {
    function d(explosion) {
        push();
        translate(explosion.x, explosion.y);
        fill(explosion.color);
        noStroke();
        ellipse(0, 0, explosion.radius);
        pop();
    }
    function u(dt, explosion) {
        explosion.radius += dt;
        if (explosion.radius >= 2*max(width, height)) {
            explosion.remove = true;
        }
    }
    return {
        id: 'explosion',
        x: x,
        y: y,
        color: color,
        draw: d,
        update: u,
        radius: 30,
        start: time
    };
}


var light_beams = [];
function makeLightBeam(boss, start) {

    function d(beam) {
        push();
        noStroke();
        translate(beam.boss.x + beam.boss.w/2, beam.boss.y + beam.boss.h/2);
        rotate(PI + boss.rotate);

        if (beam.fired) {
            fill(184, 44, 100, 1.0);
        } else {
            fill(184, 44, 100, 0.5*beam.opacity);
        }
        rect(-beam.w/2, 0, beam.w, 2*max(width,height));

        fill(0, 0, 100, beam.opacity);
        rect(-beam.w/3, 0, 2*beam.w/3, 2*max(width,height));

        pop();
    }

    function u(dt, beam) {
        if (beam.boss.remove === true) {
            beam.remove = true;
        }
        beam.ang += dt/2000;

        if (time - start < beam.chargetime) {
            beam.opacity = (time-start)/beam.chargetime;
        } else {
            beam.opacity = 1.0;
            if (!beam.fired) {
                beam.fired = true;
                sounds["shootbeam"].play();
            }
        }

        if (time - start > beam.chargetime + beam.life) {
            beam.remove = true;
        }

        var x = beam.boss.x + beam.boss.w/2 - beam.w/2;
        var y = beam.boss.y + beam.boss.h/2;
        var bang = boss.rotate-PI/2;

        // don't know how to check for intersection properly here, so I'm just going to scan
        if (beam.fired && !broccoli.damaged && !godmode) {
            while (x < width && x > 0 && y < height && y > 0) {
                if (rectCollision(x, broccoli.x, y, broccoli.y, beam.w, broccoli.w, 15, broccoli.h)) {
                    hitBroccoli();
                    break;
                }
                x += cos(bang)*15;
                y += sin(bang)*15;
            }
        }
    }


    var b =  {
        id: 'beam',
        draw: d,
        update: u,
        boss: boss,
        w: 50,
        opacity: 0.0,
        fired: false,
        chargetime: 1000,
        life: 1000,
        start: start
    };
    light_beams.push(b);
    return b;
}

function drawBananaBoss(boss) {
    push();
    var sw = boss.scale*images['bananadesat'].width;
    var sh = boss.scale*images['bananadesat'].height;

    translate(boss.x, boss.y);
    translate(boss.w/2, boss.h/2);
    rotate(boss.rotate);
    translate(-boss.w/2, -boss.h/2);

    push();
    scale(boss.scale);
    if (boss.state === 'fadein') {
        // This seems to hurt the CPU, so I'm only using it here
        tint((180 + frameCount/5.0) % 360.0, 100, 100, boss.opacity);
    }
    image(images['bananadesat'], 0, 0);
    //image(images['banana2'], 0, 0);
    pop();
    /*
    // visualise draw point
    fill('red');
    ellipse(0, 0, 10);

    // visualise rotate point
    translate(boss.w/2, boss.h/2);
    ellipse(0, 0, 10);
    translate(-boss.w/2, -boss.h/2);
    */

    pop();

    /*
    // some debug stuff
    push();
    fill('green');
    ellipse(boss.x, boss.y, 30);

    // Can I calculate the middle point easily?
    var x = boss.x + boss.w/2;
    var y = boss.y + boss.h/2;
    fill('blue');
    ellipse(x,y,30);

    // ok but can I then find the angle from the middle point to broccoli?
    var ang = atan2(broccoli.y-y, broccoli.x-x);
    fill('pink');
    ellipse(x + cos(ang)*30, y + sin(ang)*30, 30);

    // ok but what about the direction the boss is facing
    fill('red');
    ellipse(x + cos(boss.rotate-PI/2)*30, y + sin(boss.rotate-PI/2)*30, 30);

    textSize(20);
    text(boss.state, 50, 200);
    pop();
    */
}

function updateBananaBoss(dt, boss) {
    function hover(y) {
        boss.y = 20 + (1 + sin(time/1000))*10;
    }

    var elapsed = time-boss.start;

    if (boss.state === 'fadein') {
        boss.opacity = min(1.0, (time-boss.start)/5000);
        hover(20);

        if (boss.opacity === 1.0) {
            boss.state = 'start-explosion';
            boss.start = time;
        }

    } else if (boss.state === 'start-explosion') {
        boss.opacity = 1.0;
        hover(20);

        boss.state = 'during-explosion';

        for (i = 0 ; i < 10; i++) {
            timed_events.push({
                when: time + i*333,
                func: (function (i) {
                    function x() {
                        sounds['bossexplosion'].play();
                        var expl = makeExplosion(boss.x + boss.w/2, boss.y + boss.h/2, ['blue','white'][i%2]);
                        if (i === 9) {
                            expl.destroy = function () {
                                boss.state = 'after-explosion';
                            };
                        }
                        egroup.subobjects.push(expl);
                    }
                    return x;
                })(i)
            });
        }

    } else if (boss.state === 'during-explosion') {
        hover(20);
        boss.rotate = min(PI, lerp(0, PI, (time-boss.start)/3000));
    } else if (boss.state === 'after-explosion') {
        hover(20);
        boss.state = 'charging-health-bar';
        sounds['bosshealthup'].play();
    } else if (boss.state === 'charging-health-bar') {
        if (boss.health < boss.max_health) {
            boss.health = min(boss.health + 100, boss.max_health);
        } else {
            boss.state = 'start-light-beam';
            boss.tangible = true;
        }
    } else if (boss.state === 'start-light-beam') {
        hover(20);

        var beamCount = 0;
        var beamFunc = function() {
            var beam = makeLightBeam(boss, time);
            egroup.subobjects.push(beam);
            sounds['chargebeam'].play();
            beamCount++;
            if (beamCount >= 5) {
                timed_events.push({
                    when: time + 1500,
                    func: function () {
                        boss.state = 'spawn-basic-enemies';
                    }
                });
                boss.state = 'light-beam';
            } else {
                timed_events.push({
                    when: time + 2000,
                    func: beamFunc
                });
            }
        };

        beamFunc();

        boss.state = 'light-beam';
    } else if (boss.state === 'light-beam') {
        boss.x = lerp(boss.x, (1+sin(time/1000))*(width-boss.w)/2, 0.1);
        hover(20);
        // Move boss towards broccoli

        var x = boss.x + boss.w/2;
        var y = boss.y + boss.h/2;
        var bang = boss.rotate-PI/2;
        var ang = (atan2(broccoli.y - y, broccoli.x - x) + 2*PI) % (2*PI);
        boss.rotate = PI/2 + lerp(boss.rotate-PI/2, ang, 0.01);
    } else if (boss.state === 'spawn-basic-enemies') {
        boss.x = lerp(boss.x, (1+sin(time/1000))*(width-boss.w)/2, 0.1);
        hover(20);
        x = boss.x + boss.w/2;
        y = boss.y + boss.h/2;
        for (i = 0; i < 2; i++) {
            timed_events.push({
                when: time + 500,
                func: (function (i) {
                    function x() {
                        objects.push(makeEnemyShip(
                            -100, -100, time+i*500, pointPath(points['left_to_right'], time+i*500)));
                    }
                    return x;
                })(i)
            });
        }
        boss.state = 'wait1';
    } else if (boss.state === 'spawn-basic-enemies2') {
        boss.x = lerp(boss.x, (1+sin(time/1000))*(width-boss.w)/2, 0.1);
        hover(20);
        x = boss.x + boss.w/2;
        y = boss.y + boss.h/2;

        var p1 = points['right_to_left'];
        var p2 = points['top_triangle'];

        timed_events.push({
            when: time + 500,
            func: function () {
                objects.push(rotatingEnemyShipMake(p1[0].x, p1[0].y, time+500, pointPath(p1, time+500), random(500, 750)));
            }
        });
        timed_events.push({
            when: time + 1000,
            func: function () {
                objects.push(rotatingEnemyShipMake(p2[0].x, p2[0].y, time+1000, pointPath(p2, time+1000), random(500, 750)));
            }
        });
        boss.state = 'wait1';

    } else if (boss.state === 'wait1') {
        boss.x = lerp(boss.x, (1+sin(time/1000))*(width-boss.w)/2, 0.1);
        hover(20);

        x = boss.x + boss.w/2;
        y = boss.y + boss.h/2;
        bang = boss.rotate-PI/2;
        ang = (atan2(broccoli.y - y, broccoli.x - x) + 2*PI) % (2*PI);
        boss.rotate = PI/2 + lerp(boss.rotate-PI/2, ang, 0.01);

        timed_events.push({
            when: time + 1000,
            func: function () {
                // Player just needs to hope they don't get unlucky :^)
                boss.state = random(['spawn-basic-enemies2',
                                     'spawn-basic-enemies',
                                     'spawn-basic-enemies',
                                     'spawn-basic-enemies',
                                     'spawn-basic-enemies',
                                     'wait1',
                                     'wait1',
                                     'start-light-beam']);
            }
        });
        boss.state = 'wait2';
    } else if (boss.state === 'wait2') {
        boss.x = lerp(boss.x, (1+sin(time/1000))*(width-boss.w)/2, 0.1);
        hover(20);
    }

    // hit detection
    if (boss.tangible) {
        bulletCheck(boss);
    }
}

function makeBananaBoss() {
    var scale = 0.3;
    var sw = scale*images['bananadesat'].width;
    var sh = scale*images['bananadesat'].height;
    return {
        score: 5000,
        round: 1,
        tangible: false,
        id: 'banana_boss',
        draw: drawBananaBoss,
        update: updateBananaBoss,
        state: 'fadein',
        x: width/2,
        y: 0,
        w: sw,
        h: sh,
        scale: 0.3,
        opacity: 0.0,
        start: time,
        rotate: 0.0,
        health: 100,
        max_health: 5000
    };
}

function drawHealthBar(bar) {
    push();
    translate(width/2 - bar.w/2, 50);
    var p = bar.boss.health / bar.boss.max_health;
    fill(lerpColor(color('red'),
                   color('green'), p));
    stroke('black');
    rect(0, 0, p*bar.w, bar.h);
    pop();
}

function updateHealthBar(dt, bar) {
}

function makeHealthBar(boss) {
    return {
        id: 'health_bar',
        boss: boss,
        draw: drawHealthBar,
        update: updateHealthBar,
        w: width/2,
        h: 50
    };
}

var egroup = {};
function bananaBossScene() {
    timed_events = [];
    objects = [];
    //makeBroccoli();
    broccoli.lives = 5; // be nice
    broccoli.gun = guns['double'];
    scoreup = function () {};

    egroup = setupGroup();
    objects.push(egroup);
    egroup.subobjects.push(makeInfoPanel());

    objects.push(broccoli);
    bindBroccoliControls();
    dark = true;

    var boss = makeBananaBoss();
    boss.destroy = function () {
        light_beams.forEach(function (b) {
            b.remove = true;
            b.draw = function () {};
            b.update = function () {};
        });

        // when all you have is a hammer
        timed_events = [];
        clearID("rotating_enemy_ship");
        clearID("enemy_ship");
        timed_events.push({
            when: time + 2000,
            func: bananaBossScene2
        });
    };
    var hbar = makeHealthBar(boss);
    egroup.subobjects.push(hbar);

    timed_events.push({
        when: time + 1000,
        func: function () {
            sounds['majorminor'].play();
            objects.push(boss);
        }
    });
    //egroup.subobjects.push(makeLightBeam(width/2,  height/2, PI, time));
}

function updateBananaBoss2(dt, boss) {
    function hover(y) {
        boss.y = y + (1 + sin(time/1000))*10;
    }

    var elapsed = time - boss.start;

    if (boss.state === 'fadein') {
        boss.opacity = min(1.0, (elapsed/5000));
        boss.scale = lerp(0.3, 0.5, elapsed/5000);
        boss.w = images['bananadesat'].width*boss.scale;
        boss.h = images['bananadesat'].height*boss.scale;
        boss.x = width/2 - boss.w/2;
        hover(height/2 - boss.h/2);

        if (elapsed >= 5000) {
            boss.state = 'explosion';
            var expl = makeSpiralExplosion();
            expl.destroy = function () {
                boss.state = 'after-explosion';
                boss.start = time;
            };
            egroup.subobjects.push(expl);
        }
    } else if (boss.state === 'explosion') {
        hover(height/2 - boss.h/2);
        timed_events.push({
            when: time + 500,
            func: function () {
                sounds["resurrection"].play();
            }
        });
        boss.state = 'waiting-for-explosion';
        boss.start = time;
    } else if (boss.state === 'waiting-for-explosion') {
        var h = lerp(height/2, height/3, min(1.0, elapsed/3000)) - boss.h/2;
        hover(h);
    } else if (boss.state === 'after-explosion') {
        boss.scale = lerp(0.5, 0.3, min(1.0, elapsed/3000));
        boss.w = images['bananadesat'].width*boss.scale;
        boss.h = images['bananadesat'].height*boss.scale;
        boss.x = width/2 - boss.w/2;
        hover(height/3 - boss.h/2);
        if (boss.scale <= 0.3) {
            boss.state = 'charging-health-bar';
            sounds['bosshealthup'].play();
            egroup.subobjects.push(makeHealthBar(boss));
        }
    } else if (boss.state === 'charging-health-bar') {
        hover(height/3 - boss.h/2);
        if (boss.health < boss.max_health) {
            boss.health = min(boss.health + 100, boss.max_health);
        } else {
            boss.state = 'start-bullet-hell';
            boss.tangible = true;
        }
    } else if (boss.state === 'start-bullet-hell') {
        // make lots of bullets
        if (!boss.offset) {
            boss.offset = 1.0;
        }
        var count = 20;
        var ang = boss.offset;
        var c = random(360.0);
        sounds['broccolishoot'].play();
        for (i = 0; i < count; i++) {
            var x = boss.x + boss.w/2;
            var y = boss.y + boss.h/2;
            objects.push(makeEnemyBullet(x, y, cos(ang)*1.5, sin(ang)*1.5, [c, 100, 100]));
            ang += 2*PI/count;
        }
        boss.offset += random(PI);
        boss.state = 'nothing';
        timed_events.push({
            when: time + 2000,
            func: function () {
                boss.state = random(['start-bullet-hell',
                                     'spawn-basic-enemy']);
            }
        });
    } else if (boss.state === 'spawn-basic-enemy') {
        objects.push(makeEnemyShip(-100, -100, time, pointPath(points['top_triangle'], time)));
        boss.state = 'start-bullet-hell';
    } else {
        hover(height/3 - boss.h/2);
    }

    if (boss.tangible) {
        bulletCheck(boss);
    }
}

function makeSpiralExplosion() {
    function updateSpiralExplosion(dt, spiral) {
        spiral.rotate += dt/1000;
        var elapsed = time - spiral.start;
        if (elapsed >= 10000) {
            spiral.remove = true;
        }
    }

    function drawSpiralExplosion(spiral) {
        push();
        translate(spiral.x, spiral.y);
        rotate(spiral.rotate);
        var elapsed = time - spiral.start;
        var w = lerp(0, 2000, min(1.0, elapsed/3000));
        noStroke();
        for (i = 0; i < 10; i++) {
            rotate(i*2*PI/10);
            fill(['yellow','black'][i%2]);
            triangle(0, 0, -w, 2*max(width,height), w, 2*max(width,height));
        }
        pop();
    }

    return {
        id: 'spiral',
        draw: drawSpiralExplosion,
        update: updateSpiralExplosion,
        x: width/2,
        y: height/2,
        rotate: 0,
        start: time
    };
}


function bananaBossScene2() {
    timed_events = [];
    objects = [];
    //makeBroccoli();
    broccoli.gun = guns['double'];
    scoreup = function () {};

    egroup = setupGroup();
    objects.push(egroup);
    egroup.subobjects.push(makeInfoPanel());

    objects.push(broccoli);
    bindBroccoliControls();

    var boss = makeBananaBoss();
    // rebind to new functions
    boss.draw = drawBananaBoss;
    boss.update = updateBananaBoss2;
    boss.destroy = function () {
        clearID('enemy_ship');
        timed_events.push({
            when: time + 3000,
            func: function () {
                bossdefeated = true;
                infiniteLevelScene();
            }
        });
    };
    objects.push(boss);
}

// ++++++====== Game stuff ======++++++

function handle_timed_events() {
    for (i = 0; i < timed_events.length; i++) {
        if (timed_events[i].when <= time) {
            var ev = timed_events.shift(i);
            ev.func();
        }
    }
}

function drawObjects(objs) {
    objs.forEach(function (x) {
        if (x.hasOwnProperty('draw')) {
            x.draw(x);
        }
    });
}

function updateObjects(objs) {
    objs.forEach(function (x) {
        if (x.hasOwnProperty('update')) {
            x.update(time-last_time, x);
        }
    });
}

function filterObjects(objs) {
    return objs.filter(function (o) {
        if (o.hasOwnProperty('remove')) {
            if (o.remove && o.hasOwnProperty('destroy')) {
                o.destroy();
            }
            return !o.remove;
        } else {
            return true;
        }});
}

function clearID(id) {
    objects = objects.filter(function (o) {
        return o.id != id;
    });
}

function draw() {
    /*
    if (dark) {
        background('grey');
    } else {
        background('white');
    }
    */
    background(130, 85, 25);

    if (time === 0 && last_time === 0) {
        time = millis();
    } else if (last_time === 0) {
        last_time = time;
        time = millis();
    } else {
        last_time = time;
        time = millis();
    }

    handle_timed_events();

    drawObjects(objects);
    updateObjects(objects);
    objects = filterObjects(objects);
}

function findObject(x, y) {
    var nearest = null;
    var distance = 9999999999999.0;
    objects.forEach(function (o) {
        if (o.hasOwnProperty('x') &&
            o.hasOwnProperty('y')) {
            var d = dist(o.x, o.y, x, y);
            if (d < distance) {
                nearest = o;
                distance = d;
            }
        }
    });

    return nearest;
}

function mousePressed() {
    /*
    var o = findObject(mouseX, mouseY);
    if (o) {
        console.log(o);
    }
    */
}
