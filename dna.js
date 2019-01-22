"use strict";

const nodeProduction = 0.1;

class Root {
  constructor() {
    this.canSupply = 999999;
    this.absAngle = 0.0;
    this.endX = 0.0;
    this.endY = 0.0;

    this.branch = newBranch(this, 0.0);
    this.branch.name = "0";
  }

  grow() {
    this.branch.grow(this.canSupply);
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
}

class Branch extends TreeNode {
  constructor(
    parent, //
    angle,
    length,
    width
  ) {
    super(parent);

    this.angle = angle;
    this.length = length;
    this.width = width;

    this.name = "B";
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

    this.children.push(new Leaf(this, 0.0));
    this.children.push(new Leaf(this, 1));
    this.children.push(new Leaf(this, -1));
  }

  get supplyPotential() {
    return this.width * this.width * 0.01;
  }

  cullBranches() {
    this.children = this.children.filter((child, index, children) => {
      let cutoff = randomGaussian(0, 3);
      console.log("cutoff: " + cutoff);
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

    if (canSupply - canProduce > nodeProduction * 2 && numberOfChildren < 2) {
      let br1 = newBranch(
        this, //
        randomGaussian(0, 0.5)
      );
      br1.name = this.name + br1.name + (numberOfChildren + 1);
      console.log("Added: " + br1.name);
      this.children.push(br1);

      // let br2 = newBranch(
      //   this, //
      //   -0.5 + randomGaussian(0, 0.1)
      // );
      // br2.name = this.name + (numberOfChildren + 2);
      // console.log("Added: " + br2.name);
      // this.children.push(br2);
    }

    if (canSupply < canProduce) {
      // should grow
    }

    if (supply < this.supplyPotential) {
      // feed below
      return production;
    } else {
      this.width = Math.sqrt((this.supplyPotential + production) * 100);
      return 0.0;
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
  angle
) {
  return new Branch(
    parent, //
    angle,
    50.0,
    2.0
  );
}

var rootBranch = new Root();
