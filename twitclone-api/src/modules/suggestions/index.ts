import Elysia from 'elysia'
import { apiPrefix } from '../../utils/const'
import { auth } from '../../utils/auth'
import { getFollowSuggestions } from './services'
import * as v from 'valibot'

const limitQuerySchema = v.object({ limit: v.optional(v.string()) })

const suggestions = new Elysia({ name: 'suggestions', prefix: apiPrefix })

    // ── GET /suggestions/users ────────────────────────────────────────────────
    // Returns a ranked list of "who to follow" using the Neo4j social graph
    // (friends-of-friends), falling back to popular users from PostgreSQL.
    .get('/suggestions/users', async ({ request: { headers }, status, query }) => {
        const session = await auth.api.getSession({ headers })
        if (!session) return status(401, { message: 'Unauthorized' })
        if (!session.user.emailVerified) return status(403, { message: 'Email not verified' })

        const limit = Math.min(Number(query.limit) || 10, 50)

        try {
            const users = await getFollowSuggestions(session.user.id, limit)
            return { suggestions: users }
        } catch (err) {
            console.error('Suggestions error:', err)
            return status(500, { message: 'Failed to load suggestions' })
        }
    }, {
        query: limitQuerySchema,
    })

export { suggestions }
