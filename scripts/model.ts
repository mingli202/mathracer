import * as tf from "@tensorflow/tfjs-node";
import type { MnistData } from "./data";
import type { UnresolvedLogs } from "@tensorflow/tfjs-layers/dist/logs";
import fs from "fs";

class BestWeightCallback extends tf.Callback {
  #bestLoss = Number.MAX_VALUE;
  #bestWeights?: tf.Tensor[];

  override async onEpochEnd(
    _epoch: number,
    logs?: UnresolvedLogs,
  ): Promise<void> {
    if (logs && "loss" in logs) {
      const loss = logs["loss"] as number;

      if (loss < this.#bestLoss) {
        this.#bestLoss = loss;
        this.#bestWeights = this.model.getWeights();
      }
    }
  }

  override async onTrainEnd(_logs?: UnresolvedLogs): Promise<void> {
    if (this.#bestWeights) {
      this.model.setWeights(this.#bestWeights);
    }
  }
}

export abstract class Model {
  public model: tf.Sequential;

  constructor(
    layers: tf.layers.Layer[],
    name: string,
    private data: MnistData,
    compileArgs?: tf.ModelCompileArgs,
    private modelFitArgs?: tf.ModelFitArgs,
  ) {
    this.model = tf.sequential({ name, layers });
    console.log("Model: ", this.model.name);
    this.model.summary();
    this.model.compile({
      optimizer: "adam",
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
      ...compileArgs,
    });
  }

  public async fit(): Promise<tf.History> {
    const [trainXs, trainYs] = this.data.trainData();
    const [testXs, testYs] = this.data.testData();

    return await this.model.fit(trainXs, trainYs, {
      batchSize: 128,
      epochs: 60,
      shuffle: true,
      validationData: [testXs, testYs],
      callbacks: [
        new BestWeightCallback(),
        tf.callbacks.earlyStopping({
          monitor: "loss",
          patience: 5,
        }),
      ],

      ...this.modelFitArgs,
    });
  }

  public evaluate(): [tf.Scalar, tf.Scalar] {
    const [testXs, testYs] = this.data.testData();
    return this.model.evaluate(testXs, testYs) as [tf.Scalar, tf.Scalar];
  }

  saveModel(accuracy: tf.Scalar, loss: tf.Scalar) {
    // save model
    this.model.save(`file://./artifacts/${this.model.name}`);

    // save metatdata
    const filename = "./artifacts/metadata.json";
    const name = this.model.name;
    const totalParams = this.model.countParams();

    let json: Record<
      string,
      {
        totalParams: number;
        accuracy: number;
        loss: number;
      }
    > = {};

    if (fs.existsSync(filename)) {
      const file = fs.readFileSync(filename, "utf8");
      json = JSON.parse(file);
    }

    json[name] = {
      totalParams,
      accuracy: accuracy.arraySync(),
      loss: loss.arraySync(),
    };

    fs.writeFileSync(filename, JSON.stringify(json, null, 2));
  }
}
