import { User } from "../models/User";
import { checkPassword, encrypt } from "../utils/encrypt";
import { storeFS } from "../utils/storeFS";

export async function updateProfile(
    {
        name,
        picture,
        newPassword,
        confirmPassword,
        prevPassword,
    }: {
        name: string;
        picture: any;
        newPassword: string;
        confirmPassword: string;
        prevPassword: string;
    },
    { user }: { user: number }
) {
    const userDoc = await User.findByPk(user);

    if (!userDoc) throw new Error("No user record");

    if (newPassword) {
        const passwordCorrect = await checkPassword(
            userDoc.password,
            prevPassword
        );
        if (!passwordCorrect) throw new Error("previous password wrong");

        if (newPassword !== confirmPassword)
            throw new Error("new password and confirm password unequal.");
    }

    let pictureUrl;

    if (picture) {
        const { createReadStream, filename } = await picture.promise;
        const stream = createReadStream();
        const { path } = await storeFS({ stream, filename });
        pictureUrl = path;
    }

    const hashedPassword = await encrypt(newPassword);

    await userDoc.update({
        ...(name && { name }),
        ...(pictureUrl && { picture: pictureUrl }),
        ...(newPassword && { password: hashedPassword }),
    });

    return userDoc;
}

export async function getCurrentUser(_: any, { user }: { user: number }) {
    const userDoc = await User.findByPk(user);

    if (!userDoc) throw new Error("No user record");
    const { name, picture, id } = userDoc;

    return { name, picture, id };
}
