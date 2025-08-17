import { Args } from "./args";
import { MnistData } from "./data";
import type { Models } from "./models";

async function main(argsArr: string[]) {
  const args = new Args(argsArr);

  if (args.model) {
    const data = new MnistData();
    const model = new args.model(data, undefined, {
      batchSize: args.batchSize,
      epochs: args.maxEpochs,
    });
    await model.fit();

    const [loss, accuracy] = model.evaluate();

    console.log("accuracy:", accuracy.arraySync());
    console.log("loss:", loss.arraySync());

    model.saveModel(accuracy, loss);
  } else {
    const modelsBatch = [
      ["LeNet", "Mini", "TfjsTutorial"],
      ["ChatGpt5", "MobileNetMini", "KerasTutorial"],
    ] as const;

    const nWorkers = modelsBatch.length;
    const workers: Promise<Worker>[] = [];

    for (const i of Array(nWorkers).keys()) {
      console.log("Spawned worker ", i);

      workers.push(
        new Promise((resolve) => {
          const worker = new Worker("./train.ts", {
            preload: ["./data.ts", "./models/index.ts"],
          });
          worker.postMessage(modelsBatch[i]);
          worker.onmessage = (event: MessageEvent) => {
            if (event.data === "COMPLETED") {
              resolve(worker);
            }
          };
        }),
      );
    }

    const completedWorkers = await Promise.all(workers);
    for (const worker of completedWorkers) {
      worker.terminate();
    }
  }
}

main(process.argv.slice(1));
