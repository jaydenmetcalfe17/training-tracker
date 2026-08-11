import pandas as pd
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.metrics import confusion_matrix
from sklearn.utils.class_weight import compute_sample_weight

from xgboost import XGBClassifier


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

##############################

# GS MODEL 

##############################

def train_gs_model(df):

    target = "GS_target"


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

        # GS performance
        "GS starts",
        "GS wins",
        "GS podiums",
        "GS top 5s",
        "GS top 10s",
        "GS finish rate",

        # Overall tier percentiles
        "Zone avg percentile",
        "Provincial avg percentile",
        "Regional avg percentile",
        "National avg percentile",
        "International avg percentile",

        # Overall tier sample sizes
        "Zone percentile sample size",
        "Provincial percentile sample size",
        "Regional percentile sample size",
        "National percentile sample size",
        "International percentile sample size",

        # GS tier percentiles
        "GS Zone avg percentile",
        "GS Provincial avg percentile",
        "GS Regional avg percentile",
        "GS National avg percentile",
        "GS International avg percentile",

        # GS tier sample sizes
        "GS Zone percentile sample size",
        "GS Provincial percentile sample size",
        "GS Regional percentile sample size",
        "GS National percentile sample size",
        "GS International percentile sample size"
    ]


    X = df[features].copy()

    X["Gender"] = X["Gender"].map(
        {
            "M": 0,
            "F": 1
        }
    )
    
    y = df[target]

    athlete_info = df[
        [
            "ACA",
            "Name",
            "FIS ID"
        ]
    ]


    # Remove athletes without target
    mask = y.notna()

    X = X[mask]
    y = y[mask]

    X = X.replace(
        [float("inf"), float("-inf")],
        0
    )

    X = X.fillna(0)



    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )


    sample_weights = compute_sample_weight(
        class_weight="balanced",
        y=y_train
    )


    model = XGBClassifier(
        objective="multi:softprob",
        num_class=7,
        eval_metric="mlogloss",
        n_estimators=300,
        max_depth=4,
        learning_rate=0.05
    )



    model.fit(
        X_train,
        y_train,
        sample_weight=sample_weights
    )


    predictions = model.predict(
        X_test
    )

    probabilities = model.predict_proba(
        X_test
    )


    gs_classification_report = classification_report(
        y_test,
        predictions,
        zero_division=0,
        output_dict=True
    )

    gs_confusion_matrix = confusion_matrix(y_test, predictions)

    gs_results = athlete_info.loc[X_test.index].copy()

    gs_results["Actual"] = y_test
    gs_results["Predicted"] = predictions


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
        gs_results[f"prob_{name}"] = probabilities[:, i]


    return gs_results, gs_confusion_matrix, gs_classification_report, model


def gs_main(gs_results, gs_confusion_matrix, gs_classification_report):

    gs_results.to_parquet(
        PROCESSED_DIR / "gs_train_xgboost.parquet",
        index=False
    )

    gs_report_df = (
        pd.DataFrame(gs_classification_report)
        .transpose()
    )
    gs_report_df.to_parquet(
        PROCESSED_DIR / "gs_classification_report.parquet"
    )

    gs_cm_df = pd.DataFrame(
        gs_confusion_matrix,
        index=[
            "Actual 0 (1-100)",
            "Actual 1 (101-250)",
            "Actual 2 (251-500)",
            "Actual 3 (501-750)",
            "Actual 4 (751-1000)",
            "Actual 5 (1001-1500)",
            "Actual 6 (1500+)",
        ],
        columns=[
            "Pred 0 (1-100)",
            "Pred 1 (101-250)",
            "Pred 2 (251-500)",
            "Pred 3 (501-750)",
            "Pred 4 (751-1000)",
            "Pred 5 (1001-1500)",
            "Pred 6 (1500+)",
        ]
    )

    gs_cm_df.to_parquet(
        PROCESSED_DIR / "gs_confusion_matrix.parquet"
    )



##############################

# SL MODEL 

