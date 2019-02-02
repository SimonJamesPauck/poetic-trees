"use strict";

const nodeProduction = 0.1;

class Root {
  constructor() {
    this.canSupply = 999999;
    this.absAngle = 0.0;
    this.endX = 0.0;
    this.endY = 0.0;

    var growthInstructions = this.newGrowthInstructions();

    this.children = [];
    this.children.push(newBranch(this, 0.0, growthInstructions));
    this.children[0].name = "0";
  }

  grow() {
    this.children[0].grow(this.canSupply);
  }

  newGrowthInstructions() {
    return new GrowthInstructions(
      new GrowthInstruction(-1, parent => new Leaf(parent, 0)),
      new GrowthInstruction(-1, parent => new Leaf(parent, 1)),
      new GrowthInstruction(-1, parent => new Leaf(parent, -1)),
      new GrowthInstruction(
        nodeProduction * 2, //
        parent =>
          newBranch(
            parent, //
            randomGaussian(0, 0.2),
            this.newGrowthInstructions()
          )
      ),
      new GrowthInstruction(
        nodeProduction * 10, //
        parent =>
          newBranch(
            parent, //
            randomGaussian(-1, 0.2),
            this.newGrowthInstructions()
          )
      ),
      new GrowthInstruction(
        nodeProduction * 10, //
        parent =>
          newBranch(
            parent, //
            randomGaussian(1, 0.2),
            this.newGrowthInstructions()
          )
      )
    );
  }
}

class TreeNode {
  constructor(
    parent //
  ) {
    this.parent = parent;
    this.children = [];
  }

  prune() {
    this.parent = null;
    let numberOfChildren = this.children.length;
    for (let i = 0; i < numberOfChildren; i++) {
      this.children[i].prune();
    }
  }
}

class Leaf extends TreeNode {
  constructor(
    parent, //
    angle
  ) {
    super(parent);

    this.angle = angle;
    this.length = 10;
    this.width = 5;

    this.name = "L";
    this.absAngle = parent.absAngle + angle;
    this.startX = parent.endX;
    this.startY = parent.endY;
    this.endX = this.startX + this.length * Math.sin(this.absAngle);
    this.endY = this.startY + this.length * Math.cos(this.absAngle);
  }

  get supplyPotential() {
    return nodeProduction;
  }

  grow(supply) {
    let production = Math.min(this.supplyPotential, supply);
    console.log(this.name + " - production: " + production);
    return production;
  }

  calculateShade(existingShade, targetNode, node) {
    if (existingShade < 0) return existingShade;

    let arrayLength = node.children.length;

    if (arrayLength === 0) {
      // Node is a leaf
      return this.leafShade(existingShade, targetNode, node);
    } else {
      let shade = existingShade;
      for (let i = 0; i < arrayLength; i++) {
        shade = this.calculateShade(shade, targetNode, node.children[i]);
      }
      return shade;
    }
  }

  leafShade(existingShade, targetNode, node) {
    if (node.startY < targetNode.startY + 1.0) {
      return existingShade;
    } else {
      let dx = targetNode.startX - node.startX;
      let dy = targetNode.startY - node.startY;
      let dD = dx * dx + dy * dy;
      return existingShade - 1 / Math.sqrt(dD);
    }
  }
}

class GrowthInstruction {
  constructor(
    threshold, //
    execute
  ) {
    this.threshold = threshold;
    this.execute = execute;
  }
}

class GrowthInstructions {
  constructor(
    ...instructionSet //
  ) {
    this.instructionSet = instructionSet;
    this.index = 0;
  }

  grow(branch, production) {
    let current = this.instructionSet[this.index];
    if (production >= current.threshold) {
      branch.children.push(current.execute(branch));
      this.index++;
      this.grow(branch, production);
    }
  }
}

class Branch extends TreeNode {
  constructor(
    parent, //
    angle,
    length,
    width,
    growthInstructions
  ) {
    super(parent);

    this.angle = angle;
    this.length = length;
    this.width = width;
    this.growthInstructions = growthInstructions;

    this.name = parent.name + "B" + parent.children.length;
    this.absAngle = parent.absAngle + angle;
    this.startX = parent.endX;
    this.startY = parent.endY;
    this.endX = this.startX + this.length * Math.sin(this.absAngle);
    this.endY = this.startY + this.length * Math.cos(this.absAngle);

    console.log(
      "sX: " +
        this.startX +
        ", sY: " +
        this.startY +
        ", eX: " +
        this.endX +
        ", eY: " +
        this.endY +
        ", a: " +
        this.absAngle
    );
  }

  get supplyPotential() {
    return this.width * this.width * 0.01;
  }

  cullBranches() {
    this.children = this.children.filter((child, index, children) => {
      let cutoff = randomGaussian(0, 2);
      // console.log("cutoff: " + cutoff);

      if (child.width > 4.5 && child.width < cutoff) {
        child.prune();
        return false;
      }
      return true;
    });
  }

  grow(supply) {
    this.cullBranches();

    let numberOfChildren = this.children.length;

    // console.log(this.name + " - this.supplyPotential: " + this.supplyPotential);

    // TODO: Introduce efficiency
    let canSupply = Math.min(supply, this.supplyPotential);

    let totalDemand = this.children.reduce(
      (accumulator, child) => accumulator + child.supplyPotential,
      0
    );

    let canProduce = 0.0;
    let normalizedDemand = canSupply / totalDemand;

    for (let i = 0; i < numberOfChildren; i++) {
      let childDemand = this.children[i].supplyPotential;
      let childSupply = normalizedDemand * childDemand;
      canProduce += this.children[i].grow(childSupply);
    }

    console.log(this.name + " - canSupply: " + canSupply);
    console.log(this.name + " - canProduce: " + canProduce);

    let production = Math.min(canProduce, canSupply);

    console.log(this.name + " - production: " + production);

    this.growthInstructions.grow(this, production);

    if (canSupply < canProduce) {
      // should grow
    }

    if (supply < this.supplyPotential) {
      // feed below
      return production;
    } else {
      let maxUsage = supply - this.supplyPotential;
      let useThisMuch = Math.min(production, maxUsage);
      this.width = Math.sqrt((this.supplyPotential + useThisMuch) * 100);
      return production - useThisMuch;
    }
  }

  isCloseToAnyFrom(branch) {
    if (this.isCloseTo(branch)) {
      return true;
    } else {
      let arrayLength = branch.children.length;
      for (let i = 0; i < arrayLength; i++) {
        if (this.isCloseToAnyFrom(branch.children[i])) {
          return true;
        }
      }
      return false;
    }
  }

  isCloseTo(branch) {
    let prox = 2000.0;

    let dx1 = this.endX - branch.endX;
    let dy1 = this.endY - branch.endY;
    let dD1 = dx1 * dx1 + dy1 * dy1;
    console.log(branch.name + ": " + dD1);

    if (dD1 < prox) return true;
    if (dD1 > prox * 2) return false;

    let dx2 = this.endX - branch.startX;
    let dy2 = this.endY - branch.startY;
    let dD2 = dx2 * dx2 + dy2 * dy2;
    console.log(branch.name + ": " + dD2);
    return dD2 < prox;
  }
}

function newBranch(
  parent, //
  angle,
  growthInstructions
) {
  return new Branch(
    parent, //
    angle,
    50.0,
    2.0,
    growthInstructions
  );
}

var rootBranch = new Root();
