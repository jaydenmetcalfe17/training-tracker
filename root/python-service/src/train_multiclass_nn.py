from pathlib import Path
import pandas as pd
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.utils.class_weight import compute_class_weight
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import numpy as np
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score
)
import joblib

###############################
#### Loading training data ####
###############################
BASE_DIR = Path(__file__).resolve().parent.parent

PROCESSED_DIR = (
    BASE_DIR /
    "data" /
    "processed"
)

MODELS_DIR = BASE_DIR / "models"


def load_training_data():

    return pd.read_parquet(
        PROCESSED_DIR /
        "training_dataset.parquet"
    )


#### PREPARE DATA #####
def prepare_data(df, discipline):

    features = [
        "YOB",
        "Gender",

        # Overall experience
        "total_race_starts",
        "total_finishes",
        "overall_finish_rate",
        "wins",
        "podiums",
        "top_5s",
        "top_10s",

        # Discipline performance
        f"{discipline} starts",
        f"{discipline} wins",
        f"{discipline} podiums",
        f"{discipline} top 5s",
        f"{discipline} top 10s",
        f"{discipline} finish rate",

        # Overall tier percentiles
        "Zone avg percentile",
        "Provincial avg percentile",
        "Regional avg percentile",
        "National avg percentile",
        "International avg percentile",

        # Overall sample sizes
        "Zone percentile sample size",
        "Provincial percentile sample size",
        "Regional percentile sample size",
        "National percentile sample size",
        "International percentile sample size",

        # Discipline tier percentiles
        f"{discipline} Zone avg percentile",
        f"{discipline} Provincial avg percentile",
        f"{discipline} Regional avg percentile",
        f"{discipline} National avg percentile",
        f"{discipline} International avg percentile",

        # Discipline sample sizes
        f"{discipline} Zone percentile sample size",
        f"{discipline} Provincial percentile sample size",
        f"{discipline} Regional percentile sample size",
        f"{discipline} National percentile sample size",
        f"{discipline} International percentile sample size"
    ]

    X = df[features].copy()
    y = df[f"{discipline}_target"]

    # Gender
    X["Gender"] = X["Gender"].map({
        "M": 0,
        "F": 1
    })

    # Remove athletes without target
    mask = y.notna()

    X = X[mask].copy()
    y = y[mask].copy()

    # Clean features
    X = X.replace(
        [np.inf, -np.inf],
        np.nan
    )

    X = X.fillna(0)

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    # Scale
    scaler = StandardScaler()

    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    athlete_info = df.loc[X.index, [
        "ACA",
        "Name",
        "FIS ID"
    ]].copy()

    return (
        X_train_scaled,
        X_test_scaled,
        y_train,
        y_test,
        scaler,
        features,
        athlete_info.loc[X_test.index]
    )


