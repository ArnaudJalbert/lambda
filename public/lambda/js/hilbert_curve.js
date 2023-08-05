const BASE_VECTORS = [
  new paper.Point(0, 0),
  new paper.Point(0, 1),
  new paper.Point(1, 1),
  new paper.Point(1, 0),
];

class HilbertCurve {
  constructor(order, width, height) {
    this.order = order;
    this.width = width;
    this.height = height;
    this.subdivisions = Math.pow(2, order);
    this.total_points = this.subdivisions * this.subdivisions;
    this.width_offset = this.width / this.subdivisions;
    this.height_offset = this.height / this.subdivisions;
    this.path = this.get_path();
  }

  hilbert(iteration) {
    // only keep the last two bits and zero the rest
    // example 10 = 1010 -> 0010 = 2
    let point_index = iteration & 3;
    // this gives us the index of the right vector to use
    let point = BASE_VECTORS[point_index];

    let quadrant_iteration = iteration;
    for (
      let quadrant_offset = 1;
      quadrant_offset < this.order;
      quadrant_offset++
    ) {
      // shift by two bits to get the index of the quadrant
      quadrant_iteration = quadrant_iteration >>> 2;
      let quadrant_index = quadrant_iteration & 3;

      let offset = Math.pow(2, quadrant_offset);

      if (quadrant_index === 0) {
        point = new paper.Point(point.y, point.x);
      } else if (quadrant_index === 1) {
        point = point.add(0, offset);
      } else if (quadrant_index === 2) {
        point = point.add(offset);
      } else if (quadrant_index === 3) {
        point = new paper.Point(offset - 1 - point.y, offset - 1 - point.x);
        point = point.add(offset, 0);
      }
    }

    return point;
  }

  get_path() {
    let path = Array(this.total_points);
    for (let index = 0; index < this.total_points; index++) {
      // compute the point
      let point = this.hilbert(index);
      point = point.multiply(this.width_offset, this.height_offset);
      point = point.add(this.width_offset / 2, this.height_offset / 2);

      path[index] = point;
    }
    console.log(path);
    return path;
  }
}

Number.prototype.map = function(in_min, in_max, out_min, out_max) {
  return ((this - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

const canvas = document.querySelector("#hilbert_curve");

paper.setup(canvas);

let hilbert_curve = new HilbertCurve(
  5,
  canvas.scrollWidth,
  canvas.scrollHeight
);

var lines = Array(hilbert_curve.total_points - 1);

for (let index = 0; index < hilbert_curve.path.length - 1; index++) {
  let line = new paper.Path.Line(
    hilbert_curve.path[index],
    hilbert_curve.path[index + 1]
  );
  line.strokeColor = new paper.Color(
    index.map(0, hilbert_curve.path.length, 0.5, 0.7)
  );
  line.strokeWidth = 3;
  lines[index] = line;
}
