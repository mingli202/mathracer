import { MnistData } from "./data";
import { Models } from "./models";

async function main(args: string[]) {
  const data = new MnistData();

  // to not call the constructor
  let Model = Models.Mini;
  let batchSize: number | undefined;
  let maxEpochs: number | undefined;

  if (args.length > 0) {
    if (args.includes("--help")) {
      printHelp();
      process.exit(1);
    }

    const argsStr = ` ${args.join(" ")} `;

    const modelArg = argsStr.match(/ --model (\w+) /);
    const batchSizeArg = argsStr.match(/ --batch-size (\d+) /);
    const maxEpochsArg = argsStr.match(/ --max-epochs (\d+) /);

    if (modelArg) {
      const modelArgStr = modelArg[1];

      if (!modelArgStr || !(modelArgStr in Models)) {
        printHelp();
        process.exit(1);
      }

      Model = Models[modelArgStr as keyof typeof Models];
    }

    if (batchSizeArg) {
      batchSize = Number(batchSizeArg[1]);
    }

    if (maxEpochsArg) {
      maxEpochs = Number(maxEpochsArg[1]);
    }
  }

  const model = new Model(data, undefined, {
    batchSize,
    epochs: maxEpochs,
  });
  await model.fit();

  const [loss, accuracy] = model.evaluate();

  console.log("accuracy:", accuracy.arraySync());
  console.log("loss:", loss.arraySync());

  model.saveModel(accuracy, loss);
}

function printHelp() {
  const lines: string[] = [
    "Usage: bun index.ts [--model <model>] [--max-epochs <epochs>] [--batch-size <size>]",
    "\nOptions:",
    "    --model <model>",
    "        Model to train, defaults to Mini. Avaible models: ",
    `        ${Object.keys(Models).join(", ")}`,
    "    --max-epochs <epochs>",
    "        Train for at most <epochs>. Defaults to 60.",
    "    --batch-size <size>",
    "        Training batch size. Default varies depending on the model.",
  ];

  console.log(lines.join("\n"));
}

main(process.argv.slice(1));
