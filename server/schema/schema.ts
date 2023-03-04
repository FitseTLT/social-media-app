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
import { createComment, likeComment } from "./commentResolvers";
import {
    createMessage,
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

type Post {
    id: Int
    User: UserData
    postedBy: Int,
    content: String,
    media: String
    likes: Int
    dislikes: Int
    lastComment: Comment
}

type FriendsList {
    id: Int!
    name: String
    picture: String
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
    unreadMessage: Int
}

type Message {
    text: String
    media: String
    senderId: Int
    receiverId: Int
    createdAt: String
    isRead: Boolean
}

type Comment{
    commentedBy: Int!,
    postId: Int!,
    parentComment: Int,
    content: String,
    media: String
    likes: Int,
    dislikes: Int
}

type Friendship{
    requestedBy: Int,
    acceptedBy: Int,
    createdAt: String,
    acceptedAt: String
}


type Query {
    getCurrentUser: UserData
    fetchTimeline(page: Int): [Post]
    listFriends(query: String, page: Int): [FriendsList]
    listRecentMessages( page: Int): [MessagesList]
    listMessages(friendId: Int!, query: String, page: Int): [Message]
    searchForPeople(query: String, page: Int): [FriendsList]
    listFriendRequests(page: Int): [FriendRequest]
    listPosts(friendId: Int!, page: Int): [Post]
}

type Mutation{
    updateProfile(name: String, picture: Upload, newPassword: String, confirmPassword: String, prevPassword: String): UserData
    createPost(content:String, media:Upload):Post
    createFriendRequest(requestedBy: Int!, acceptedBy: Int!):Friendship
    acceptFriendRequest(friendshipId: Int!, accepted: Boolean):Friendship
    likePost(postId: Int!, isLike: Boolean):Post
    createComment(postId: Int!, parentComment: Int, content: String, media: Upload): Comment
    likeComment(commentId: Int!, isLike: Boolean):Comment
    createMessage(receiverId: Int!,text: String, media: Upload): Message
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
    likeComment,
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
};
