class Instruction {
  execute(branch) {
    branch.children.push(new Branch());
  }
}

// bind instructions together
class Dna {
  constructor() {
    this.instructions = [
      new Instruction(), //
    ];
  }

  execute(branch) {
    var arrayLength = instructions.length;
    for (var i = 0; i < arrayLength; i++) {
      instructions[i].execute(branch);
    }
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

    this.children = [];
  }

  grow() {
    width = width + 0.5;
    length = length + 1.0;

    var arrayLength = children.length;
    for (var i = 0; i < arrayLength; i++) {
      children[i].grow(branch);
    }

    if (children.length < 2) {
      children.push(
        new Branch(
          this, //
          random(),
          5.0,
          1.0
        )
      );
    }
  }
}
