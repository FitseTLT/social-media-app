export const getTime = (createdAt: string) => {
    const date = new Date(Number(createdAt));
    let fromNow = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    const timeArray = [
        [60, "sec"],
        [60, "min"],
        [24, "hr"],
        [30, "day"],
    ];

    for (const time of timeArray) {
        if (fromNow < time[0])
            return `${fromNow} ${time[1]}${fromNow > 1 ? "s" : ""}`;
        fromNow = Math.ceil(fromNow / (time[0] as number));
    }

    return date.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
    });
};
