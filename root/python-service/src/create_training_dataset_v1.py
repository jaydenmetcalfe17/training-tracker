import pandas as pd
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"


def load_features():

    return pd.read_parquet(
        PROCESSED_DIR / "athletes_features.parquet"
    )


def filter_athletes(df):

    df = df[
        df["YOB"] <= 2007
    ].copy()

    return df

def create_wr_class(wr):

    if pd.isna(wr):
        return None
    elif wr <= 100:
        return 0
    elif wr <= 250:
        return 1
    elif wr <= 500:
        return 2
    elif wr <= 750:
        return 3
    elif wr <= 1000:
        return 4
    elif wr <= 1500:
        return 5
    else:
        return 6
    
def add_targets(df):

    df["GS_target"] = (
        df["peak_gs_wr"]
        .apply(create_wr_class)
    )

    df["SL_target"] = (
        df["peak_sl_wr"]
        .apply(create_wr_class)
    )

    df["SG_target"] = (
        df["peak_sg_wr"]
        .apply(create_wr_class)
    )

    return df


def main():

    athletes = load_features()

    athletes = filter_athletes(
        athletes
    )

    athletes = add_targets(
        athletes
    )

    athletes.to_parquet(
        PROCESSED_DIR / "training_dataset.parquet",
        index=False
    )

    print(
        athletes.shape
    )


if __name__ == "__main__":
    main()