import type { Athlete } from "../../types/Athlete";
import type { Team } from "../../types/Team";
import "./Multiselect.scss";
import Select, { components, type OptionProps, type GroupBase } from "react-select";
import { useEffect, useState } from "react";

interface MultiSelectExProps {
  athletes?: Athlete[];
  teams?: Team[];
  type: "athlete" | "team";
  onChange: (selectedIds: number[]) => void;
}

interface AthleteOption {
  value: number;
  label: string;
  teamName: string;
}

interface TeamOption {
  value: number;
  label: string;
}

type SelectOption = AthleteOption | TeamOption;

const MultiSelectEx: React.FC<MultiSelectExProps> = ({
  athletes,
  teams,
  type,
  onChange,
}) => {
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    if (type === "athlete" && athletes) {
      const athleteOptions: AthleteOption[] = [];

      athletes.forEach((athlete) => {
        if (!athlete.athleteId) return;

        const activeMemberships =
          athlete.teamMemberships?.filter(
            (membership) => membership.endDate === null
          ) ?? [];

        // Athlete has no active team
        if (activeMemberships.length === 0) {
          athleteOptions.push({
            value: athlete.athleteId,
            label: `${athlete.athleteFirstName} ${athlete.athleteLastName}`,
            teamName: "No Team",
          });

          return;
        }

        // Add the athlete once for each active team
        activeMemberships.forEach((membership) => {
          if (!membership.team) return;
          if (athlete.athleteId === undefined) {
            return;
          }

          athleteOptions.push({
            value: athlete.athleteId,
            label: `${athlete.athleteFirstName} ${athlete.athleteLastName}`,
            teamName: membership.team.name,
          });
        });
      });
      athleteOptions.sort((a, b) =>
        a.label.localeCompare(b.label)
      );

      setOptions(athleteOptions);
    }

    if (type === "team" && teams) {
      setOptions(
        teams.map((team) => ({
          value: team.teamId,
          label: team.name,
        }))
      );
    }
  }, [athletes, teams, type]);

  /*
   * Custom checkbox option.
   */
  const CheckboxOption = (
    props: OptionProps<SelectOption, true, GroupBase<SelectOption>>
  ) => {
    return (
      <components.Option {...props}>
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
          style={{ marginRight: "8px" }}
        />

        <span>{props.label}</span>
      </components.Option>
    );
  };

  /*
   * Group athletes by team.
   */
  const groupedOptions =
    type === "athlete"
      ? Object.values(
          (options as AthleteOption[]).reduce(
            (groups, athlete) => {
              if (!groups[athlete.teamName]) {
                groups[athlete.teamName] = {
                  label: athlete.teamName,
                  options: [],
                };
              }

              groups[athlete.teamName].options.push(athlete);

              return groups;
            },
            {} as Record<
              string,
              {
                label: string;
                options: AthleteOption[];
              }
            >
          )
        )
          .map((group) => ({
            ...group,
            options: group.options.sort((a, b) =>
              a.label.localeCompare(b.label)
            ),
          }))
          .sort((a, b) =>
            a.label.localeCompare(b.label)
          )
      : undefined;

  return (
    <Select
      options={
        type === "athlete"
          ? groupedOptions
          : options
      }

      isMulti

      closeMenuOnSelect={false}

      hideSelectedOptions={false}

      components={
        type === "athlete"
          ? {
              Option: CheckboxOption,
            }
          : undefined
      }

      onChange={(selectedOptions) => {
        const selectedIds = selectedOptions
          ? selectedOptions.map((option) => Number(option.value))
          : [];

        // Remove duplicates.
        onChange([...new Set(selectedIds)]);
      }}

      isOptionDisabled={(option, selectValue) => {
        /*
         * If the athlete is already selected under another team,
         * disable their other occurrence.
         */
        if (type !== "athlete") return false;

        const selectedIds = new Set(
          selectValue.map((selected) => Number(selected.value))
        );

        return selectedIds.has(Number(option.value));
      }}

      name={type === "athlete" ? "attendance" : "teams"}

      className="basic-multi-select"
      classNamePrefix="select"

      placeholder={
        type === "athlete"
          ? "Select athletes..."
          : "Select teams..."
      }

      isSearchable
    />
  );
};

export default MultiSelectEx;