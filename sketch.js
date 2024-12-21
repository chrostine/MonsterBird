let vægge = [];
let fugl;
let tyngdekraft;
let spilErTabt = false;
let billede = [];
let monner;
let point = 0;

function preload() {
  // Monster array oprettes ved at gå gennem hvert billede i for-loop
  for (let i = 0; i < 19; i++) {
    billede[i] = loadImage("data/monster" + nf(i, 2) + ".png");
  }
  monner = loadImage("data/monner.jpg");
}

function setup() {
  createCanvas(1024, 768);
  tyngdekraft = createVector(0, 0.32);
  resetSpil();
  monner.resize(width, height);
}

function draw() {
  image(monner, 0, 0);
  // Vægge
  if (frameCount % 160 === 0) {
    let index1 = int(random(0, billede.length));
    let index2 = int(random(0, billede.length));
    vægge.push(new Væg(billede[index1], billede[index2]));
  }
  for (let i = vægge.length - 1; i >= 0; i--) {
    let aktuelVæg = vægge[i];
    aktuelVæg.opdater();
    aktuelVæg.vis();
    if (aktuelVæg.fjern()) {
      vægge.splice(i, 1);
      point++;
    }
  }

  // Fugl
  fugl.tilføjKraft(tyngdekraft);
  fugl.opdater();
  fugl.vis();

  // End game?
  if (vægge.length > 0) {
    if (fugl.tjekKollision(vægge[0]) || fugl.erDød()) {
      spilErTabt = true;
      noLoop();
      fill(55, 189, 50);
      textSize(50);
      textAlign(CENTER);
      text("Spillet er slut!\nTryk S for at starte forfra.", width / 2, 200);
    }
  }

  fill(55, 189, 50);
  textSize(100);
  textAlign(CENTER);
  text(point, width / 2, 100);
}

function keyPressed() {
  if (key === " ") {
    fugl.tilføjKraft(createVector(0, -10));
  }
  if (key === "s" && spilErTabt) {
    resetSpil();
  }
}

function resetSpil() {
  vægge = [];
  fugl = new Fugl();
  spilErTabt = false;
  point = 0;
  loop();
}

class Fugl {
  constructor() {
    this.position = createVector(50, height / 2);
    this.hastighed = createVector(0, -5); // indledende puf opad :)
    this.acceleration = createVector(0, 0);
    this.diameter = 50;
    this.tand = loadImage("data/tand.png");
    this.tand.resize(this.diameter, this.diameter);
  }

  opdater() {
    this.hastighed.add(this.acceleration);
    this.hastighed.limit(8.0); // begræns fuglens max hastighed
    this.position.add(this.hastighed);
    this.acceleration.mult(0); // gang med 0 for at nulstille acceleration
  }

  vis() {
    push();
    fill(255, 119, 0);
    noStroke();
    image(this.tand, this.position.x, this.position.y);
    pop();
  }

  tilføjKraft(kraft) {
    this.acceleration.add(kraft);
  }

  tjekKollision(aktuelvæg) {
    let øverste = this.cirkelRektangelOverlap(
      this.position.x,
      this.position.y,
      this.diameter / 2,
      aktuelvæg.xpos,
      0,
      aktuelvæg.bredde,
      aktuelvæg.topHøjde
    ); // øverste væg
    let nederste = this.cirkelRektangelOverlap(
      this.position.x,
      this.position.y,
      this.diameter / 2,
      aktuelvæg.xpos,
      height - aktuelvæg.bundHøjde,
      aktuelvæg.bredde,
      aktuelvæg.bundHøjde
    ); // nederste væg
    return øverste || nederste;
  }

  erDød() {
    return this.position.y > height;
  }

  cirkelRektangelOverlap(cx, cy, radius, rx, ry, rw, rh) {
    // Skamløst sakset herfra: https://www.jeffreythompson.org/collision-detection/circle-rect.php

    // temporary variables to set edges for testing
    let testX = cx;
    let testY = cy;

    // which edge is closest?
    if (cx < rx) testX = rx; // test left edge
    else if (cx > rx + rw) testX = rx + rw; // right edge
    if (cy < ry) testY = ry; // top edge
    else if (cy > ry + rh) testY = ry + rh; // bottom edge

    // get distance from closest edges
    let distX = cx - testX;
    let distY = cy - testY;
    let distance = sqrt(distX * distX + distY * distY);

    // if the distance is less than the radius, collision!
    return distance <= radius;
  }
}

class Væg {
  constructor(foto1, foto2) {
    this.xpos = width;
    this.xSpeed = -3.0;
    this.bredde = 250;
    this.hulHøjde = 250;
    this.hulPosition = random(this.hulHøjde / 2, height - this.hulHøjde / 2);
    this.billede1 = foto1;
    this.billede2 = foto2;
    this.billede1.resize(this.bredde, 0);
    this.billede2.resize(this.bredde, 0);
    this.vinkel = random(TWO_PI);
    this.amplitude = map(point, 0, 5, 0.0, 60);
    this.amplitude = constrain(this.amplitude, 0, 60);
  }

  opdater() {
    this.xpos += this.xSpeed;
  }

  vis() {
    let yOffset = sin(frameCount * 0.06 + this.vinkel) * this.amplitude;
    this.topHøjde = this.hulPosition - this.hulHøjde / 2;
    this.bundHøjde = height - this.hulPosition - this.hulHøjde / 2;
    this.topHøjde += yOffset;
    this.bundHøjde -= yOffset;

    // Øverste billede
    push();
    image(this.billede1, this.xpos, -this.billede1.height + this.topHøjde);
    pop();
    // Nederste billede
    push();
    image(this.billede2, this.xpos, height - this.bundHøjde);
    pop();
  }

  fjern() {
    return this.xpos < -this.bredde;
  }
}
