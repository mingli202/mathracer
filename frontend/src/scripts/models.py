import keras
from keras import layers


input_shape = (28, 28, 1)
num_classes = 10
loss = "categorical_crossentropy"
optimizer = keras.optimizers.Adam(learning_rate=1e-3)


class MyModel:
    def chat_gpt5_arch(self):
        arch = [
            keras.Input(shape=input_shape),
            layers.Conv2D(32, 3, activation="relu", padding="same"),
            layers.Conv2D(32, 3, activation="relu", padding="same"),
            layers.BatchNormalization(),
            layers.MaxPool2D(),
            layers.Dropout(0.25),
            layers.Conv2D(64, 3, activation="relu", padding="same"),
            layers.Conv2D(64, 3, activation="relu", padding="same"),
            layers.BatchNormalization(),
            layers.MaxPool2D(),
            layers.Dropout(0.25),
            layers.Flatten(),
            layers.Dense(128, activation="relu"),
            layers.Dropout(0.5),
            layers.Dense(num_classes, activation="softmax"),
        ]

        model = keras.Sequential(arch, name="chat_gpt5")

        model.compile(
            optimizer=keras.optimizers.Adam(1e-3),
            loss=keras.losses.CategoricalCrossentropy(),
            metrics=["accuracy"],
        )

        return model

    def tensorflow_tutorial(self):
        arch = [
            keras.Input(shape=input_shape),
            layers.Conv2D(
                8, 5, 1, activation="relu", kernel_initializer="variance_scaling"
            ),
            layers.MaxPool2D(2, 2),
            layers.Conv2D(
                15, 5, 1, activation="relu", kernel_initializer="variance_scaling"
            ),
            layers.MaxPool2D(2, 2),
            layers.Flatten(),
            layers.Dense(10, "softmax", kernel_initializer="variance_scaling"),
        ]

        model = keras.Sequential(arch, name="tsjs_tutorial")

        model.compile(
            optimizer=keras.optimizers.Adam(),
            loss=keras.losses.CategoricalCrossentropy(),
            metrics=["accuracy"],
        )

        return model

    def leNet(self):
        arch = [
            keras.Input(shape=input_shape),
            layers.Conv2D(6, 5, 1, activation=keras.activations.tanh),
            layers.AvgPool2D(2, 2),
            layers.Conv2D(16, 5, 1, activation=keras.activations.tanh),
            layers.AvgPool2D(2, 2),
            layers.Dense(120, activation=keras.activations.tanh),
            layers.Flatten(),
            layers.Dense(84, activation=keras.activations.tanh),
            layers.Dense(10, activation=keras.activations.softmax),
        ]

        model = keras.Sequential(arch, name="LeNet_1")

        model.compile(
            optimizer=keras.optimizers.Adam(),
            loss=keras.losses.CategoricalCrossentropy(),
            metrics=["accuracy"],
        )

        return model
