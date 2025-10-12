import type { Athlete } from "../../types/Athlete";
import "./Multiselect.scss";
import Select from 'react-select';
import { useEffect, useState } from "react";



interface MultiSelectExProps {
  athletes: Athlete[];
  onChange: (selectedIds: number[]) => void;
}

interface CustomOption {
    value: number | string,
    label: string
}


const MultiSelectEx: React.FC<MultiSelectExProps> = ({ athletes, onChange }) => {
    const [options, setOptions] = useState<CustomOption[]>([]);


    useEffect(() => {
    if (athletes && athletes.length > 0) {
      setOptions(
        athletes.map((athlete) => ({
          value: athlete.athleteId as number,
          label: `${athlete.athleteFirstName} ${athlete.athleteLastName}`,
        }))
      );
    }
  }, [athletes]);

  return (
    <Select
      options={options}
      onChange={(selectedOptions) => {
        const selectedIds = selectedOptions
          ? selectedOptions.map((option) => Number(option.value))
          : [];
        onChange(selectedIds);
      }}
      isMulti
      name="attendance"
      className="basic-multi-select"
      classNamePrefix="select"
    />
  )
}

export default MultiSelectEx