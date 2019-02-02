"use strict";

var slider_rot;
var button_seed;
var label_rot;
var label_perf;
var input_seed;
var rot;
var div_inputs;

var hide = false,
  prog = 1,
  growing = false,
  mutating = false,
  randSeed = 80,
  paramSeed = Math.floor(Math.random() * 1000),
  randBias = 0;

function setup() {
  createCanvas(
    window.innerWidth, //
    window.innerHeight
  );

  slider_rot = createSlider(0, PI / 2, PI / 2 / 4, PI / 2 / (3 * 5 * 8));
  slider_rot.position(10, 50);

  slider_rot.input(function() {
    readInputs(true);
  });

  label_rot = createSpan("Split angle");
  label_rot.position(150, 50);
  input_seed = createInput(randSeed);
  input_seed.position(50, 160);
  input_seed.style("width", "50px");

  button_seed = createButton("Watch it grow!");
  button_seed.position(110, 160);
  button_seed.mousePressed(function() {
    randSeed = input_seed.value();
    startGrow();
  });

  paramSeed = 1000 * random();
  randomSeed(randSeed);

  readInputs(true);

  label_perf = createSpan("Generated in #ms");
  label_perf.position(10, 310);

  div_inputs = createDiv("");

  startGrow();
}

function readInputs() {
  rot = slider_rot.value();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// hook for p5.js, called iteratively
function draw() {
  var startTime = millis();

  stroke(255, 255, 255);

  background(0, 0, 0);
  translate(width / 2, height);
  scale(1, -1);

  translate(0, 20);

  randomSeed(randSeed);

  for (var i = 0; i < 5; i++) {
    rootBranch.grow();
    drawNode(rootBranch.children[0]);
  }

  var endTime = millis();
  label_perf.html(
    "Generated in " + Math.floor((endTime - startTime) * 10) / 10 + "ms"
  );

  noLoop();
}

// Should really be done with polymorphism
function drawNode(node) {
  if (node instanceof Leaf) {
    drawLeaf(node);
  } else if (node instanceof Branch) {
    drawBranch(node);
  } else {
    throw "Unexpected type in tree";
  }
}

function drawLeaf(leaf) {
  // Save graphic settings
  push();

  // let shade = leaf.calculateShade(1.0, leaf, rootBranch);
  // shade = Math.max(0, shade);
  let shade = 1;
  stroke(0, 200 * shade, 55 * shade);
  strokeWeight(leaf.width);
  line(
    leaf.startX, //
    leaf.startY,
    leaf.endX,
    leaf.endY
  );

  // Restore graphic settings
  pop();
}

function drawBranch(branch) {
  // Save graphic settings
  push();

  stroke(255, 255, 255);
  strokeWeight(branch.width);
  line(
    branch.startX, //
    branch.startY,
    branch.endX,
    branch.endY
  );

  var arrayLength = branch.children.length;
  for (var i = 0; i < arrayLength; i++) {
    drawNode(branch.children[i]);
  }

  // Restore graphic settings
  pop();
}

function startGrow() {
  loop();
}
