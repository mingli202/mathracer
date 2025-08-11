import argparse
import os
import random
from pathlib import Path

import numpy as np
import keras
from keras import layers

NUM_CLASSES = 10
OPTIMIZER = "adam"
LOSS = "categorical_crossentropy"
VERSION = 1


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
    model = keras.Sequential(
        [
            keras.Input(shape=input_shape),
            layers.Conv2D(32, 3, activation="relu"),
            layers.MaxPool2D(),
            layers.Conv2D(64, 3, activation="relu"),
            layers.MaxPool2D(),
            layers.Flatten(),
            layers.Dropout(0.5),
            layers.Dense(num_classes, activation="softmax", name="output"),
        ],
        name=f"mnist_cnn_light {VERSION}",
    )

    model.summary()

    model.compile(
        optimizer=OPTIMIZER,
        loss=LOSS,
        metrics=["accuracy"],
    )
    return model


def main():
    parser = argparse.ArgumentParser(
        description="Train a light CNN on MNIST and export the model."
    )
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--batch-size", type=int, default=128)
    parser.add_argument("--acc-target", type=float, default=0.995)
    parser.add_argument("--out-dir", type=str, default="./artifacts")
    parser.add_argument(
        "--no-gpu",
        action="store_true",
        help="Disable GPU (useful for reproducibility testing).",
        default=False,
    )
    args = parser.parse_args()

    if args.no_gpu:
        os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

    set_seed(42)
    (x_train, y_train), (x_test, y_test) = load_mnist()
    model = build_model()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    print(model.summary())

    model.fit(
        x_train,
        y_train,
        epochs=args.epochs,
        batch_size=args.batch_size,
        verbose="2",
        validation_split=0.1,
    )

    # Optional evaluation on test set (not required, but informative).
    test_loss, test_acc = model.evaluate(x_test, y_test, verbose="0")
    print(f"Test accuracy: {test_acc:.4f}")
    print(f"Test loss: {test_loss:.4f}")

    keras_path = out_dir / "mnist_cnn.keras"
    model.save(keras_path)
    print(f"Saved Keras model to: {keras_path}")

    # Save a small metadata file (useful later).
    meta_path = out_dir / "metadata.txt"
    with open(meta_path, "a") as f:
        f.write(f"model: mnist_cnn_light {VERSION}\n")
        f.write(f"test_accuracy: {test_acc:.6f}\n")
        f.write(f"test_loss: {test_loss:.6f}\n")
        f.write(f"optimizer: {OPTIMIZER}\n")
        f.write(f"loss: {LOSS}\n")
        f.write("=================================")
    print(f"Wrote metadata to: {meta_path}")


if __name__ == "__main__":
    main()
