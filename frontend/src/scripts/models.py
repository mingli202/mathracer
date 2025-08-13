import keras
from keras import layers


input_shape = (28, 28, 1)
num_classes = 10


class MyModel:
    def chat_gpt5(self):
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
            optimizer="adam",
            loss=keras.losses.CategoricalCrossentropy(),
            metrics=["accuracy"],
        )

        return model

    def tsjs_tutorial(self):
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
            optimizer=keras.optimizers.Adam().name,
            loss=keras.losses.CategoricalCrossentropy(),
            metrics=["accuracy"],
        )

        return model

    def leNet(self):
        arch = [
            keras.Input(shape=input_shape),
            layers.ZeroPadding2D(padding=2),
            layers.Conv2D(6, 5, 1, activation=keras.activations.tanh),
            layers.AvgPool2D(2, 2),
            layers.Conv2D(16, 5, 1, activation=keras.activations.tanh),
            layers.AvgPool2D(2, 2),
            layers.Dense(120, activation=keras.activations.tanh),
            layers.Flatten(),
            layers.Dense(84, activation=keras.activations.tanh),
            layers.Dense(10, activation=keras.activations.softmax),
        ]

        model = keras.Sequential(arch, name="leNet")

        model.compile(
            optimizer="adam",
            loss=keras.losses.CategoricalCrossentropy(),
            metrics=["accuracy"],
        )

        return model

    def geeks_for_geeks(self):
        arch = [
            keras.Input(shape=input_shape),
            layers.Conv2D(32, 3, activation="relu"),
            layers.Conv2D(64, 3, activation="relu"),
            layers.MaxPool2D(3),
            layers.Dropout(0.5),
            layers.Flatten(),
            layers.Dense(250, activation="sigmoid"),
            layers.Dense(num_classes, activation="softmax"),
        ]

        model = keras.Sequential(arch, name="geeks_for_geeks")

        model.compile(
            optimizer="adadelta",
            loss=keras.losses.CategoricalCrossentropy(),
            metrics=["accuracy"],
        )

        return model

    def mini(self):
        arch = [
            layers.Input(shape=input_shape),
            layers.Conv2D(8, 3, padding="same", activation="relu"),
            layers.MaxPool2D(2),
            layers.SeparableConv2D(16, 3, padding="same", activation="relu"),
            layers.MaxPool2D(2),
            layers.SeparableConv2D(32, 3, padding="same", activation="relu"),
            layers.GlobalAveragePooling2D(),
            layers.Dense(num_classes, activation="softmax"),
        ]

        model = keras.Sequential(arch, name="mini")

        model.compile(
            optimizer="adam",
            loss=keras.losses.CategoricalCrossentropy(),
            metrics=["accuracy"],
        )

        return model

    def mini_mobilenet(self):
        arch = [
            layers.Input(shape=input_shape),
            layers.ZeroPadding2D(padding=2),  # shape (32, 32, 1)
            layers.Conv2D(8, 3, 2, padding="same"),  # output shape (16, 16, 8)
            layers.BatchNormalization(),
            layers.ReLU(),
            layers.SeparableConv2D(16, 3, 2, padding="same"),  # output shape (8, 8, 16)
            layers.BatchNormalization(),
            layers.ReLU(),
            layers.SeparableConv2D(32, 3, 2, padding="same"),  # output shape (4, 4, 32)
            layers.BatchNormalization(),
            layers.ReLU(),
            layers.SeparableConv2D(64, 3, 2, padding="same"),  # output shape (2, 2, 64)
            layers.BatchNormalization(),
            layers.ReLU(),
            layers.SeparableConv2D(
                128, 3, 2, padding="same"
            ),  # output shape (1, 1, 128)
            layers.BatchNormalization(),
            layers.ReLU(),
            layers.GlobalAveragePooling2D(),
            layers.Dense(num_classes, activation="softmax"),
        ]

        model = keras.Sequential(arch, name="mini_mobilenet_2")

        model.compile(
            optimizer="adam",
            loss=keras.losses.CategoricalCrossentropy(),
            metrics=["accuracy"],
        )

        return model

    def keras_tutorial(self):
        model = keras.Sequential(
            [
                keras.Input(shape=input_shape),
                layers.Conv2D(32, kernel_size=(3, 3), activation="relu"),
                layers.MaxPooling2D(pool_size=(2, 2)),
                layers.Conv2D(64, kernel_size=(3, 3), activation="relu"),
                layers.MaxPooling2D(pool_size=(2, 2)),
                layers.Flatten(),
                layers.Dropout(0.5),
                layers.Dense(num_classes, activation="softmax"),
            ],
            name="keras_tutorial",
        )

        model.compile(
            loss=keras.losses.CategoricalCrossentropy(),
            optimizer="adam",
            metrics=["accuracy"],
        )

        return model
