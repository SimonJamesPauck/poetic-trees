"use strict";

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

    this.name = "";
    this.absAngle = parent === null ? 0.0 : parent.angle + angle;
    this.startX = parent === null ? 0.0 : parent.endX;
    this.startY = parent === null ? 0.0 : parent.endY;
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
    this.width = this.width + 0.5;

    var arrayLength = this.children.length;
    for (var i = 0; i < arrayLength; i++) {
      this.children[i].grow();
    }

    if (this.children.length < 2) {
      let br1 = newBranch(
        this, //
        1.0 + randomGaussian(0, 0.1)
      );
      if (Math.abs(br1.absAngle) < 2.0 && !br1.isCloseToAnyFrom(rootBranch)) {
        br1.name = this.name + "L";
        console.log("Added: " + br1.name);
        this.children.push(br1);
      }

      let br2 = newBranch(
        this, //
        -1.0 + randomGaussian(0, 0.1)
      );
      if (Math.abs(br2.absAngle) < 2.0 && !br2.isCloseToAnyFrom(rootBranch)) {
        br2.name = this.name + "R";
        console.log("Added: " + br2.name);
        this.children.push(br2);
      }
    }
  }

  isCloseToAnyFrom(branch) {
    if (this.isCloseTo(branch)) {
      return true;
    } else {
      var arrayLength = branch.children.length;
      for (var i = 0; i < arrayLength; i++) {
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
    10.0
  );
}

var rootBranch = newBranch(null, 0.0);
