import random
from pathlib import Path
from typing import Any

import numpy as np
import keras
from keras import layers

NUM_CLASSES = 10
OPTIMIZER = "adam"
LOSS = "categorical_crossentropy"
VERSION = 4
BATCH_SIZE = 128
TARGET_ACCURACY = 0.998
MAX_EPOCHS = 40
NAME = "mnist_cnn_geeks_for_geeks"


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


def build_model(input_shape=(28, 28, 1), num_classes: int = NUM_CLASSES):
    print(f"Building model {VERSION}")

    model = keras.Sequential(
        [
            keras.Input(shape=input_shape),
            layers.Conv2D(32, 3, activation="relu"),
            layers.Conv2D(64, 3, activation="relu"),
            layers.MaxPool2D(),
            layers.Dropout(0.5),
            layers.Flatten(),
            layers.Dense(250, activation="relu"),
            layers.Dense(num_classes, activation="softmax"),
        ],
        name=NAME,
    )

    model.summary()

    model.compile(
        optimizer=OPTIMIZER,
        loss=LOSS,
        metrics=["accuracy"],
    )

    return model


class CustomCallback(keras.callbacks.Callback):
    def __init__(self, x_train, y_train):
        self.x_train = x_train
        self.y_train = y_train
        super().__init__()

    def on_epoch_end(self, epoch, logs: Any = None):
        _, test_accuracy = self.model.evaluate(self.x_train, self.y_train)
        train_accuracy = logs["accuracy"]

        if test_accuracy > TARGET_ACCURACY and train_accuracy > TARGET_ACCURACY:
            self.model.stop_training = True


def main():
    set_seed(42)
    (x_train, y_train), (x_test, y_test) = load_mnist()
    model = build_model()

    out_dir = Path("./artifacts")
    out_dir.mkdir(parents=True, exist_ok=True)

    print(model.summary())

    model.fit(
        x_train,
        y_train,
        epochs=MAX_EPOCHS,
        batch_size=BATCH_SIZE,
        shuffle=True,
        callbacks=[CustomCallback(x_train, y_train)],
    )

    # Optional evaluation on test set (not required, but informative).
    test_loss, test_acc = model.evaluate(x_test, y_test, verbose="0")
    print(f"Test accuracy: {test_acc:.4f}")
    print(f"Test loss: {test_loss:.4f}")

    keras_path = out_dir / f"{model.name}.keras"
    model.save(keras_path)
    print(f"Saved Keras model to: {keras_path}")

    # Save a small metadata file (useful later).
    meta_path = out_dir / "metadata.txt"
    with open(meta_path, "a") as f:
        f.write(f"model: {model.name}\n")
        f.write(f"total params: {model.count_params()}\n")
        f.write(f"test_accuracy: {test_acc:.6f}\n")
        f.write(f"test_loss: {test_loss:.6f}\n")
        f.write(f"optimizer: {OPTIMIZER}\n")
        f.write(f"loss function: {LOSS}\n")
        f.write("=================================\n")
    print(f"Wrote metadata to: {meta_path}")


if __name__ == "__main__":
    main()
