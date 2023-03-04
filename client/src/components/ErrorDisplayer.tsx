import { FormHelperText } from "@mui/material";

export const ErrorDisplay = ({ content }: { content: string | undefined }) => (
    <FormHelperText sx={{ textAlign: "center", color: "red" }}>
        {content}
    </FormHelperText>
);
