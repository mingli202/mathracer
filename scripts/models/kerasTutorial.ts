import type { MnistData } from "../data";
import { Model } from "../model";
import * as tf from "@tensorflow/tfjs-node";

export class KerasTutorial extends Model {
  constructor(data: MnistData) {
    const layers = [
      tf.layers.inputLayer({ inputShape: [28, 28, 1] }),
      tf.layers.conv2d({ filters: 32, kernelSize: 3, activation: "relu" }),
      tf.layers.maxPool2d({ poolSize: 2 }),
      tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: "relu" }),
      tf.layers.maxPool2d({ poolSize: 2 }),
      tf.layers.flatten(),
      tf.layers.dropout({ rate: 0.5 }),
      tf.layers.dense({ units: 10, activation: "softmax" }),
    ];

    super(layers, "kerasTutorial", data);
  }
}
