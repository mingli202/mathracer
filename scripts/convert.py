from models import MyModel
import tensorflowjs as tfjs
import keras
from pathlib import Path
import argparse


def convert(model_name: str):
    print(f"Converting {model_name}")

    path = Path(f"./artifacts/{model_name}.keras")
    model = keras.models.load_model(path)

    out_path = Path(f"../frontend/src/public/models/{model_name}")
    out_path.mkdir(parents=True, exist_ok=True)
    tfjs.converters.save_keras_model(model, out_path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, default="all")
    args = parser.parse_args()

    models = MyModel()

    models_dict = {
        "chat_gpt5": models.chat_gpt5,
        "tsjs_tutorial": models.tsjs_tutorial,
        "leNet": models.leNet,
        "mini": models.mini,
        "mini_mobilenet": models.mini_mobilenet,
        "keras_tutorial": models.keras_tutorial,
    }

    if args.model == "all":
        for key in models_dict.keys():
            convert(key)
    else:
        convert(args.model)


if __name__ == "__main__":
    main()
