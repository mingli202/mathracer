import argparse
import random
from pathlib import Path
from typing import Any

import keras
import numpy as np
from matplotlib import pyplot as plt
from models import MyModel
import json

NUM_CLASSES = 10
BATCH_SIZE = 128
TRAIN_TARGET_ACCURACY = 0.998
TEST_TARGET_ACCURACY = 0.995
MAX_EPOCHS = 60


def set_seed(seed: int = 42):
    random.seed(seed)
    np.random.seed(seed)


def load_mnist():
    (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()
    # Normalize to [0, 1] and add channel dimension (28x28x1).
    x_train = x_train.astype("float32") / 255.0
    x_test = x_test.astype("float32") / 255.0

    x_train = np.expand_dims(x_train, axis=-1)
    x_test = np.expand_dims(x_test, axis=-1)

    y_train = keras.utils.to_categorical(y_train, num_classes=NUM_CLASSES)
    y_test = keras.utils.to_categorical(y_test, num_classes=NUM_CLASSES)

    return (x_train, y_train), (x_test, y_test)


class CustomCallback(keras.callbacks.Callback):
    def on_epoch_end(self, epoch, logs: Any = None):
        test_accuracy = logs["val_accuracy"]
        train_accuracy = logs["accuracy"]

        if (
            test_accuracy > TEST_TARGET_ACCURACY
            and train_accuracy > TRAIN_TARGET_ACCURACY
        ):
            self.model.stop_training = True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, default="mini_mobilenet")
    args = parser.parse_args()

    models = MyModel()

    modelsDict = {
        "geeks_for_geeks": models.geeks_for_geeks,
        "gpt_5_1": models.chat_gpt5,
        "tsjs_tutorial": models.tsjs_tutorial,
        "leNet": models.leNet,
        "mini": models.mini,
        "mini_mobilenet": models.mini_mobilenet,
    }

    set_seed(42)
    (x_train, y_train), (x_test, y_test) = load_mnist()

    # choose model
    model = modelsDict[args.model]()

    out_dir = Path("./artifacts")
    out_dir.mkdir(parents=True, exist_ok=True)

    model.summary()

    history = model.fit(
        x_train,
        y_train,
        epochs=MAX_EPOCHS,
        batch_size=BATCH_SIZE,
        shuffle=True,
        callbacks=[CustomCallback(), keras.callbacks.EarlyStopping(patience=10)],
        validation_data=(x_test, y_test),
    )

    # Optional evaluation on test set (not required, but informative).
    test_loss, test_acc = model.evaluate(x_test, y_test, verbose="0")
    print(f"Test accuracy: {test_acc:.4f}")
    print(f"Test loss: {test_loss:.4f}")

    keras_path = out_dir / f"{model.name}.keras"
    model.save(keras_path)
    print(f"Saved Keras model to: {keras_path}")

    # Save a small metadata file (useful later).
    meta_path = out_dir / "metadata.json"

    obj = {}
    if meta_path.exists():
        with open(meta_path, "r") as f:
            obj = json.load(f)

    obj[model.name] = {
        "model": model.name,
        "total_params": model.count_params(),
        "test_accuracy": test_acc,
        "test_loss": test_loss,
        "optimizer": model.optimizer.name,
        "loss_function": model.loss.name,
    }

    with open(meta_path, "a") as f:
        f.write(json.dumps(obj, indent=4))

        print(f"Wrote metadata to: {meta_path}")

    train_accuracies = history.history["accuracy"]
    train_losses = history.history["loss"]
    test_accuracies = history.history["val_accuracy"]
    test_losses = history.history["val_loss"]

    plt.plot(train_accuracies, label="train accuracy")
    plt.plot(train_losses, label="train loss")
    plt.plot(test_accuracies, label="test accuracy")
    plt.plot(test_losses, label="test loss")
    plt.title(f"Accuracy and Loss of {model.name}")
    plt.legend()
    plt.show()
    plt.savefig(out_dir / f"/graphs/{model.name}.png")


if __name__ == "__main__":
    main()
