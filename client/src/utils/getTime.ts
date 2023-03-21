export const getTime = (createdAt: string) => {
    const date = new Date(Number(createdAt) || `${createdAt}.000Z`);

    let fromNow = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    const timeArray = [
        [60, "min"],
        [24, "hr"],
        [30, "day"],
    ];
    if (fromNow < 60) return "Now";
    fromNow = Math.ceil(fromNow / (60 as number));
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
