import Elysia from 'elysia'
import { apiPrefix } from '../../utils/const'
import { auth } from '../../utils/auth'
import { getUserIdByUsername } from '../common'
import {
    followUser,
    unfollowUser,
    isFollowing,
    getFollowers,
    getFollowing,
    getMutualFollowers,
} from './services'
import * as v from 'valibot'

const usernameBodySchema = v.object({ username: v.pipe(v.string(), v.minLength(1)) })
const usernameParamSchema = v.object({ username: v.string() })
const paginatedParamSchema = v.object({ username: v.string() })
const paginatedQuerySchema = v.object({
    limit: v.optional(v.string()),
    offset: v.optional(v.string()),
})
const limitQuerySchema = v.object({ limit: v.optional(v.string()) })

const follow = new Elysia({ name: 'follow', prefix: apiPrefix })

    // ── POST /follow/follow ───────────────────────────────────────────────────
    .post('/follow/follow', async ({ request: { headers }, status, body }) => {
        const session = await auth.api.getSession({ headers })
        if (!session) return status(401, { message: 'Unauthorized' })
        if (!session.user.emailVerified) return status(403, { message: 'Email not verified' })

        const targetId = await getUserIdByUsername(body.username)
        if (!targetId) return status(404, { message: 'User not found' })

        try {
            await followUser(BigInt(session.user.id), targetId)
            return { message: 'Followed successfully' }
        } catch (err: any) {
            if (err.message === 'Cannot follow yourself') return status(400, { message: err.message })
            if (err.code === '23505') return status(409, { message: 'Already following' })
            console.error('Follow error:', err)
            return status(500, { message: 'Failed to follow user' })
        }
    }, {
        body: usernameBodySchema,
    })

    // ── POST /follow/unfollow ─────────────────────────────────────────────────
    .post('/follow/unfollow', async ({ request: { headers }, status, body }) => {
        const session = await auth.api.getSession({ headers })
        if (!session) return status(401, { message: 'Unauthorized' })
        if (!session.user.emailVerified) return status(403, { message: 'Email not verified' })

        const targetId = await getUserIdByUsername(body.username)
        if (!targetId) return status(404, { message: 'User not found' })

        try {
            await unfollowUser(BigInt(session.user.id), targetId)
            return { message: 'Unfollowed successfully' }
        } catch (err: any) {
            if (err.message === 'Follow relationship not found') return status(404, { message: err.message })
            console.error('Unfollow error:', err)
            return status(500, { message: 'Failed to unfollow user' })
        }
    }, {
        body: usernameBodySchema,
    })

    // ── GET /follow/check/:username ───────────────────────────────────────────
    .get('/follow/check/:username', async ({ request: { headers }, status, params }) => {
        const session = await auth.api.getSession({ headers })
        if (!session) return status(401, { message: 'Unauthorized' })

        const targetId = await getUserIdByUsername(params.username)
        if (!targetId) return status(404, { message: 'User not found' })

        const following = await isFollowing(BigInt(session.user.id), targetId)
        return { following }
    }, {
        params: usernameParamSchema,
    })

    // ── GET /follow/followers/:username ───────────────────────────────────────
    .get('/follow/followers/:username', async ({ params, query, status }) => {
        const targetId = await getUserIdByUsername(params.username)
        if (!targetId) return status(404, { message: 'User not found' })

        const limit = Math.min(Number(query.limit) || 20, 100)
        const offset = Number(query.offset) || 0
        const followers = await getFollowers(targetId, limit, offset)
        return { followers }
    }, {
        params: paginatedParamSchema,
        query: paginatedQuerySchema,
    })

    // ── GET /follow/following/:username ───────────────────────────────────────
    .get('/follow/following/:username', async ({ params, query, status }) => {
        const targetId = await getUserIdByUsername(params.username)
        if (!targetId) return status(404, { message: 'User not found' })

        const limit = Math.min(Number(query.limit) || 20, 100)
        const offset = Number(query.offset) || 0
        const following = await getFollowing(targetId, limit, offset)
        return { following }
    }, {
        params: paginatedParamSchema,
        query: paginatedQuerySchema,
    })

    // ── GET /follow/mutual/:username ──────────────────────────────────────────
    // Returns users that both the current user and the target user follow (Neo4j).
    .get('/follow/mutual/:username', async ({ request: { headers }, params, query, status }) => {
        const session = await auth.api.getSession({ headers })
        if (!session) return status(401, { message: 'Unauthorized' })

        const targetId = await getUserIdByUsername(params.username)
        if (!targetId) return status(404, { message: 'User not found' })

        const limit = Math.min(Number(query.limit) || 20, 100)
        const mutual = await getMutualFollowers(
            session.user.id,
            targetId.toString(),
            limit
        )
        return { mutual }
    }, {
        params: usernameParamSchema,
        query: limitQuerySchema,
    })

export { follow }
