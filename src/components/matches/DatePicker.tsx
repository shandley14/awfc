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
    const today = moment().format("YYYY-MM-DD"); // Today's date in URL format
    const selectedDate = moment(date).format("YYYY-MM-DD"); // Ensure consistency with URL format

    // ✅ Keep the actual date value for the picker but display "Today" in the text input
    const isToday = selectedDate === today;

    const handleChange = (newValue: Moment | null) => {
        if (newValue && moment(newValue).isValid()) {
            setDate(newValue.format("YYYY-MM-DD")); // Store in correct URL format
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterMoment}>
            <DesktopDatePicker
                label="Select Date"
                inputFormat="MM/DD/YYYY"
                value={moment(date).isValid() ? moment(date) : moment()}
                onChange={handleChange}
                renderInput={(params: TextFieldProps) => (
                    <TextField
                        {...params}
                        inputProps={{
                            ...params.inputProps,
                            value: isToday ? "Today" : moment(date).format("MM/DD/YYYY"), // ✅ Override text display
                        }}
                        sx={{ color: isDark ? "white" : "black" }}
                    />
                )}
            />
        </LocalizationProvider>
    );
}
