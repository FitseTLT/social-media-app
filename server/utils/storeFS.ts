import fs from "fs";
import { v4 } from "uuid";

const UPLOAD_DIR = "public";

export const storeFS = async ({ stream, filename }: any) => {
    const id = v4();
    const path = `${UPLOAD_DIR}/${id}-${filename}`;
    await stream.pipe(fs.createWriteStream(path));
    return { path };
};
