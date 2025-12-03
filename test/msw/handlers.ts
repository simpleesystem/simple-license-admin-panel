import { http, HttpResponse } from 'msw'
import {
  API_ENDPOINT_ADMIN_USERS_ME,
  API_ENDPOINT_AUTH_LOGIN,
} from '@simple-license/react-sdk'

import { AUTH_FIELD_USERNAME } from '../../src/app/constants'
import { buildUser } from '../factories/userFactory'

const MSW_FAKE_TOKEN = 'test-token' as const
const MSW_LOGIN_EXPIRATION_SECONDS = 3_600 as const

export const handlers = [
  http.post(API_ENDPOINT_AUTH_LOGIN, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>
    const username = body[AUTH_FIELD_USERNAME]

    return HttpResponse.json(
      {
        token: MSW_FAKE_TOKEN,
        token_type: 'Bearer',
        expires_in: MSW_LOGIN_EXPIRATION_SECONDS,
        user: buildUser({ username }),
      },
      { status: 200 },
    )
  }),
  http.get(API_ENDPOINT_ADMIN_USERS_ME, () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          user: buildUser(),
        },
      },
      { status: 200 },
    )
  }),
  http.options(API_ENDPOINT_ADMIN_USERS_ME, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
]

