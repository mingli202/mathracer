import type { MnistData } from "../data";
import { Model } from "../model";
import * as tf from "@tensorflow/tfjs-node";

export class MobileNetMini extends Model {
  constructor(
    data: MnistData,
    compileArgs?: tf.ModelCompileArgs,
    modelFitArgs?: tf.ModelFitArgs,
  ) {
    const layers = [
      tf.layers.inputLayer({ inputShape: [28, 28, 1] }),
      tf.layers.zeroPadding2d({ padding: 2 }),
      tf.layers.conv2d({
        filters: 8,
        kernelSize: 3,
        strides: 2,
        padding: "same",
      }),
      tf.layers.batchNormalization(),
      tf.layers.reLU(),
      tf.layers.separableConv2d({
        filters: 16,
        kernelSize: 3,
        strides: 2,
        padding: "same",
      }),
      tf.layers.batchNormalization(),
      tf.layers.reLU(),
      tf.layers.separableConv2d({
        filters: 32,
        kernelSize: 3,
        strides: 2,
        padding: "same",
      }),
      tf.layers.batchNormalization(),
      tf.layers.reLU(),
      tf.layers.separableConv2d({
        filters: 64,
        kernelSize: 3,
        strides: 2,
        padding: "same",
      }),
      tf.layers.batchNormalization(),
      tf.layers.reLU(),
      tf.layers.separableConv2d({
        filters: 128,
        kernelSize: 3,
        strides: 2,
        padding: "same",
      }),
      tf.layers.batchNormalization(),
      tf.layers.reLU(),
      tf.layers.globalAveragePooling2d({}),
      tf.layers.dense({ units: 10, activation: "softmax" }),
    ];

    super(layers, "mobileNetMini", data, compileArgs, {
      ...modelFitArgs,
      epochs: modelFitArgs?.epochs ?? 50,
    });
  }
}
