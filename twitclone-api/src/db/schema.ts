import { pgTable, text, timestamp, index, boolean, bigint, integer, pgEnum, primaryKey } from 'drizzle-orm/pg-core'
import { config } from '../config/index'

if (!config.cdn.defaultAvatar || !config.cdn.defaultBanner) {
    throw new Error('CDN_BASE_URL or DEFAULT_AVATAR_OBJECT or DEFAULT_BANNER_OBJECT is not set');
}
const defaultAvatarUrl = config.cdn.defaultAvatar;
const defaultBannerUrl = config.cdn.defaultBanner;

export const user = pgTable(
  'user',
  {
    id: bigint("id", { mode: "bigint" }).primaryKey(),    
    username: text('username').unique(),
    display_name: text('display_name'),
    bio: text('bio'),
    avatar_url: text('avatar_url').default(defaultAvatarUrl),
    banner_url: text('banner_url').default(defaultBannerUrl),
    verified: boolean('verified').notNull().default(false),
    name: text('name'),
    email: text('email').notNull().unique(),
    emailVerified: boolean('emailVerified').notNull().default(false),
    image: text('image'),
    onboarded: boolean('onboarded').notNull().default(false),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => {
    return {
      emailIdx: index('user_email_idx').on(table.email),
    }
  }
)

export const session = pgTable(
  'session',
  {
    id: bigint('id', { mode: 'bigint' }).primaryKey(),
    userId: bigint('userId', { mode: 'bigint' })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expiresAt').notNull(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
  },
  (table) => {
    return {
      userIdIdx: index('session_user_id_idx').on(table.userId),
      tokenIdx: index('session_token_idx').on(table.token),
    }
  }
)

export const account = pgTable(
  'account',
  {
    id: bigint('id', { mode: 'bigint' }).primaryKey(),
    userId: bigint('userId', { mode: 'bigint' })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    idToken: text('idToken'),
    password: text('password'),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
  },
  (table) => {
    return {
      userIdIdx: index('account_user_id_idx').on(table.userId),
      providerIdx: index('account_provider_idx').on(table.providerId),
    }
  }
)

export const verification = pgTable(
  'verification',
  {
    id: bigint('id', { mode: 'bigint' }).primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
  },
  (table) => {
    return {
      identifierIdx: index('verification_identifier_idx').on(table.identifier),
    }
  }
)

export const visibility = pgEnum('visibility', ['public', 'followers', 'private'])

export const posts = pgTable(
  'posts',  
  {
    id: bigint('id', { mode: 'bigint' }).primaryKey(),
    userId: bigint('userId', { mode: 'bigint' })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    parentId: bigint('parentId', { mode: 'bigint' })
      .references(() => posts.id, { onDelete: 'set null' }),
    repostOf: bigint('repostOf', { mode: 'bigint' })
      .references(() => posts.id, { onDelete: 'set null' }),
    mediaCount: integer('mediaCount').notNull().default(0),
    visibility: visibility('visibility').notNull().default('public'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => {
    return {
      userIdIdx: index('posts_user_id_idx').on(table.userId),
      createdAtIdx: index('posts_created_at_idx').on(table.createdAt),
      parentIdIdx: index('posts_parent_id_idx').on(table.parentId),
      repostOfIdx: index('posts_repost_of_idx').on(table.repostOf),
    }
  }
) as any

export const targetType = pgEnum('targetType', ['post', 'user', 'group'])

export const mediaType = pgEnum('mediaType', ['image', 'video', 'gif'])

export const media = pgTable(
  'media',
  {
    id: bigint('id', { mode: 'bigint' }).primaryKey(),

    // polymorphic reference
    targetType: targetType('targetType').notNull(),
    targetId: bigint('targetId', { mode: 'bigint' }).notNull(),

    mediaUrl: text('mediaUrl').notNull(),
    type: mediaType('type').notNull(),

    width: integer('width'),
    height: integer('height'),

    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => {
    return {
      // queries like: get all media for a post/user/group
      targetIdx: index('media_target_idx').on(table.targetType, table.targetId),

      // queries like: find all media of a type (e.g. all gifs)
      typeIdx: index('media_type_idx').on(table.type),

      // timestamp-based queries, for ordering
      createdAtIdx: index('media_created_at_idx').on(table.createdAt),
    }
  }
)


export type Media = typeof media.$inferSelect
export type NewMedia = typeof media.$inferInsert

export const likes = pgTable(
  'likes',
  {
    userId: bigint('userId', { mode: 'bigint' })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    postId: bigint('postId', { mode: 'bigint' })
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.postId] }),
      userIdIdx: index('likes_user_id_idx').on(table.userId),
      postIdIdx: index('likes_post_id_idx').on(table.postId),
    }
  }
)

export type Like = typeof likes.$inferSelect
export type NewLike = typeof likes.$inferInsert

export const follows = pgTable(
  'follows',
  {
    followerId: bigint('followerId', { mode: 'bigint' })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    followingId: bigint('followingId', { mode: 'bigint' })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.followerId, table.followingId] }),
      followerIdIdx: index('follows_follower_id_idx').on(table.followerId),
      followingIdIdx: index('follows_following_id_idx').on(table.followingId),
    }
  }
)

export type Follow = typeof follows.$inferSelect
export type NewFollow = typeof follows.$inferInsert

export type User = typeof user.$inferSelect
export type NewUser = typeof user.$inferInsert

export type Session = typeof session.$inferSelect
export type NewSession = typeof session.$inferInsert

export type Account = typeof account.$inferSelect
export type NewAccount = typeof account.$inferInsert

export type Verification = typeof verification.$inferSelect
export type NewVerification = typeof verification.$inferInsert

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert

