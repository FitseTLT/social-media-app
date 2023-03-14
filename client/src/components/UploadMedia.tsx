import { AddAPhoto } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

interface Props {
    size?: "small" | "medium" | "large";
    setMediaPath: Dispatch<SetStateAction<string | null>>;
    setMedia: Dispatch<
        SetStateAction<{ type: string; media: Blob } | null | undefined>
    >;
}

export const UploadMedia = ({
    setMediaPath,
    setMedia,
    size = "medium",
}: Props) => {
    const selectMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setMedia({
            type: file.type,
            media: file,
        });
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = () => {
            setMediaPath(reader.result as string);
        };
    };

    return (
        <>
            <IconButton
                sx={{
                    marginLeft: "10px",
                    marginRight: "10px",
                    ":focus": { outline: "none" },
                }}
                size={size}
            >
                <label htmlFor="media">
                    <AddAPhoto />
                </label>
            </IconButton>
            <input
                id="media"
                type="file"
                accept="video/*, image/*"
                hidden={true}
                onChange={selectMedia}
            />
        </>
    );
};
