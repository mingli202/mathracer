import * as tf from "@tensorflow/tfjs-node";
import { MnistData } from "./data";
import fs from "fs";
import type { UnresolvedLogs } from "@tensorflow/tfjs-layers/dist/logs";

class BestWeightCallback extends tf.Callback {
  #bestLoss = Number.MAX_VALUE;
  public bestWeights?: tf.Tensor[];

  override async onEpochEnd(
    _epoch: number,
    logs?: UnresolvedLogs,
  ): Promise<void> {
    if (logs && "loss" in logs) {
      const loss = logs["loss"] as number;

      if (loss < this.#bestLoss) {
        this.#bestLoss = loss;
        this.bestWeights = this.model.getWeights();
      }
    }
  }
}

async function main() {
  const data = new MnistData();

  const [trainXs, trainYs] = tf.tidy(() => {
    const labels = data.trainLabels.arraySync() as number[];

    return [
      tf.reshape(data.trainImages, [...data.trainImages.shape, 1]),
      tf.tensor(
        labels.map((y) => {
          const arr = Array(10).fill(0);
          arr[y] = 1;
          return arr;
        }),
      ),
    ];
  });
  const [testXs, testYs] = tf.tidy(() => {
    const labels = data.testLabels.arraySync() as number[];

    return [
      tf.reshape(data.testImages, [...data.testImages.shape, 1]),
      tf.tensor(
        labels.map((y) => {
          const arr = Array(10).fill(0);
          arr[y] = 1;
          return arr;
        }),
      ),
    ];
  });

  const mini = tf.sequential({ name: "mini" });
  mini.add(
    tf.layers.conv2d({
      inputShape: [28, 28, 1],
      filters: 8,
      kernelSize: 3,
      activation: "relu",
      padding: "same",
    }),
  );
  mini.add(tf.layers.maxPooling2d({ poolSize: 2 }));
  mini.add(
    tf.layers.conv2d({
      filters: 16,
      kernelSize: 3,
      activation: "relu",
      padding: "same",
    }),
  );
  mini.add(tf.layers.maxPooling2d({ poolSize: 2 }));
  mini.add(tf.layers.globalAveragePooling2d({}));
  mini.add(tf.layers.dense({ units: 10, activation: "softmax" }));

  mini.summary();

  mini.compile({
    optimizer: "adam",
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  const bestWeightCallback = new BestWeightCallback();

  await mini.fit(trainXs, trainYs, {
    batchSize: 64,
    epochs: 2,
    shuffle: true,
    validationData: [testXs, testYs],
    callbacks: [
      bestWeightCallback,
      tf.callbacks.earlyStopping({
        monitor: "loss",
        patience: 5,
      }),
    ],
  });

  const [loss, accuracy] = mini.evaluate(testXs, testYs) as [
    tf.Scalar,
    tf.Scalar,
  ];

  saveModel(
    mini.name,
    mini.countParams(),
    accuracy.arraySync(),
    loss.arraySync(),
  );
}

function saveModel(
  name: string,
  totalParams: number,
  accuracy: number,
  loss: number,
) {
  const filename = "./artifacts/metadata.json";

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
    accuracy,
    loss,
  };

  fs.writeFileSync(filename, JSON.stringify(json, null, 2));
}

main();
