import { MnistData } from "./data";
import { Models } from "./models";

async function main() {
  const data = new MnistData();

  const mini = new Models.Mini(data);

  const [loss, accuracy] = mini.evaluate();
  mini.saveModel(accuracy, loss);
}

main();
