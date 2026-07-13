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
  FollowedByCurrentUser: boolean;
  status: boolean;
  admin: boolean;
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
  hidden: boolean;
  mediaUrls: string[];
  currentMediaIndex?: number;
  toggleOptions: boolean;
  createdAt: string;
  likeCount: number;
  commentCount: number;
}
export interface Comment {
  commentId: number;
  userId: number;
  content: string;
  username: string;
  createdAt: string;
  firstname: string;
  lastname: string;
  avatar: string;
  IsMine: boolean;
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
  isFollowed: boolean;
}
export interface FilePreview {
  url: string;
  type: 'image' | 'video';
  name: string;
}
export interface followDto {
  userId: number;
  avatar: string;
  firstname: string;
  lastname: string;
  username: string;
}
export interface NotifDto {
  notifId: number;
  postId: number;
  userId: number;
  avatar: string;
  firstname: string;
  lastname: string;
  message: string;
}
export interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalAdmins: number;
  totalReports: number;
  newUsersToday: number;
  newPostsToday: number;
  bannedUsersCount: number;
  hiddenPostsCount: number;
}

export interface UserAdmin {
  userId: number;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  bio: string | null;
  followingCount: number;
  followersCount: number;
  postsCount: number;
  avatar: string | null;
  newToken: string | null;
  followedByCurrentUser: boolean;
  status: boolean;
  admin: boolean;
}

export interface PostAdmin {
  postId: number;
  content: string;
  description: string;
  hidden: boolean;
  createdAt: string;
  userId: number;
  avatar: string | null;
  firstname: string;
  lastname: string;
}

export interface ReportAdmin {
  reportId: number;
  reason: string;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED';
  createdAt: string;
  reporterId: number;
  reporterUsername: string;
  reporterFirstname: string;
  reporterLastname: string;
  reporterAvatar: string | null;
  reportedUserId: number;
  reportedUsername: string;
  reportedFirstname: string;
  reportedLastname: string;
  reportedAvatar: string | null;
  reportedPostId: number | null;
  reportedPostTitle: string | null;
}