#### BUILD MODEL #####
def build_model(input_size):

    model = keras.Sequential([
        layers.Input(shape=(input_size,)),

        layers.Dense(64, activation="relu"),
        layers.Dropout(0.2),

        layers.Dense(32, activation="relu"),
        layers.Dropout(0.2),

        layers.Dense(16, activation="relu"),

        layers.Dense(7, activation="softmax")
    ])

    model.compile(
        optimizer=keras.optimizers.Adam(
            learning_rate=0.001
        ),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    return model


###### TRAIN MODEL #######
def train_model(X_train, y_train, X_test, y_test):

    # Build neural network
    model = build_model(
        X_train.shape[1]
    )


    # Calculate balanced class weights
    classes = np.unique(y_train)

    class_weights = compute_class_weight(
        class_weight="balanced",
        classes=classes,
        y=y_train
    )

    class_weight_dict = dict(
        zip(classes, class_weights)
    )


    print("Class weights:")
    print(class_weight_dict)


    # Train model
    history = model.fit(
        X_train,
        y_train,
        validation_split=0.2,
        epochs=100,
        batch_size=32,
        class_weight=class_weight_dict,
        verbose=1
    )


    # Evaluate on untouched test set
    test_loss, test_accuracy = model.evaluate(
        X_test,
        y_test,
        verbose=0
    )

    print(
        f"Test accuracy: {test_accuracy:.3f}"
    )

    return model, history



### EVALUATE MODEL ####
def evaluate_model(
    model,
    X_test,
    y_test,
    athlete_info,
    history,
    discipline
):

    # Predictions
    probabilities = model.predict(
        X_test,
        verbose=0
    )

    predictions = np.argmax(
        probabilities,
        axis=1
    )

    # -------------------------
    # Classification report
    # -------------------------

    report = classification_report(
        y_test,
        predictions,
        zero_division=0,
        output_dict=True
    )

    report_df = (
        pd.DataFrame(report)
        .transpose()
    )

    # -------------------------
    # Confusion matrix
    # -------------------------

    cm = confusion_matrix(
        y_test,
        predictions
    )

    cm_df = pd.DataFrame(
        cm,
        index=[
            "Actual 0 (1-100)",
            "Actual 1 (101-250)",
            "Actual 2 (251-500)",
            "Actual 3 (501-750)",
            "Actual 4 (751-1000)",
            "Actual 5 (1001-1500)",
            "Actual 6 (1500+)"
        ],
        columns=[
            "Pred 0 (1-100)",
            "Pred 1 (101-250)",
            "Pred 2 (251-500)",
            "Pred 3 (501-750)",
            "Pred 4 (751-1000)",
            "Pred 5 (1001-1500)",
            "Pred 6 (1500+)"
        ]
    )

    # -------------------------
    # Individual predictions
    # -------------------------

    results = athlete_info.copy()

    results["Actual"] = y_test.values
    results["Predicted"] = predictions

    class_names = [
        "WR_1_100",
        "WR_101_250",
        "WR_251_500",
        "WR_501_750",
        "WR_751_1000",
        "WR_1001_1500",
        "WR_1500_plus"
    ]

    for i, name in enumerate(class_names):

        results[f"prob_{name}"] = probabilities[:, i]

    # -------------------------
    # Training history
    # -------------------------

    history_df = pd.DataFrame(
        history.history
    )

    history_df["epoch"] = range(
        1,
        len(history_df) + 1
    )

    # -------------------------
    # Accuracy
    # -------------------------

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    print(f"\n{discipline} Results")
    print("----------------------")
    print(f"Test accuracy: {accuracy:.4f}")

    return (
        results,
        report_df,
        cm_df,
        history_df
    )


### SAVE MODEL #####
def save_model_outputs(
    model,
    results,
    report_df,
    cm_df,
    history_df,
    scaler,
    discipline
):
    # Save neural network
    model.save(
        MODELS_DIR / f"{discipline.lower()}_neural_network.keras"
    )

    # Save scaler
    import joblib

    joblib.dump(
        scaler,
        MODELS_DIR / f"{discipline.lower()}_scaler.pkl"
    )

    # Save parquet files
    results.to_parquet(
        PROCESSED_DIR /
        f"{discipline.lower()}_nn_results.parquet",
        index=False
    )

    report_df.to_parquet(
        PROCESSED_DIR /
        f"{discipline.lower()}_nn_classification_report.parquet"
    )

    cm_df.to_parquet(
        PROCESSED_DIR /
        f"{discipline.lower()}_nn_confusion_matrix.parquet"
    )

    history_df.to_parquet(
        PROCESSED_DIR /
        f"{discipline.lower()}_nn_history.parquet",
        index=False
    )

    print(
        f"Saved {discipline} model and evaluation outputs."
    )


################################################################################################
def main():

    print("1. Loading data...", flush=True)
    df = load_training_data()
    print(f"Loaded {len(df)} athletes", flush=True)

    print("2. Preparing GS data...", flush=True)
    X_gs_train, X_gs_test, y_gs_train, y_gs_test, gs_scaler, gs_features, gs_athlete_info = prepare_data(df, "GS")
    print("GS data prepared", flush=True)

    print("3. Preparing SL data...", flush=True)
    X_sl_train, X_sl_test, y_sl_train, y_sl_test, sl_scaler, sl_features, sl_athlete_info = prepare_data(df, "SL")
    print("SL data prepared", flush=True)

    print("4. Preparing SG data...", flush=True)
    X_sg_train, X_sg_test, y_sg_train, y_sg_test, sg_scaler, sg_features, sg_athlete_info = prepare_data(df, "SG")
    print("SG data prepared", flush=True)

    print("5. Training GS...", flush=True)
    gs_model, gs_history = train_model(
        X_gs_train,
        y_gs_train,
        X_gs_test,
        y_gs_test
    )
    print("GS training complete", flush=True)

    print("6. Evaluating GS...", flush=True)
    gs_results, gs_report_df, gs_cm_df, gs_history_df = evaluate_model(
        gs_model,
        X_gs_test,
        y_gs_test,
        gs_athlete_info,
        gs_history,
        "GS"
    )
    print("GS evaluation complete", flush=True)

    print("7. Saving GS...", flush=True)
    save_model_outputs(
        gs_model,
        gs_results,
        gs_report_df,
        gs_cm_df,
        gs_history_df,
        gs_scaler,
        "GS"
    )
    print("GS saved", flush=True)

    print("8. Training SL...", flush=True)
    sl_model, sl_history = train_model(
        X_sl_train,
        y_sl_train,
        X_sl_test,
        y_sl_test
    )
    print("SL training complete", flush=True)

    print("9. Evaluating SL...", flush=True)
    sl_results, sl_report_df, sl_cm_df, sl_history_df = evaluate_model(
        sl_model,
        X_sl_test,
        y_sl_test,
        sl_athlete_info,
        sl_history,
        "SL"
    )

    print("10. Saving SL...", flush=True)
    save_model_outputs(
        sl_model,
        sl_results,
        sl_report_df,
        sl_cm_df,
        sl_history_df,
        sl_scaler,
        "SL"
    )

    print("11. Training SG...", flush=True)
    sg_model, sg_history = train_model(
        X_sg_train,
        y_sg_train,
        X_sg_test,
        y_sg_test
    )
    print("SG training complete", flush=True)

    print("12. Evaluating SG...", flush=True)
    sg_results, sg_report_df, sg_cm_df, sg_history_df = evaluate_model(
        sg_model,
        X_sg_test,
        y_sg_test,
        sg_athlete_info,
        sg_history,
        "SG"
    )

    print("13. Saving SG...", flush=True)
    save_model_outputs(
        sg_model,
        sg_results,
        sg_report_df,
        sg_cm_df,
        sg_history_df,
        sg_scaler,
        "SG"
    )

    print("DONE", flush=True)

if __name__ == "__main__":
    main()
