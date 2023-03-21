import { buildSchema, GraphQLObjectType, GraphQLString } from "graphql";
import {
    createPost,
    fetchTimeline,
    likePost,
    listPosts,
} from "./postResolvers";
import {
    createFriendRequest,
    acceptFriendRequest,
    listFriends,
    searchForPeople,
    listFriendRequests,
} from "./friendshipResolvers";
import { createComment, getComments } from "./commentResolvers";
import {
    createMessage,
    getTotalUnread,
    listMessages,
    listRecentMessages,
    setAllAsRead,
    setAsRead,
} from "./messageResolvers";
import { getCurrentUser, updateProfile } from "./userResolvers";

const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        name: { type: GraphQLString },
    }),
});

const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        user: {
            type: UserType,
            resolve: () => ({
                name: "Ton y stark",
            }),
        },
    },
});

const mutation = new GraphQLObjectType({
    name: "mutation",
    fields: {},
});

export const schema = buildSchema(`
scalar Upload

type UserData{
    id: Int!
    name: String
    picture: String
}

type PeopleData{
    id: Int!
    name: String
    picture: String
    status: String
}

type Post {
    id: Int!
    User: UserData
    postedBy: Int,
    content: String,
    media: String
    mediaType: String
    likes: Int
    dislikes: Int
    lastComment: Comment
    createdAt: String!
    hasLiked: Boolean
}


type FriendRequest {
    friendshipId: Int!
    friendId: Int!
    name: String
    picture: String
}

type MessagesList {
    friendId: Int!
    name: String
    picture: String
    lastMessage: String
    unreadMessages: Int
}

type Message {
    id: Int!
    text: String
    media: String
    mediaType: String
    senderId: Int
    receiverId: Int
    createdAt: String
    isRead: Boolean
    cursor: String
    callType: String
    callDuration: Int
}

type Comment{
    id:Int!
    commentedBy: Int!,
    postId: Int!,
    parentComment: Int,
    content: String,
    media: String
    mediaType: String
    likes: Int,
    dislikes: Int
    User: UserData
    createdAt: String!
}

type Friendship{
    id:Int!
    requestedBy: Int,
    acceptedBy: Int,
    createdAt: String,
    acceptedAt: String
}

type UnreadList {
    friendIdsWithUnread:[Int]
}

type Query {
    getCurrentUser: UserData
    fetchTimeline(page: Int): [Post]
    listFriends(query: String): [UserData]
    listRecentMessages(query: String, page: Int): [MessagesList]
    listMessages(friendId: Int!, cursor: String, isNextPage: Boolean):[Message]
    searchForPeople(query: String): [PeopleData]
    listFriendRequests: [FriendRequest]
    listPosts(userId: Int!, page: Int): [Post]
    getComments(postId: Int!, page: Int): [Comment]
    getTotalUnread:UnreadList
}

type Mutation{
    updateProfile(name: String, picture: Upload, newPassword: String, confirmPassword: String, prevPassword: String): UserData
    createPost(content:String, media:Upload):Post
    createFriendRequest( acceptedBy: Int!):Friendship
    acceptFriendRequest(friendshipId: Int!, accepted: Boolean):Friendship
    likePost(postId: Int!, isLike: Boolean):Post
    createComment(postId: Int!, content: String, media: Upload): Comment
    createMessage(receiverId: Int!,text: String, media: Upload, callType: String, callDuration: Int, callerId: Int): Message
    setAsRead(messageId: Int!): Message
    setAllAsRead(friendId: Int!): [Message]
}
`);

export const root: any = {
    createPost,
    fetchTimeline,
    createFriendRequest,
    acceptFriendRequest,
    likePost,
    createComment,
    listFriends,
    createMessage,
    setAsRead,
    setAllAsRead,
    listRecentMessages,
    listMessages,
    searchForPeople,
    listFriendRequests,
    listPosts,
    updateProfile,
    getCurrentUser,
    getComments,
    getTotalUnread,
};