##############################
def train_sl_model(df):

    target = "SL_target"


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

        # SL performance
        "SL starts",
        "SL wins",
        "SL podiums",
        "SL top 5s",
        "SL top 10s",
        "SL finish rate",

        # Overall tier percentiles
        "Zone avg percentile",
        "Provincial avg percentile",
        "Regional avg percentile",
        "National avg percentile",
        "International avg percentile",

        # Overall tier sample sizes
        "Zone percentile sample size",
        "Provincial percentile sample size",
        "Regional percentile sample size",
        "National percentile sample size",
        "International percentile sample size",

        # SL tier percentiles
        "SL Zone avg percentile",
        "SL Provincial avg percentile",
        "SL Regional avg percentile",
        "SL National avg percentile",
        "SL International avg percentile",

        # SL tier sample sizes
        "SL Zone percentile sample size",
        "SL Provincial percentile sample size",
        "SL Regional percentile sample size",
        "SL National percentile sample size",
        "SL International percentile sample size"
    ]


    X = df[features].copy()

    X["Gender"] = X["Gender"].map(
        {
            "M": 0,
            "F": 1
        }
    )
    
    y = df[target]

    athlete_info = df[
        [
            "ACA",
            "Name",
            "FIS ID"
        ]
    ]


    # Remove athletes without target
    mask = y.notna()

    X = X[mask]
    y = y[mask]

    X = X.replace(
        [float("inf"), float("-inf")],
        0
    )

    X = X.fillna(0)



    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )


    sample_weights = compute_sample_weight(
        class_weight="balanced",
        y=y_train
    )


    model = XGBClassifier(
        objective="multi:softprob",
        num_class=7,
        eval_metric="mlogloss",
        n_estimators=300,
        max_depth=4,
        learning_rate=0.05
    )



    model.fit(
        X_train,
        y_train,
        sample_weight=sample_weights
    )


    predictions = model.predict(
        X_test
    )

    probabilities = model.predict_proba(
        X_test
    )


    sl_classification_report = classification_report(
        y_test,
        predictions,
        zero_division=0,
        output_dict=True
    )

    sl_confusion_matrix = confusion_matrix(y_test, predictions)

    sl_results = athlete_info.loc[X_test.index].copy()

    sl_results["Actual"] = y_test
    sl_results["Predicted"] = predictions


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
        sl_results[f"prob_{name}"] = probabilities[:, i]


    return sl_results, sl_confusion_matrix, sl_classification_report, model


def sl_main(sl_results, sl_confusion_matrix, sl_classification_report):

    sl_results.to_parquet(
        PROCESSED_DIR / "sl_train_xgboost.parquet",
        index=False
    )

    sl_report_df = (
        pd.DataFrame(sl_classification_report)
        .transpose()
    )
    sl_report_df.to_parquet(
        PROCESSED_DIR / "sl_classification_report.parquet"
    )

    sl_cm_df = pd.DataFrame(
        sl_confusion_matrix,
        index=[
            "Actual 0 (1-100)",
            "Actual 1 (101-250)",
            "Actual 2 (251-500)",
            "Actual 3 (501-750)",
            "Actual 4 (751-1000)",
            "Actual 5 (1001-1500)",
            "Actual 6 (1500+)",
        ],
        columns=[
            "Pred 0 (1-100)",
            "Pred 1 (101-250)",
            "Pred 2 (251-500)",
            "Pred 3 (501-750)",
            "Pred 4 (751-1000)",
            "Pred 5 (1001-1500)",
            "Pred 6 (1500+)",
        ]
    )

    sl_cm_df.to_parquet(
        PROCESSED_DIR / "sl_confusion_matrix.parquet"
    )


##############################

# SG MODEL 

