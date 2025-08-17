import type { MnistData } from "../data";
import { Model } from "../model";
import * as tf from "@tensorflow/tfjs-node";

export class TfjsTutorial extends Model {
  constructor(
    data: MnistData,
    compileArgs?: tf.ModelCompileArgs,
    modelFitArgs?: tf.ModelFitArgs,
  ) {
    const layers = [
      tf.layers.inputLayer({ inputShape: [28, 28, 1] }),
      tf.layers.conv2d({
        filters: 8,
        kernelSize: 5,
        activation: "relu",
        kernelInitializer: "varianceScaling",
      }),
      tf.layers.maxPool2d({ poolSize: 2, strides: 2 }),
      tf.layers.conv2d({
        filters: 15,
        kernelSize: 5,
        activation: "relu",
        kernelInitializer: "varianceScaling",
      }),
      tf.layers.maxPool2d({ poolSize: 2, strides: 2 }),
      tf.layers.flatten(),
      tf.layers.dense({
        units: 10,
        activation: "softmax",
        kernelInitializer: "varianceScaling",
      }),
    ];

    super(layers, "tfjsTutorial", data, compileArgs, modelFitArgs);
  }
}
