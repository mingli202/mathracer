import { Models } from "./models";

export class Args {
  #args: string;

  get model() {
    const modelArg = this.#args.match(/ --model (\w+) /);

    if (modelArg) {
      const modelArgStr = modelArg[1];

      if (!modelArgStr || !(modelArgStr in Models)) {
        this.printHelp();
        process.exit(1);
      }

      return Models[modelArgStr as keyof typeof Models];
    }
  }

  get batchSize() {
    const batchSizeArg = this.#args.match(/ --batch-size (\d+) /);

    if (batchSizeArg) {
      return Number(batchSizeArg[1]);
    }
  }

  get maxEpochs() {
    const maxEpochsArg = this.#args.match(/ --max-epochs (\d+) /);

    if (maxEpochsArg) {
      return Number(maxEpochsArg[1]);
    }
  }

  constructor(argsArr: string[]) {
    if (argsArr.includes("--help")) {
      this.printHelp();
      process.exit(1);
    }

    this.#args = ` ${argsArr.join(" ")} `;
  }

  private printHelp() {
    const lines: string[] = [
      "Usage: bun index.ts [--model <model>] [--max-epochs <epochs>] [--batch-size <size>]",
      "\nOptions:",
      "    --model <model>",
      "        Model to train, defaults to Mini. Avaible models: ",
      `        ${Object.keys(Models).join(", ")}`,
      "    --max-epochs <epochs>",
      "        Train for at most <epochs>. Default depends on the model.",
      "    --batch-size <size>",
      "        Training batch size. Default depends on the model.",
    ];

    console.log(lines.join("\n"));
  }
}
