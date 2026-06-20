export interface UserData {
  emailOrUsername: string;
  password: string;
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  message: string;
  title?: string;
  type: NotificationType;
}
export interface User {
  userId: number;
  username: string;
  firstname: string;
  lastname: string;
  avatar: string;
  email: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}
export interface Post {
  id: number;
  userId: number;
  title: string;
  description: string;
  username: string;
  firstname: string;
  lastname: string;
  avatar: string | null;
  likedByCurrentUser: boolean;
  itsMyPost: boolean;
  mediaUrls: string[];
  currentMediaIndex?: number;
  toggleOptions: boolean;
  createdAt: string;
  likeCount: number;
  commentCount: number;
}
export interface PostsPage {
  content: Post[];
  last: boolean;
}
export interface LikeResponse {
  likeCount: number;
  likedByCurrentUser: boolean;
}
export interface SuggestedUser {
  userId: number;
  username: string;
  email: string | null;
  firstname: string;
  lastname: string;
  bio: string | null;
  followingCount: number | null;
  followersCount: number | null;
  avatar: string | null;
  isFollowed?: boolean;
}
export interface FilePreview {
  url: string;
  type: 'image' | 'video';
  name: string;
}
