import { buildSchema, GraphQLObjectType, GraphQLString } from "graphql";
import { createPost, fetchTimeline, likePost } from "./postResolvers";
import {
    createFriendRequest,
    acceptFriendRequest,
} from "./friendshipResolvers";
import { createComment, likeComment } from "./commentResolvers";

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
type Post {
    postedBy: Int,
    content: String,
    media: String
    likes: Int
    dislikes: Int
}

type FriendsList {
    id: Int!
    name: String
    picture: String
}[]

type MessagesList {
    friendId: Int!
    name: String
    picture: String
    lastMessage: String
    isOnline: Boolean
}[]

type Message {
    text: String
    media: String
    createdAt: String
    senderId: Int!
}

type Comment{
    commentedBy: Int!,
    commentOf: Int!,
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
    fetchTimeline(page: Int): [Post]
    listFriends(query: String, page: Int): FriendsList
    listRecentMessages(query: String, page: Int): MessagesList
    listMessages(friendId: Int!, query: String, page: Int): Message[]
}

type Mutation{
    createPost(postedBy: Int!, content:String, media:Upload):Post
    createFriendRequest(requestedBy: Int!, acceptedBy: Int!):Friendship
    acceptFriendRequest(friendshipId: Int!, accepted: Boolean):Friendship
    likePost(postId: Int!, isLike: Boolean):Post
    createComment(commentedBy: Int!, commentOf: Int!, parentComment: Int, content: String, media: Upload): Comment
    likeComment(commentId: Int!, isLike: Boolean):Comment
    createMessage(receiverId: Int!,text: String, media: Upload): Message
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
};
