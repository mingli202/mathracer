import * as tf from "@tensorflow/tfjs-node";
import { MnistData, NUM_TEST_ELEMENTS, NUM_TRAIN_ELEMENTS } from "./data";

async function main() {
  const data = new MnistData();

  const [trainXs, trainYs] = tf.tidy(() => {
    const d = data.nextTrainBatch(NUM_TRAIN_ELEMENTS);
    return [d.xs.reshape([NUM_TRAIN_ELEMENTS, 28, 28, 1]), d.labels];
  });

  const [testXs, testYs] = tf.tidy(() => {
    const d = data.nextTestBatch(NUM_TEST_ELEMENTS);
    return [d.xs.reshape([NUM_TEST_ELEMENTS, 28, 28, 1]), d.labels];
  });

  const mini = tf.sequential();
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

  mini.compile({
    optimizer: "adam",
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  await mini.fit(trainXs, trainYs, {
    batchSize: 64,
    epochs: 60,
    validationData: [testXs, testYs],
    callbacks: [
      tf.callbacks.earlyStopping({
        monitor: "loss",
        patience: 5,
        restoreBestWeights: true,
      }),
    ],
  });

  const [loss, accuracy] = mini.evaluate(testXs, testYs) as tf.Scalar[];
  console.log("accuracy:", accuracy);
  console.log("loss:", loss);
}

main();
