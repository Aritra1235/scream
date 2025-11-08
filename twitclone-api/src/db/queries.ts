import { db } from './client'
import { user, session, account, verification, posts } from './schema'
import { eq, desc } from 'drizzle-orm'
import type { NewUser, NewSession, NewAccount, NewVerification, NewPost, User, Session, Account, Verification, Post } from './schema'
import { generateId } from '../utils/snowflake'

// User queries
export async function createUser(data: Omit<NewUser, 'id'> & { id?: bigint }): Promise<User | null> {
  const result = await db.insert(user).values({
    ...data,
    id: data.id || generateId(),
  }).returning()
  return result[0] || null
}

export async function getUserById(id: bigint): Promise<User | null> {
  const result = await db.select().from(user).where(eq(user.id, id))
  return result[0] || null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db.select().from(user).where(eq(user.email, email))
  return result[0] || null
}

export async function updateUser(id: bigint, data: Partial<NewUser>): Promise<User | null> {
  const result = await db.update(user).set(data).where(eq(user.id, id)).returning()
  return result[0] || null
}

export async function deleteUser(id: bigint): Promise<boolean> {
  await db.delete(user).where(eq(user.id, id))
  return true
}

export async function getAllUsers(): Promise<User[]> {
  return db.select().from(user)
}

// Session queries
export async function createSession(data: Omit<NewSession, 'id'> & { id?: bigint }): Promise<Session | null> {
  const result = await db.insert(session).values({
    ...data,
    id: data.id || generateId(),
  }).returning()
  return result[0] || null
}

export async function getSessionById(id: bigint): Promise<Session | null> {
  const result = await db.select().from(session).where(eq(session.id, id))
  return result[0] || null
}

export async function getSessionByToken(token: string): Promise<Session | null> {
  const result = await db.select().from(session).where(eq(session.token, token))
  return result[0] || null
}

export async function getSessionsByUserId(userId: bigint): Promise<Session[]> {
  return db.select().from(session).where(eq(session.userId, userId))
}

export async function updateSession(id: bigint, data: Partial<NewSession>): Promise<Session | null> {
  const result = await db.update(session).set(data).where(eq(session.id, id)).returning()
  return result[0] || null
}

export async function deleteSession(id: bigint): Promise<boolean> {
  await db.delete(session).where(eq(session.id, id))
  return true
}

// Account queries
export async function createAccount(data: Omit<NewAccount, 'id'> & { id?: bigint }): Promise<Account | null> {
  const result = await db.insert(account).values({
    ...data,
    id: data.id || generateId(),
  }).returning()
  return result[0] || null
}

export async function getAccountById(id: bigint): Promise<Account | null> {
  const result = await db.select().from(account).where(eq(account.id, id))
  return result[0] || null
}

export async function getAccountsByUserId(userId: bigint): Promise<Account[]> {
  return db.select().from(account).where(eq(account.userId, userId))
}

export async function updateAccount(id: bigint, data: Partial<NewAccount>): Promise<Account | null> {
  const result = await db.update(account).set(data).where(eq(account.id, id)).returning()
  return result[0] || null
}

export async function deleteAccount(id: bigint): Promise<boolean> {
  await db.delete(account).where(eq(account.id, id))
  return true
}

// Verification queries
export async function createVerification(data: Omit<NewVerification, 'id'> & { id?: bigint }): Promise<Verification | null> {
  const result = await db.insert(verification).values({
    ...data,
    id: data.id || generateId(),
  }).returning()
  return result[0] || null
}

export async function getVerificationById(id: bigint): Promise<Verification | null> {
  const result = await db.select().from(verification).where(eq(verification.id, id))
  return result[0] || null
}

export async function getVerificationByIdentifier(identifier: string): Promise<Verification | null> {
  const result = await db.select().from(verification).where(eq(verification.identifier, identifier))
  return result[0] || null
}

export async function updateVerification(id: bigint, data: Partial<NewVerification>): Promise<Verification | null> {
  const result = await db.update(verification).set(data).where(eq(verification.id, id)).returning()
  return result[0] || null
}

export async function deleteVerification(id: bigint): Promise<boolean> {
  await db.delete(verification).where(eq(verification.id, id))
  return true
}

// Post queries
export async function createPost(data: Omit<NewPost, 'id'> & { id?: bigint }): Promise<Post | null> {
  const result = await db.insert(posts).values({
    ...data,
    id: data.id || generateId(),
  }).returning()
  return result[0] || null
}

export async function getPostById(id: bigint): Promise<Post | null> {
  const result = await db.select().from(posts).where(eq(posts.id, id))
  return result[0] || null
}

export async function getPostsByUserId(userId: bigint): Promise<Post[]> {
  return db.select().from(posts).where(eq(posts.userId, userId)).orderBy(desc(posts.createdAt))
}

export async function getAllPosts(): Promise<Post[]> {
  return db.select().from(posts).orderBy(desc(posts.createdAt))
}

export async function updatePost(id: bigint, data: Partial<NewPost>): Promise<Post | null> {
  const result = await db.update(posts).set(data).where(eq(posts.id, id)).returning()
  return result[0] || null
}

export async function deletePost(id: bigint): Promise<boolean> {
  await db.delete(posts).where(eq(posts.id, id))
  return true
}

export async function getPostsWithUserInfo() {
  return db.select().from(posts).innerJoin(user, eq(posts.userId, user.id))
}

