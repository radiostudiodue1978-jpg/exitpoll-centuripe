export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(),
      })
    }

    if (url.pathname === '/') {
      return jsonResponse({
        ok: true,
        service: 'exitpoll-worker',
      })
    }

    // SALVATAGGIO INTERVISTA DA TABLET
    if (url.pathname === '/api/exitpoll' && request.method === 'POST') {
      try {
        const body = await request.json()

        const interviewPayload = {
          tablet: body.tablet || null,
          eta: body.eta || null,
          sesso: body.sesso || null,
          titolo_studio: body.titolo_studio || null,
          sindaco: body.sindaco || null,
          lista: body.lista || null,
          consigliere1: body.consigliere1 || 'Nessuno',
          consigliere2: body.consigliere2 || 'Nessuno',
          created_at: new Date().toISOString(),
        }

        const insertRes = await fetch(
          `${env.SUPABASE_URL}/rest/v1/interviews`,
          {
            method: 'POST',
            headers: supabaseHeaders(env, {
              Prefer: 'return=representation',
            }),
            body: JSON.stringify([interviewPayload]),
          }
        )

        const insertText = await insertRes.text()
        let insertData = null

        try {
          insertData = insertText ? JSON.parse(insertText) : null
        } catch (e) {
          insertData = insertText
        }

        if (!insertRes.ok) {
          return jsonResponse(
            {
              ok: false,
              error: 'Errore inserimento intervista',
              details: insertData,
            },
            500
          )
        }

        return jsonResponse({
          ok: true,
          message: 'Intervista salvata',
          record: Array.isArray(insertData) ? insertData[0] : insertData,
        })
      } catch (err) {
        return jsonResponse(
          {
            ok: false,
            error: 'Eccezione worker su /api/exitpoll',
            message: String(err),
          },
          500
        )
      }
    }

    // PUBBLICAZIONE EXIT POLL DA ADMIN
    if (url.pathname === '/api/pubblica' && request.method === 'POST') {
      try {
        const body = await request.json()
        const tipo = body?.tipo
        const payload = body?.payload || body?.dati

        if (!tipo || !payload) {
          return jsonResponse(
            {
              ok: false,
              error: 'Payload mancante',
            },
            400
          )
        }

        const deactivateRes = await fetch(
          `${env.SUPABASE_URL}/rest/v1/exitpoll_publications?active=eq.true`,
          {
            method: 'PATCH',
            headers: supabaseHeaders(env, {
              Prefer: 'return=minimal',
            }),
            body: JSON.stringify({
              active: false,
            }),
          }
        )

        if (!deactivateRes.ok) {
          const text = await deactivateRes.text()
          return jsonResponse(
            {
              ok: false,
              error: 'Errore disattivazione pubblicazioni precedenti',
              details: text,
            },
            500
          )
        }

        const insertRes = await fetch(
          `${env.SUPABASE_URL}/rest/v1/exitpoll_publications`,
          {
            method: 'POST',
            headers: supabaseHeaders(env, {
              Prefer: 'return=representation',
            }),
            body: JSON.stringify([
              {
                type: tipo,
                data: payload,
                active: true,
                created_at: new Date().toISOString(),
              },
            ]),
          }
        )

        const insertText = await insertRes.text()
        let insertData = null

        try {
          insertData = insertText ? JSON.parse(insertText) : null
        } catch (e) {
          insertData = insertText
        }

        if (!insertRes.ok) {
          return jsonResponse(
            {
              ok: false,
              error: 'Errore inserimento pubblicazione',
              details: insertData,
            },
            500
          )
        }

        return jsonResponse({
          ok: true,
          message: 'Pubblicazione salvata',
          record: Array.isArray(insertData) ? insertData[0] : insertData,
        })
      } catch (err) {
        return jsonResponse(
          {
            ok: false,
            error: 'Eccezione worker su /api/pubblica',
            message: String(err),
          },
          500
        )
      }
    }

    // LETTURA ULTIMA PUBBLICAZIONE
    if (url.pathname === '/api/risultati' && request.method === 'GET') {
      try {
        const res = await fetch(
          `${env.SUPABASE_URL}/rest/v1/exitpoll_publications?active=eq.true&select=*&order=created_at.desc&limit=1`,
          {
            method: 'GET',
            headers: supabaseHeaders(env),
          }
        )

        const text = await res.text()
        let data = null

        try {
          data = text ? JSON.parse(text) : []
        } catch (e) {
          data = []
        }

        if (!res.ok) {
          return jsonResponse(
            {
              ok: false,
              error: 'Errore lettura risultati',
              details: data,
            },
            500
          )
        }

        if (!Array.isArray(data) || data.length === 0) {
          return jsonResponse({})
        }

        const row = data[0]
        return jsonResponse(row.data || {})
      } catch (err) {
        return jsonResponse(
          {
            ok: false,
            error: 'Eccezione worker su /api/risultati',
            message: String(err),
          },
          500
        )
      }
    }

    return jsonResponse(
      {
        ok: false,
        error: 'Not found',
      },
      404
    )
  },
}

function supabaseHeaders(env, extra = {}) {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
    },
  })
}