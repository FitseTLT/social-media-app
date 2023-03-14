import { css } from "@emotion/css";
import { Typography } from "@mui/material";
import { useState } from "react";

interface Props {
    text: string;
    max?: number;
}

export const LoadMore = ({ text, max = 100 }: Props) => {
    const [loadMore, setLoadMore] = useState(text?.length > max);

    return (
        <Typography
            fontSize="12px"
            marginX={1}
            marginBottom={1}
            textAlign={"left"}
            alignSelf={"flex-start"}
            fontWeight={300}
            fontFamily="Roboto !important"
        >
            {loadMore ? (
                <>
                    {text?.slice(0, max)}
                    <span
                        onClick={() => setLoadMore(false)}
                        className={css({
                            cursor: "pointer",
                            ":hover": {
                                textDecoration: "underline",
                            },
                            fontWeight: 500,
                            marginLeft: 5,
                        })}
                    >
                        ...See more
                    </span>
                </>
            ) : (
                text
            )}
        </Typography>
    );
};
