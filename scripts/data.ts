import fs from "fs";
import * as tf from "@tensorflow/tfjs-node";

export class MnistData {
  trainLabels: tf.Tensor;
  trainImages: tf.Tensor;
  testLabels: tf.Tensor;
  testImages: tf.Tensor;

  constructor() {
    this.trainLabels = this.parseIdx("./mnist-data/train-labels-idx1-ubyte");
    this.trainImages = this.parseIdx("./mnist-data/train-images-idx3-ubyte");

    this.testLabels = this.parseIdx("./mnist-data/t10k-labels-idx1-ubyte");
    this.testImages = this.parseIdx("./mnist-data/t10k-images-idx3-ubyte");
  }

  /**
   * The IDX file format is a simple format for vectors and multidimensional matrices of various numerical types. The basic format is
   *
   * ```
   * magic number
   * size in dimension 0
   * size in dimension 1
   * size in dimension 2
   * .....
   * size in dimension N
   * data
   * ```
   *
   * The magic number is an integer (MSB first). The first 2 bytes are always 0. The third byte codes the type of the data:
   * ```
   * 0x08: unsigned byte
   * 0x09: signed byte
   * 0x0B: short (2 bytes)
   * 0x0C: int (4 bytes)
   * 0x0D: float (4 bytes)
   * 0x0E: double (8 bytes)
   * ```
   *
   * The 4-th byte codes the number of dimensions of the vector/matrix: 1 for vectors, 2 for matrices.... The sizes in each dimension are 4-byte integers (MSB first, high endian, like in most non-Intel processors). The data is stored like in a C array, i.e. the index in the last dimension changes the fastest.
   * */
  private parseIdx(filename: string) {
    const buffer = fs.readFileSync(filename);
    const [shape, dataStartingIndex] = this.getDimensionSizes(buffer);

    const data = new Uint8Array(
      buffer.subarray(dataStartingIndex, buffer.length),
    );
    const tensor = tf.tensor(data, shape);
    return tensor;
  }

  private getDimensionSizes(buffer: NonSharedBuffer): [number[], number] {
    const nDimensions = buffer[3]!;
    const dimensionSizes: number[] = [];

    let i = 4;
    for (const _i of [...Array(nDimensions).keys()]) {
      const uArray = new Uint8Array(buffer.subarray(i, i + 4));
      const size = parseInt(uArray.toHex(), 16);
      dimensionSizes.push(size);
      i += 4;
    }

    return [dimensionSizes, i];
  }
}

const data = new MnistData();