##############################
def train_sg_model(df):

    target = "SG_target"


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

        # SG performance
        "SG starts",
        "SG wins",
        "SG podiums",
        "SG top 5s",
        "SG top 10s",
        "SG finish rate",

        # Overall tier percentiles
        "Zone avg percentile",
        "Provincial avg percentile",
        "Regional avg percentile",
        "National avg percentile",
        "International avg percentile",

        # Overall tier sample sizes
        "Zone percentile sample size",
        "Provincial percentile sample size",
        "Regional percentile sample size",
        "National percentile sample size",
        "International percentile sample size",

        # SG tier percentiles
        "SG Zone avg percentile",
        "SG Provincial avg percentile",
        "SG Regional avg percentile",
        "SG National avg percentile",
        "SG International avg percentile",

        # SG tier sample sizes
        "SG Zone percentile sample size",
        "SG Provincial percentile sample size",
        "SG Regional percentile sample size",
        "SG National percentile sample size",
        "SG International percentile sample size"
    ]


    X = df[features].copy()

    X["Gender"] = X["Gender"].map(
        {
            "M": 0,
            "F": 1
        }
    )
    
    y = df[target]

    athlete_info = df[
        [
            "ACA",
            "Name",
            "FIS ID"
        ]
    ]


    # Remove athletes without target
    mask = y.notna()

    X = X[mask]
    y = y[mask]

    X = X.replace(
        [float("inf"), float("-inf")],
        0
    )

    X = X.fillna(0)



    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )


    sample_weights = compute_sample_weight(
        class_weight="balanced",
        y=y_train
    )


    model = XGBClassifier(
        objective="multi:softprob",
        num_class=7,
        eval_metric="mlogloss",
        n_estimators=300,
        max_depth=4,
        learning_rate=0.05
    )



    model.fit(
        X_train,
        y_train,
        sample_weight=sample_weights
    )


    predictions = model.predict(
        X_test
    )

    probabilities = model.predict_proba(
        X_test
    )


    sg_classification_report = classification_report(
        y_test,
        predictions,
        zero_division=0,
        output_dict=True
    )

    sg_confusion_matrix = confusion_matrix(y_test, predictions)

    sg_results = athlete_info.loc[X_test.index].copy()

    sg_results["Actual"] = y_test
    sg_results["Predicted"] = predictions


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
        sg_results[f"prob_{name}"] = probabilities[:, i]


    return sg_results, sg_confusion_matrix, sg_classification_report, model


def sg_main(sg_results, sg_confusion_matrix, sg_classification_report):

    sg_results.to_parquet(
        PROCESSED_DIR / "sg_train_xgboost.parquet",
        index=False
    )

    sg_report_df = (
        pd.DataFrame(sg_classification_report)
        .transpose()
    )
    sg_report_df.to_parquet(
        PROCESSED_DIR / "sg_classification_report.parquet"
    )

    sg_cm_df = pd.DataFrame(
        sg_confusion_matrix,
        index=[
            "Actual 0 (1-100)",
            "Actual 1 (101-250)",
            "Actual 2 (251-500)",
            "Actual 3 (501-750)",
            "Actual 4 (751-1000)",
            "Actual 5 (1001-1500)",
            "Actual 6 (1500+)",
        ],
        columns=[
            "Pred 0 (1-100)",
            "Pred 1 (101-250)",
            "Pred 2 (251-500)",
            "Pred 3 (501-750)",
            "Pred 4 (751-1000)",
            "Pred 5 (1001-1500)",
            "Pred 6 (1500+)",
        ]
    )

    sg_cm_df.to_parquet(
        PROCESSED_DIR / "sg_confusion_matrix.parquet"
    )

###############################

def main():

    df = load_training_data()

    gs_results, gs_confusion_matrix, gs_classification_report, gs_model = train_gs_model(df)
    sl_results, sl_confusion_matrix, sl_classification_report, sl_model = train_sl_model(df)
    sg_results, sg_confusion_matrix, sg_classification_report, sg_model = train_sg_model(df)

    gs_main(gs_results, gs_confusion_matrix, gs_classification_report)
    sl_main(sl_results, sl_confusion_matrix, sl_classification_report)
    sg_main(sg_results, sg_confusion_matrix, sg_classification_report)

    # Save trained models
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    gs_model.save_model(
        MODELS_DIR / "gs_xgboost.json"
    )

    sl_model.save_model(
        MODELS_DIR / "sl_xgboost.json"
    )

    sg_model.save_model(
        MODELS_DIR / "sg_xgboost.json"
    )

    print("\nSaved trained models.")


if __name__ == "__main__":
    main()