import type { MnistData } from "../data";
import { Model } from "../model";
import * as tf from "@tensorflow/tfjs-node";

/**
 * The smallest model with only ~1.4k params
 * */
export class Mini extends Model {
  constructor(
    data: MnistData,
    compileArgs?: tf.ModelCompileArgs,
    modelFitArgs?: tf.ModelFitArgs,
  ) {
    const layers = [
      tf.layers.inputLayer({ inputShape: [28, 28, 1] }),
      tf.layers.conv2d({
        filters: 8,
        kernelSize: 3,
        activation: "relu",
        padding: "same",
      }),
      tf.layers.maxPooling2d({ poolSize: 2 }),
      tf.layers.conv2d({
        filters: 16,
        kernelSize: 3,
        activation: "relu",
        padding: "same",
      }),
      tf.layers.maxPooling2d({ poolSize: 2 }),
      tf.layers.globalAveragePooling2d({}),
      tf.layers.dense({ units: 10, activation: "softmax" }),
    ];

    super(layers, "mini", data, compileArgs, {
      ...modelFitArgs,
      batchSize: modelFitArgs?.batchSize ?? 64,
      epochs: modelFitArgs?.epochs ?? 60,
    });
  }
}
