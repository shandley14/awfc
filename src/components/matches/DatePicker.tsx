import * as React from "react";
import moment, { Moment } from "moment";
import TextField from "@mui/material/TextField";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { TextFieldProps } from "@mui/material/TextField";
import { useApp } from "../constants/contexts/AppContext";

type Props = {
    date: Date | string;
    setDate: React.Dispatch<React.SetStateAction<Date | string>>;
};

export default function DatePicker({ date, setDate }: Props) {
    const { isDark } = useApp();

    // ✅ Sync DatePicker's value with selected date
    const [value, setValue] = React.useState<Moment | null>(
        date && moment(date).isValid() ? moment(date) : moment()
    );

    // ✅ Update state when `date` prop changes (keeps DatePicker in sync)
    React.useEffect(() => {
        if (date && moment(date).isValid()) {
            setValue(moment(date));
        }
    }, [date]);

    const handleChange = (newValue: Moment | null) => {
        if (newValue && moment(newValue).isValid()) {
            setValue(newValue);
            setDate(newValue.format("YYYY-MM-DD")); // ✅ Updates `index.tsx`
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterMoment}>
            <DesktopDatePicker
                label="Select Date"
                inputFormat="MM/DD/YYYY"
                value={value}
                onChange={handleChange}
                renderInput={(params: TextFieldProps) => (
                    <TextField {...params} sx={{ color: isDark ? "white" : "black" }} />
                )}
            />
        </LocalizationProvider>
    );
}
