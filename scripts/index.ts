import { MnistData } from "./data";
import fs from "fs";
import { Mini } from "./model";

async function main() {
  const data = new MnistData();

  const mini = new Mini(data);

  const [loss, accuracy] = mini.evaluate();
  mini.saveModel(accuracy, loss);
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
