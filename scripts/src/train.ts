import { MnistData } from "./data";
import { Models } from "./models";

declare var self: Worker;

self.onmessage = async (event: MessageEvent) => {
  const models: (keyof typeof Models)[] = event.data;

  const data = new MnistData();

  for (const m of models) {
    const model = new Models[m](data);
    await model.fit();

    const [loss, accuracy] = model.evaluate();

    console.log("accuracy:", accuracy.arraySync());
    console.log("loss:", loss.arraySync());

    model.saveModel(accuracy, loss);
  }

  self.postMessage("COMPLETED");
};
