import pandas as pd
import os
import re


RAW_DIR = "../data/raw"
PROCESSED_DIR = "../data/processed"


def load_athletes():
    """
    Load athlete master table.
    """

    filepath = os.path.join(
        RAW_DIR,
        "Alpine Skiing Data.xlsx"
    )

    athletes = pd.read_excel(
        filepath,
        sheet_name="Athletes"
    )

    return athletes



def load_jr_results():
    """
    Load race metadata.
    """

    filepath = os.path.join(
        RAW_DIR,
        "Alpine Skiing Data.xlsx"
    )

    races = pd.read_excel(
        filepath,
        sheet_name="JR Results"
    )

    return races



def get_season(filename):
    """
    Extract season year from filename.

    Example:
    M2023 JR Historical Results.xlsx

    returns:
    2023
    """

    match = re.search(r"(20\d{2})", filename)

    if match:
        return int(match.group(1))

    return None



def load_race_workbooks():
    """
    Read all M/W junior result files.
    """

    all_races = []

    for filename in os.listdir(RAW_DIR):

        if "JR Historical Results" not in filename:
            continue


        filepath = os.path.join(
            RAW_DIR,
            filename
        )


        season = get_season(filename)


        print(f"Loading {filename}")


        # Load every sheet
        workbook = pd.read_excel(
            filepath,
            sheet_name=None
        )


        for race_code, df in workbook.items():

            # Remove completely empty columns
            df = df.dropna(
                axis=1,
                how="all"
            )


            # Remove completely empty rows
            df = df.dropna(
                axis=0,
                how="all"
            )

            # Remove athlete information that comes from Athletes table
            for col in ["Name", "YOB"]:
                if col in df.columns:
                    df = df.drop(columns=[col])


            # Add identifiers
            df["Race Code"] = race_code
            df["Season"] = season


            all_races.append(df)


    results = pd.concat(
        all_races,
        ignore_index=True
    )


    return results


def merge_race_info(results, races):

    races = races.rename(
        columns={
            "Notes/Title": "Title"
        }
    )


    races["Location"] = (
        races["Location"]
        + ", "
        + races["Province"]
    )


    races = races[
        [
            "Race Code",
            "Date",
            "Age Group",
            "Discipline",
            "Tier",
            "Location",
            "Title"
        ]
    ]


    results = results.merge(
        races,
        on="Race Code",
        how="left"
    )


    return results

def merge_athlete_info(results, athletes):

    athlete_cols = [
        "ACA ID",
        "FIS ID",
        "Last Name",
        "First Name",
        "YOB",
        "Gender",
        "GS WR",
        "SL WR",
        "SG WR",
        "DH WR"
    ]

    athletes = athletes[athlete_cols]


    # Create full athlete name
    athletes["Name"] = (
        athletes["Last Name"]
        + ", "
        + athletes["First Name"]
    )


    # Rename ACA ID to match results table
    athletes = athletes.rename(
        columns={
            "ACA ID": "ACA"
        }
    )


    # Keep only final columns
    athletes = athletes[
        [
            "ACA",
            "FIS ID",
            "Name",
            "YOB",
            "Gender",
            "GS WR",
            "SL WR",
            "SG WR",
            "DH WR"
        ]
    ]


    results = results.merge(
        athletes,
        on="ACA",
        how="left",
        suffixes=("", "_athlete")
    )


    # Remove Name from race sheet if it exists
    if "Name_athlete" in results.columns:
        results["Name"] = results["Name_athlete"]
        results = results.drop(
            columns=["Name_athlete"]
        )


    return results


def main():

    athletes = load_athletes()

    races = load_jr_results()

    results = load_race_workbooks()


    print(
        f"Loaded {len(results)} race results"
    )


    results = merge_race_info(
        results,
        races
    )


    results = merge_athlete_info(
        results,
        athletes
    )


    output = os.path.join(
        PROCESSED_DIR,
        "all_results.parquet"
    )


    results.to_parquet(
        output,
        index=False
    )


    print(
        f"Saved {output}"
    )



if __name__ == "__main__":
    main()