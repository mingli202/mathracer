import type { MnistData } from "../data";
import { Model } from "../model";
import * as tf from "@tensorflow/tfjs-node";

export class LeNet extends Model {
  constructor(data: MnistData) {
    const layers = [
      tf.layers.inputLayer({ inputShape: [28, 28, 1] }),
      tf.layers.zeroPadding2d({ padding: 2 }),
      tf.layers.conv2d({ filters: 6, kernelSize: 5, activation: "tanh" }),
      tf.layers.avgPool2d({ strides: 2, poolSize: 2 }),
      tf.layers.conv2d({ filters: 16, kernelSize: 5, activation: "tanh" }),
      tf.layers.avgPool2d({ strides: 2, poolSize: 2 }),
      tf.layers.dense({ units: 120, activation: "tanh" }),
      tf.layers.flatten(),
      tf.layers.dense({ units: 84, activation: "tanh" }),
      tf.layers.dense({ units: 10, activation: "softmax" }),
    ];

    super(layers, "leNet", data);
  }
}
