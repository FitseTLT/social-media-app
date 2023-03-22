import { css } from "@emotion/css";
import { Avatar, Button, FormControl, FormLabel, Input } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { useState, useEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { setCurrentUser } from "../store/userSlice";
import { ErrorDisplay } from "./ErrorDisplayer";

const UPDATE_PROFILE = gql`
    mutation (
        $name: String
        $prevPassword: String
        $newPassword: String
        $confirmPassword: String
        $picture: Upload
    ) {
        updateProfile(
            name: $name
            prevPassword: $prevPassword
            newPassword: $newPassword
            confirmPassword: $confirmPassword
            picture: $picture
        ) {
            id
            name
            picture
        }
    }
`;

export const EditProfile = () => {
    const { name, picture } = useSelector((state: RootState) => state.user);
    const [updateProfile, { loading, error, data, called, reset }] =
        useMutation(UPDATE_PROFILE);

    const [pictureUrl, setPictureUrl] = useState(picture);
    const [pictureFile, setPictureFile] = useState<Blob | null>(null);
    const [formState, setFormState] = useState({
        name,
        prevPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const changeFormState = (e: React.ChangeEvent<HTMLInputElement>) => {
        reset();
        setFormState({
            ...formState,
            [e.target.name]: e.target.value,
        });
    };

    useEffect(() => {
        if (!called || loading) return;
        if (!error) navigate("/");
        if (data) {
            const { updateProfile } = data;
            dispatch(setCurrentUser(updateProfile));
        }
    }, [loading]);

    const changePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
        reset();
        const file = e.target.files?.[0] as Blob;
        if (!file) return;
        setPictureFile(file);
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = () => {
            setPictureUrl(reader.result as string);
        };
    };

    const editProfile = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        updateProfile({ variables: { ...formState, picture: pictureFile } });
    };

    return (
        <form
            onSubmit={editProfile}
            className={css({
                display: "flex",
                flexDirection: "column",
                marginTop: "50px",
                marginInline: "auto",
                paddingInline: "20px",
                width: "100%",
                maxWidth: "400px",
                alignItems: "center",
                "& > div": {
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBlock: "30px",
                },
            })}
        >
            <ErrorDisplay content={error?.message} />
            <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                    name="name"
                    onChange={changeFormState}
                    value={formState.name}
                ></Input>
            </FormControl>
            <FormControl>
                <FormLabel>New Password</FormLabel>
                <Input
                    type="password"
                    name="newPassword"
                    onChange={changeFormState}
                    value={formState.newPassword}
                ></Input>
            </FormControl>
            <FormControl>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                    type="password"
                    name="confirmPassword"
                    onChange={changeFormState}
                    value={formState.confirmPassword}
                ></Input>
            </FormControl>
            <FormControl>
                <FormLabel>Prev Password</FormLabel>
                <Input
                    type="password"
                    name="prevPassword"
                    onChange={changeFormState}
                    value={formState.prevPassword}
                ></Input>
            </FormControl>
            <FormControl>
                <FormLabel>Avatar</FormLabel>
                <FormLabel
                    sx={{ marginInlineEnd: "20%", cursor: "pointer" }}
                    htmlFor="picture"
                >
                    <Avatar src={pictureUrl} />
                </FormLabel>
                <input
                    type="file"
                    id="picture"
                    className={css({ display: "none" })}
                    name="picture"
                    onChange={changePicture}
                    accept="image/*"
                />
            </FormControl>
            <Button sx={{ marginBlock: 4 }} variant="contained" type="submit">
                Update Profile
            </Button>
        </form>
    );
};
