import pandas as pd
import os
import re
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent

RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"


def load_athletes():
    """
    Load athlete master table.
    """
    filepath = os.path.join(RAW_DIR, "Alpine Skiing Data.xlsx")
    athletes = pd.read_excel(filepath, sheet_name="Athletes")
    return athletes


def load_jr_results():
    """
    Load race metadata.
    """
    filepath = os.path.join(RAW_DIR, "Alpine Skiing Data.xlsx")
    races = pd.read_excel(filepath, sheet_name="JR Results")
    return races


def normalize_race_format(df):
    # International format
    if "Competitor" in df.columns:
        df = df.rename(columns={
            "Card": "ACA",
            "Competitor": "Name",
            "Club": "Team",
            "RPoints": "Points"
        })
    return df


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
    files_matched = []
    files_skipped = []

    for filename in os.listdir(RAW_DIR):

        # Loosened matching: case-insensitive, tolerant of underscores/spaces,
        # and only look at actual workbook files (skip temp/lock files like ~$...)
        normalized = filename.lower().replace("_", " ")
        if filename.startswith("~$") or "jr historical results" not in normalized:
            files_skipped.append(filename)
            continue

        files_matched.append(filename)
        filepath = os.path.join(RAW_DIR, filename)
        season = get_season(filename)

        if season is None:
            print(f"  WARNING: could not extract season/year from '{filename}' - skipping file")
            continue

        print(f"Loading {filename} (season={season})")

        workbook = pd.read_excel(filepath, sheet_name=None)

        for race_code, df in workbook.items():

            n_before = len(df)

            df = df.dropna(axis=1, how="all")
            df = df.dropna(axis=0, how="all")
            df = normalize_race_format(df)

            for col in ["Name", "YOB"]:
                if col in df.columns:
                    df = df.drop(columns=[col])

            if "ACA" not in df.columns:
                print(f"  WARNING: tab '{race_code}' in {filename} has no ACA/Card column "
                      f"(columns found: {list(df.columns)}) - all {n_before} rows will be dropped")

            df["Race Code"] = race_code
            df["Season"] = season

            all_races.append(df)

    print(f"\nFile scan: {len(files_matched)} matched, {len(files_skipped)} skipped")
    if files_skipped:
        print("Skipped files (check these aren't ones you actually wanted):")
        for f in files_skipped:
            print(f"  - {f}")

    if not all_races:
        raise RuntimeError(
            "No race tabs were loaded at all. Check RAW_DIR path and filenames: "
            f"{RAW_DIR}"
        )

    results = pd.concat(all_races, ignore_index=True)

    print(f"\nAfter concatenating all race tabs (before ACA filter): {results.shape}")
    print(f"  ACA column dtype: {results['ACA'].dtype}")
    print(f"  ACA non-null count: {results['ACA'].notna().sum()} / {len(results)}")
    print(f"  Sample ACA values: {results['ACA'].dropna().unique()[:10]}")

    # Remove duplicate columns created by different race formats
    results = results.drop(
        columns=["Total.1", "Run1.1", "Run2.1", "RPoints", " "],
        errors="ignore"
    )

    # Normalize ACA to a clean numeric type BEFORE filtering, so that
    # "70941", "70941.0", 70941, and 70941.0 all match the same way.
    results["ACA"] = pd.to_numeric(results["ACA"], errors="coerce")

    n_before_filter = len(results)
    results = results[results["ACA"].notna()].copy()
    print(f"\nAfter keeping only rows with a valid ACA: {len(results)} "
          f"(dropped {n_before_filter - len(results)})")

    return results


def merge_race_info(results, races):

    races = races.rename(columns={"Notes/Title": "Title"})

    # Guard against blank Location/Province cells, which otherwise raise
    # a TypeError when concatenated with "+".
    races["Location"] = races["Location"].fillna("").astype(str)
    races["Province"] = races["Province"].fillna("").astype(str)
    races["Location"] = (races["Location"] + ", " + races["Province"]).str.strip(", ")

    races = races[[
        "Race Code", "Date", "Age Group", "Discipline",
        "Tier", "Location", "Title"
    ]]

    n_before = len(results)
    results = results.merge(races, on="Race Code", how="left")
    print(f"After race-info merge: {results.shape} (row count should be unchanged: was {n_before})")

    unmatched = results["Date"].isna().sum()
    if unmatched:
        print(f"  WARNING: {unmatched} rows had a Race Code with no match in JR Results "
              f"(check for typos in tab names vs the registry)")

    return results


def merge_athlete_info(results, athletes):

    athlete_cols = [
        "ACA ID", "FIS ID", "Last Name", "First Name", "YOB", "Gender",
        "GS WR", "SL WR", "SG WR", "DH WR"
    ]
    athletes = athletes[athlete_cols].copy()

    athletes["Last Name"] = athletes["Last Name"].fillna("")
    athletes["First Name"] = athletes["First Name"].fillna("")
    athletes["Name"] = (athletes["Last Name"] + ", " + athletes["First Name"]).str.strip(", ")

    # Normalize the join key the same way as the results side, so
    # 62750 / 62750.0 / "62750" all match consistently.
    athletes["ACA ID"] = pd.to_numeric(athletes["ACA ID"], errors="coerce")
    athletes = athletes.rename(columns={"ACA ID": "ACA"})

    athletes = athletes[[
        "ACA", "FIS ID", "Name", "YOB", "Gender",
        "GS WR", "SL WR", "SG WR", "DH WR"
    ]]

    n_before = len(results)
    results = results.merge(athletes, on="ACA", how="left")
    print(f"After athlete-info merge: {results.shape} (row count should be unchanged: was {n_before})")

    matched = results["Name"].notna().sum()
    print(f"  {matched} / {len(results)} race results matched to a known athlete in the Athletes tab")
    print(f"  (unmatched ones are junior racers not in your Athletes master list - that's expected, "
          f"not a bug, unless the number looks too high)")

    return results


def clean_for_parquet(results):

    # FIS ID: coerce first so blanks become real NaN, THEN cast to
    # nullable Int64 (this is the step that was likely crashing before).
    results["FIS ID"] = pd.to_numeric(results["FIS ID"], errors="coerce")
    results["FIS ID"] = results["FIS ID"].astype("Int64")

    results["ACA"] = pd.to_numeric(results["ACA"], errors="coerce")
    results = results.dropna(subset=["ACA"]).copy()
    results["ACA"] = results["ACA"].astype("Int64")

    string_columns = [
        "Team", "Name", "Location", "Title", "Gender", "Discipline",
        "Tier", "Rank", "Bib", "Run1", "Run2", "Total", "Points"
    ]
    for col in string_columns:
        if col in results.columns:
            results[col] = results[col].astype("string")

    print("\nFinal dtypes:")
    print(results.dtypes)

    return results


def main():

    athletes = load_athletes()
    print(f"Loaded Athletes tab: {athletes.shape}")

    races = load_jr_results()
    print(f"Loaded JR Results tab: {races.shape}")

    results = load_race_workbooks()
    print(f"\nLoaded {len(results)} race results total\n")

    results = merge_race_info(results, races)
    results = merge_athlete_info(results, athletes)
    results = clean_for_parquet(results)

    print(f"\nFINAL shape: {results.shape}")

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    output = os.path.join(PROCESSED_DIR, "all_results.parquet")

    results["Rank"] = results["Rank"].astype(str)

    results.to_parquet(output, index=False)
    print(f"Saved {output}")


if __name__ == "__main__":
    main()