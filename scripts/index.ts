import { MnistData } from "./data";
import { Mini } from "./models";

async function main() {
  const data = new MnistData();

  const mini = new Mini(data);

  const [loss, accuracy] = mini.evaluate();
  mini.saveModel(accuracy, loss);
}

main();
