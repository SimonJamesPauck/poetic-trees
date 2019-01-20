"use strict";

var slider_size,
  slider_level,
  slider_rot,
  slider_lenRand,
  slider_branchProb,
  slider_rotRand,
  slider_leafProb;

var button_seed, //
  button_newSeed,
  button_randomParams;

var label_size,
  label_level,
  label_rot,
  label_lenRand,
  label_branchProb,
  label_rotRand,
  label_leafProb,
  label_perf,
  label_seed,
  label_source,
  label_source2;

var div_inputs;

var input_seed, //
  size,
  maxLevel,
  rot,
  lenRand,
  branchProb,
  rotRand,
  leafProb;

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

  slider_size = createSlider(
    100,
    200,
    /mobile/i.test(window.navigator.userAgent) ? 100 : 150,
    1
  );
  slider_size.position(10, 10);
  slider_level = createSlider(1, 13, 11, 1);
  slider_level.position(10, 30);
  slider_rot = createSlider(0, PI / 2, PI / 2 / 4, PI / 2 / (3 * 5 * 8));
  slider_rot.position(10, 50);
  slider_lenRand = createSlider(0, 1, 1, 0.01);
  slider_lenRand.position(10, 70);
  slider_branchProb = createSlider(0, 1, 0.9, 0.01);
  slider_branchProb.position(10, 90);
  slider_rotRand = createSlider(0, 1, 0.1, 0.01);
  slider_rotRand.position(10, 110);
  slider_leafProb = createSlider(0, 1, 0.5, 0.01);
  slider_leafProb.position(10, 130);

  slider_size.input(function() {
    readInputs(true);
  });
  slider_level.input(function() {
    readInputs(true);
  });
  slider_rot.input(function() {
    readInputs(true);
  });
  slider_lenRand.input(function() {
    readInputs(true);
  });
  slider_branchProb.input(function() {
    readInputs(true);
  });
  slider_rotRand.input(function() {
    readInputs(true);
  });
  slider_leafProb.input(function() {
    readInputs(true);
  });

  label_size = createSpan("Size");
  label_size.position(150, 10);
  label_level = createSpan("Recursion level");
  label_level.position(150, 30);
  label_rot = createSpan("Split angle");
  label_rot.position(150, 50);
  label_lenRand = createSpan("Length variation");
  label_lenRand.position(150, 70);
  label_branchProb = createSpan("Split probability");
  label_branchProb.position(150, 90);
  label_rotRand = createSpan("Split rotation variation");
  label_rotRand.position(150, 110);
  label_leafProb = createSpan("Flower probability");
  label_leafProb.position(150, 130);

  label_seed = createSpan("Seed:");
  label_seed.position(10, 162);

  input_seed = createInput(randSeed);
  input_seed.position(50, 160);
  input_seed.style("width", "50px");

  button_seed = createButton("Watch it grow!");
  button_seed.position(110, 160);
  button_seed.mousePressed(function() {
    randSeed = input_seed.value();
    startGrow();
  });

  button_newSeed = createButton("Generate new tree");
  button_newSeed.position(10, 190);
  button_newSeed.mousePressed(function() {
    randSeed = Math.floor(Math.random() * 1000);
    prog = 100;
    input_seed.value(randSeed);
    startGrow();
  });

  button_randomParams = createButton("Randomise parameters");
  button_randomParams.position(10, 220);
  button_randomParams.mousePressed(function() {
    randomSeed(paramSeed);

    slider_level.value(
      1 * slider_level.value() + 4 * rand2() * slider_level.attribute("step")
    );
    slider_rot.value(
      1 * slider_rot.value() + 4 * rand2() * slider_rot.attribute("step")
    );
    slider_lenRand.value(
      1 * slider_lenRand.value() +
        4 * rand2() * slider_lenRand.attribute("step")
    );
    slider_branchProb.value(
      1 * slider_branchProb.value() +
        4 * rand2() * slider_branchProb.attribute("step")
    );
    slider_rotRand.value(
      1 * slider_rotRand.value() +
        4 * rand2() * slider_rotRand.attribute("step")
    );
    slider_leafProb.value(
      1 * slider_leafProb.value() +
        4 * rand2() * slider_leafProb.attribute("step")
    );

    paramSeed = 1000 * random();
    randomSeed(randSeed);

    readInputs(true);
  });

  label_perf = createSpan("Generated in #ms");
  label_perf.position(10, 310);
  //label_perf.style('display', 'none');

  label_source = createA(
    "https://github.com/someuser-321/TreeGenerator",
    "Check it out on GitHub!"
  );
  label_source.position(10, 330);
  label_source2 = createA(
    "https://someuser-321.github.io/TreeGenerator/TreeD.html",
    "See me in 3D!"
  );
  label_source2.position(10, 350);

  div_inputs = createDiv("");

  readInputs(false);
  startGrow();
}

function readInputs(updateTree) {
  size = slider_size.value();
  maxLevel = slider_level.value();
  rot = slider_rot.value();
  lenRand = slider_lenRand.value();
  branchProb = slider_branchProb.value();
  rotRand = slider_rotRand.value();
  leafProb = slider_leafProb.value();

  if (updateTree && !growing) {
    prog = maxLevel + 1;
    loop();
  }
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

  for (var i = 0; i < 25; i++) {
    rootBranch.grow();
    drawBranch(rootBranch);
  }

  var endTime = millis();
  label_perf.html(
    "Generated in " + Math.floor((endTime - startTime) * 10) / 10 + "ms"
  );

  noLoop();
}

function drawBranch(branch) {
  // Save graphic settings
  push();

  strokeWeight(branch.width);
  line(
    branch.startX, //
    branch.startY,
    branch.endX,
    branch.endY
  );

  var arrayLength = branch.children.length;
  for (var i = 0; i < arrayLength; i++) {
    drawBranch(branch.children[i]);
  }

  // Restore graphic settings
  pop();
}

function startGrow() {
  loop();
}
