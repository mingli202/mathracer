from models import MyModel
import tensorflowjs as tfjs
import keras
from pathlib import Path


def main():
    models = MyModel()

    models_dict = {
        "chat_gpt5": models.chat_gpt5,
        "tsjs_tutorial": models.tsjs_tutorial,
        "leNet": models.leNet,
        "mini": models.mini,
        "mini_mobilenet": models.mini_mobilenet,
        "keras_tutorial": models.keras_tutorial,
    }

    for key in models_dict.keys():
        path = Path(f"./artifacts/{key}.keras")
        print(path)
        model = keras.models.load_model(path)

        out_path = Path(f"../public/models/{key}")
        out_path.mkdir(parents=True, exist_ok=True)
        tfjs.converters.save_keras_model(model, out_path)


if __name__ == "__main__":
    main()
