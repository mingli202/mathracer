import random
from pathlib import Path
from typing import Any

import numpy as np
import keras
from models import MyModel

NUM_CLASSES = 10
BATCH_SIZE = 68
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
    set_seed(42)
    (x_train, y_train), (x_test, y_test) = load_mnist()

    myModels = MyModel()

    # choose model
    model = myModels.mini()

    out_dir = Path("./artifacts")
    out_dir.mkdir(parents=True, exist_ok=True)

    model.summary()
    # exit()

    model.fit(
        x_train,
        y_train,
        epochs=MAX_EPOCHS,
        batch_size=BATCH_SIZE,
        shuffle=True,
        callbacks=[CustomCallback()],
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
    meta_path = out_dir / "metadata.txt"
    with open(meta_path, "a") as f:
        f.write(f"model: {model.name}\n")
        f.write(f"total params: {model.count_params()}\n")
        f.write(f"test_accuracy: {test_acc:.6f}\n")
        f.write(f"test_loss: {test_loss:.6f}\n")
        f.write(f"optimizer: {model.optimizer.name}\n")
        f.write(f"loss function: {model.loss.name}\n")
        f.write("=================================\n")
    print(f"Wrote metadata to: {meta_path}")


if __name__ == "__main__":
    main()
