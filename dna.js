"use strict";

const nodeProduction = 0.1;

class Root {
  constructor() {
    this.canSupply = 999999;
    this.absAngle = 0.0;
    this.endX = 0.0;
    this.endY = 0.0;
  }
}

class Branch {
  constructor(
    parent, //
    angle,
    length,
    width
  ) {
    this.parent = parent;
    this.angle = angle;
    this.length = length;
    this.width = width;

    this.canSupply = 0;
    this.canProduce = nodeProduction;

    this.name = "";
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

    this.children = [];
  }

  grow() {
    let numberOfChildren = this.children.length;

    for (let i = 0; i < numberOfChildren; i++) {
      if (
        this.children[i].width > 5 &&
        this.children[i].width < randomGaussian(4, 1)
      ) {
        this.children[i].parent = null;
        this.children.splice(i, 1);
        numberOfChildren -= 1;
        break;
      }
    }

    let suppliedWith = this.parent.canSupply;

    let canSupplyPotential = this.width * this.width * 0.01;

    this.canSupply = Math.min(suppliedWith, canSupplyPotential);

    this.canProduce = nodeProduction;

    for (let i = 0; i < numberOfChildren; i++) {
      this.canProduce += this.children[i].canProduce;
    }

    let production = Math.min(this.canProduce, suppliedWith);

    this.width += Math.sqrt(production);

    if (
      this.canSupply - this.canProduce > nodeProduction * 2 &&
      numberOfChildren < 2
    ) {
      let br1 = newBranch(
        this, //
        0.5 + randomGaussian(0, 0.1)
      );
      br1.name = this.name + (numberOfChildren + 1);
      console.log("Added: " + br1.name);
      this.children.push(br1);

      let br2 = newBranch(
        this, //
        -0.5 + randomGaussian(0, 0.1)
      );
      br2.name = this.name + (numberOfChildren + 2);
      console.log("Added: " + br2.name);
      this.children.push(br2);
    }

    for (let i = 0; i < numberOfChildren; i++) {
      this.children[i].grow();
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

var rootBranch = newBranch(new Root(), 0.0);
