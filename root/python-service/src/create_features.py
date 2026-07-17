import pandas as pd
import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent

PROCESSED_DIR = BASE_DIR / "data" / "processed"

def add_result_status(df):
    """
    Creates Started and Finished flags.

    Started:
        - Athlete entered the start gate
        - DNS does not count

    Finished:
        - Athlete has a valid final time
    """

    df = df.copy()

    # Combine possible status columns
    status_cols = [
        "Total",
        "Run1",
        "Run2"
    ]

    for col in status_cols:
        if col not in df.columns:
            df[col] = None


    # Normalize strings
    for col in status_cols:
        df[col] = df[col].astype("string").str.upper()


    # DNS indicators
    dns_values = [
        "DNS",
        "DNS1",
        "DNS2"
    ]


    # DNF / DSQ indicators
    non_finish_values = [
        "DNF",
        "DNF1",
        "DNF2",
        "DSQ",
        "DSQ1",
        "DSQ2"
    ]


    # Did they start?
    df["Started"] = ~(
        df["Total"].isin(dns_values)
        |
        (
            df["Total"].isna()
            &
            df["Run1"].isna()
            &
            df["Run2"].isna()
        )
    )


    # Did they finish?
    df["Finished"] = (
        df["Total"].notna()
        &
        ~df["Total"].isin(non_finish_values)
        &
        ~df["Total"].isin(dns_values)
    )


    return df

def add_rank_numeric(df):

    df = df.copy()

    df["Rank_num"] = pd.to_numeric(
        df["Rank"],
        errors="coerce"
    )

    # Remove non-finisher ranks
    df.loc[
        df["Rank_num"] >= 999,
        "Rank_num"
    ] = None

    return df

# -----------------------------
# Identity Features
# -----------------------------

def create_identity_features(df):

    athletes = (
        df.groupby("ACA")
        .agg(
            {
                "FIS ID": "first",
                "Name": "first",
                "YOB": "first",
                "Gender": "first"
            }
        )
        .reset_index()
    )

    return athletes


# -----------------------------
# Overall Experience Features
# -----------------------------

def create_experience_features(df):

    temp = df.copy()

    temp = add_result_status(temp)

    features = (
        temp.groupby("ACA")
        .agg(
            total_race_starts=("Started", "sum"),
            total_finishes=("Finished", "sum")
        )
        .reset_index()
    )


    features["overall_finish_rate"] = (
        features["total_finishes"]
        /
        features["total_race_starts"].replace(0, pd.NA)
    )


    # Placings
    temp = add_rank_numeric(temp)


    results = (
        temp.groupby("ACA")
        .agg(
            wins=("Rank_num", lambda x: (x == 1).sum()),
            podiums=("Rank_num", lambda x: (x <= 3).sum()),
            top_5s=("Rank_num", lambda x: (x <= 5).sum()),
            top_10s=("Rank_num", lambda x: (x <= 10).sum())
        )
        .reset_index()
    )


    features = features.merge(
        results,
        on="ACA",
        how="left"
    )

    return features


# -----------------------------
# Peak Performance
# -----------------------------

def create_peak_features(df):

    # These already exist from athlete merge
    features = (
        df.groupby("ACA")
        .agg(
            peak_gs_wr=("GS WR", "min"),
            peak_sl_wr=("SL WR", "min"),
            peak_sg_wr=("SG WR", "min"),
            peak_dh_wr=("DH WR", "min")
        )
        .reset_index()
    )

    return features


# -----------------------------
# Discipline Volume
# -----------------------------

def create_discipline_volume_features(df):

    disciplines = ["GS", "SL", "SG"]

    temp = df.copy()

    temp = add_result_status(temp)

    features = (
        temp[temp["Discipline"].isin(disciplines)]
        .groupby(
            ["ACA", "Discipline"]
        )["Started"]
        .sum()
        .reset_index()
    )


    features = features.pivot(
        index="ACA",
        columns="Discipline",
        values="Started"
    )


    features = features.rename(
        columns={
            "GS": "GS starts",
            "SL": "SL starts",
            "SG": "SG starts"
        }
    )


    return features.reset_index()



# -----------------------------
# Discipline Performance
# -----------------------------

def create_discipline_performance_features(df):

    temp = df.copy()

    temp = add_rank_numeric(temp)


    temp = temp[
        temp["Discipline"].isin(
            ["GS", "SL", "SG"]
        )
    ]


    grouped = (
        temp.groupby(
            ["ACA", "Discipline"]
        )
        .agg(
            wins=(
                "Rank_num",
                lambda x: (x == 1).sum()
            ),
            podiums=(
                "Rank_num",
                lambda x: (x <= 3).sum()
            ),
            top_5s=(
                "Rank_num",
                lambda x: (x <= 5).sum()
            ),
            top_10s=(
                "Rank_num",
                lambda x: (x <= 10).sum()
            )
        )
        .reset_index()
    )


    grouped["feature_prefix"] = (
        grouped["Discipline"]
    )


    rows = []

    for _, row in grouped.iterrows():

        prefix = row["feature_prefix"]

        rows.append(
            {
                "ACA": row["ACA"],
                f"{prefix} wins": row["wins"],
                f"{prefix} podiums": row["podiums"],
                f"{prefix} top 5s": row["top_5s"],
                f"{prefix} top 10s": row["top_10s"],
            }
        )


    features = pd.DataFrame(rows)

    features = (
        features
        .groupby("ACA")
        .first()
        .reset_index()
    )

    return features



