import { DocumentNode, useLazyQuery } from "@apollo/client";
import { useEffect, useRef } from "react";
import useForceUpdate from "use-force-update";

export const useScrollFetch = ({
    QUERY,
    scrollEl,
    variables = {},
    onWindow = true,
    reverseScroll = false,
    mergeData = true,
    twoWayScroll = false,
    pageInfo,
}: {
    QUERY: DocumentNode;
    scrollEl?: React.MutableRefObject<HTMLElement | null>;
    variables?: any;
    onWindow?: boolean;
    reverseScroll?: boolean;
    mergeData?: boolean;
    twoWayScroll?: boolean;
    pageInfo?: {
        startCursor?: string;
        endCursor?: string;
    };
}) => {
    const forceUpdate = useForceUpdate();

    const fetchRef = useRef({
        loading: false,
        noMoreData: false,
        page: 1,
        scrollY: 0,
        pageInfo,
        hasNextPage: true,
        hasPreviousPage: true,
        isNextPage: true,
    });
    const [fetch, { data, error, fetchMore }] = useLazyQuery(QUERY, {
        async onCompleted(data) {
            fetchRef.current.loading = false;
            const list = Object.values(data)[0] as any;
            if (list?.length < 10) {
                fetchRef.current.hasNextPage = false;
                fetchRef.current.hasPreviousPage = false;
            }
            if (list.length === 0) {
                fetchRef.current.noMoreData = true;
                return;
            }
        },
        fetchPolicy: "network-only",
        variables: {
            ...(!twoWayScroll && { page: 0 }),
            ...(twoWayScroll && {
                cursor: fetchRef.current.isNextPage
                    ? pageInfo?.endCursor
                    : pageInfo?.startCursor,
                isNextPage: fetchRef.current.isNextPage,
            }),
            ...variables,
        },
    });

    const refAnchor = useRef<HTMLElement | null>(null);
    const refAnchor2 = useRef<HTMLElement | null>(null);

    const loadMore = () => {
        const refRect = refAnchor.current?.getBoundingClientRect();
        const scrollRect = scrollEl?.current?.getBoundingClientRect() || {
            top: 0,
            bottom: innerHeight,
        };

        if (twoWayScroll) {
            const refRect2 = refAnchor2.current?.getBoundingClientRect();

            const scrollTop = scrollEl?.current?.scrollTop || window.scrollY;

            const scrollUp = scrollTop < fetchRef.current.scrollY;

            fetchRef.current.scrollY = scrollTop;

            if (
                (!scrollUp &&
                    fetchRef.current.hasNextPage &&
                    !fetchRef.current.loading &&
                    refRect2 &&
                    refRect2?.top < scrollRect.bottom + 200) ||
                (scrollUp &&
                    fetchRef.current.hasPreviousPage &&
                    !fetchRef.current.loading &&
                    refRect &&
                    refRect?.bottom > scrollRect.top - 200)
            ) {
                fetchRef.current.loading = true;
                fetchRef.current.isNextPage = !scrollUp;

                fetchMore({}).then((value) => {
                    fetchRef.current.loading = false;
                    const list = Object.values(value.data)[0] as any;

                    if (list.length === 0) {
                        fetchRef.current.isNextPage
                            ? (fetchRef.current.hasNextPage = false)
                            : (fetchRef.current.hasPreviousPage = false);
                        forceUpdate();
                    }
                });
            }
        } else if (
            (!reverseScroll &&
                !fetchRef.current.noMoreData &&
                !fetchRef.current.loading &&
                refRect &&
                refRect?.top < scrollRect.bottom + 200) ||
            (reverseScroll &&
                !fetchRef.current.noMoreData &&
                !fetchRef.current.loading &&
                refRect &&
                refRect?.bottom > scrollRect.top - 200)
        ) {
            fetchMore({
                variables: { page: fetchRef.current.page },
            }).then((value) => {
                if (mergeData) {
                    const list = Object.values(value.data)[0] as [];
                    if (list?.length === 0) {
                        fetchRef.current.noMoreData = true;
                        forceUpdate();
                    } else fetchRef.current.page++;
                } else {
                    const list = Object.values(value.data)[0] as {
                        data: [];
                        count: number;
                    };
                    if (list?.data?.length === list?.count) {
                        fetchRef.current.noMoreData = true;
                        forceUpdate();
                    } else fetchRef.current.page++;
                }
                fetchRef.current.loading = false;
            });
            fetchRef.current.loading = true;
        }
    };

    useEffect(() => {
        if (onWindow) {
            window.addEventListener("scroll", loadMore);

            fetch();
            fetchRef.current.loading = true;
            fetchRef.current.scrollY = window.scrollY;
            return () => window.removeEventListener("scroll", loadMore);
        }
    }, []);

    useEffect(() => {
        loadMore();
    }, [data]);

    useEffect(() => {
        if (!scrollEl?.current) return;
        scrollEl.current.addEventListener("scroll", loadMore);
        fetchRef.current.scrollY = scrollEl?.current?.scrollTop;

        fetch();

        return () => scrollEl?.current?.removeEventListener("scroll", loadMore);
    }, [scrollEl?.current]);

    return {
        refAnchor,
        refAnchor2,
        data,
        noMoreData: fetchRef.current.noMoreData,
        hasNextPage: fetchRef.current.hasNextPage,
        hasPreviousPage: fetchRef.current.hasPreviousPage,
        fetch,
        error,
    };
};