# -----------------------------
# Discipline Consistency
# -----------------------------

def create_discipline_consistency_features(df):

    temp = df.copy()

    temp = add_result_status(temp)

    features = (
        temp[
            temp["Discipline"].isin(
                ["GS", "SL", "SG"]
            )
        ]
        .groupby(
            ["ACA", "Discipline"]
        )
        .agg(
            starts=("Started", "sum"),
            finishes=("Finished", "sum")
        )
        .reset_index()
    )


    features["finish_rate"] = (
        features["finishes"]
        /
        features["starts"].replace(0, pd.NA)
    )


    features = features.pivot(
        index="ACA",
        columns="Discipline",
        values="finish_rate"
    )


    features = features.rename(
        columns={
            "GS": "GS finish rate",
            "SL": "SL finish rate",
            "SG": "SG finish rate"
        }
    )


    return features.reset_index()

# -----------------------------
# Race Percentile Features
# -----------------------------

def add_race_percentile(df):

    df = df.copy()

    # Add Started / Finished flags
    df = add_result_status(df)


    # Convert rank to numeric
    df["Rank_num"] = pd.to_numeric(
        df["Rank"],
        errors="coerce"
    )


    # Valid percentile results:
    # - Must have finished
    # - Must have a valid rank
    # - Rank 999 is a non-finish placeholder
    df["Valid_percentile_result"] = (
        df["Finished"]
        &
        df["Rank_num"].notna()
        &
        (df["Rank_num"] != 999)
    )


    # Count finishers in each race
    df["Finishers"] = (
        df.groupby("Race Code")["Valid_percentile_result"]
        .transform("sum")
    )


    # Default missing
    df["Percentile"] = pd.NA


    # Calculate percentile only for finishers
    mask = df["Valid_percentile_result"]


    df.loc[mask, "Percentile"] = (
        (
            df.loc[mask, "Finishers"]
            -
            df.loc[mask, "Rank_num"]
        )
        /
        (
            df.loc[mask, "Finishers"]
            - 1
        )
    )


    return df
# -----------------------------
# Tier Percentile Features
# -----------------------------

def create_tier_features(df):

    temp = add_race_percentile(df)


    tiers = [
        "Zone",
        "Provincial",
        "Regional",
        "National",
        "International"
    ]


    features = []


    for tier in tiers:

        tier_df = temp[
            temp["Tier"] == tier
        ]


        grouped = (
            tier_df
            .groupby("ACA")
            .agg(
                {
                    "Percentile":"mean",
                    "Started":"sum"
                }
            )
            .reset_index()
        )


        grouped = grouped.rename(
            columns={
                "Percentile":
                    f"{tier} avg percentile",

                "Started":
                    f"{tier} starts"
            }
        )


        features.append(grouped)


    result = features[0]


    for f in features[1:]:
        result = result.merge(
            f,
            on="ACA",
            how="outer"
        )


    return result


def create_discipline_tier_features(df):

    temp = add_race_percentile(df)

    disciplines = [
        "GS",
        "SL",
        "SG"
    ]

    tiers = [
        "Zone",
        "Provincial",
        "Regional",
        "National",
        "International"
    ]


    outputs = []


    for discipline in disciplines:

        for tier in tiers:

            subset = temp[
                (temp["Discipline"] == discipline)
                &
                (temp["Tier"] == tier)
            ]


            grouped = (
                subset
                .groupby("ACA")
                .agg(
                    percentile=(
                        "Percentile",
                        "mean"
                    ),
                    starts=(
                        "Started",
                        "sum"
                    )
                )
                .reset_index()
            )


            grouped = grouped.rename(
                columns={
                    "percentile":
                        f"{discipline} {tier} avg percentile",

                    "starts":
                        f"{discipline} {tier} starts"
                }
            )


            outputs.append(grouped)


    result = outputs[0]


    for output in outputs[1:]:

        result = result.merge(
            output,
            on="ACA",
            how="outer"
        )


    return result



# -----------------------------
# Build Everything
# -----------------------------

def build_athlete_features(df):

    features = create_identity_features(df)


    functions = [
        create_experience_features,
        create_peak_features,
        create_discipline_volume_features,
        create_discipline_performance_features,
        create_discipline_consistency_features,
        create_tier_features,
        create_discipline_tier_features
    ]


    for function in functions:

        print(
            f"Running {function.__name__}"
        )

        new_features = function(df)

        features = features.merge(
            new_features,
            on="ACA",
            how="left"
        )


    return features



# -----------------------------
# Main
# -----------------------------

def main():

    results = pd.read_parquet(
        PROCESSED_DIR /
        "all_results.parquet"
    )


    print(
        f"Loaded {len(results)} race results"
    )


    athlete_features = build_athlete_features(
        results
    )


    output = (
        PROCESSED_DIR /
        "athletes_features.parquet"
    )


    athlete_features.to_parquet(
        output,
        index=False
    )


    print(
        f"Saved {output}"
    )

    print(
        athlete_features.shape
    )


if __name__ == "__main__":
    main()