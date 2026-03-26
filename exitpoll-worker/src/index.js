const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-key, apikey',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
    },
  })
}

async function supabaseFetch(env, path, options = {}) {
  const url = `${env.SUPABASE_URL}/rest/v1/${path}`

  const response = await fetch(url, {
    ...options,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  return response
}

async function readJsonSafe(response) {
  const text = await response.text()

  try {
    return text ? JSON.parse(text) : null
  } catch (e) {
    return text
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      })
    }

    if (url.pathname === '/') {
      return json({
        ok: true,
        service: 'exitpoll-worker',
        time: new Date().toISOString(),
      })
    }

    // TEST
    if (url.pathname === '/api/health' && request.method === 'GET') {
      return json({
        ok: true,
        service: 'exitpoll-worker',
        time: new Date().toISOString(),
      })
    }

    // CONFIGURAZIONE ELEZIONE
    if (url.pathname === '/api/config' && request.method === 'GET') {
      try {
        const res = await supabaseFetch(env, 'election_config?select=*&limit=1')
        const data = await readJsonSafe(res)

        if (!res.ok) {
          return json(
            {
              ok: false,
              error: 'Errore lettura configurazione',
              details: data,
            },
            500
          )
        }

        return json(data)
      } catch (error) {
        return json(
          {
            ok: false,
            error: 'Errore lettura configurazione',
            message: String(error),
          },
          500
        )
      }
    }

    // SALVA INTERVISTA - compatibilità vecchio endpoint
    if (url.pathname === '/api/interview' && request.method === 'POST') {
      try {
        const body = await request.json()

        const payload = {
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

        const res = await supabaseFetch(env, 'interviews', {
          method: 'POST',
          headers: {
            Prefer: 'return=representation',
          },
          body: JSON.stringify([payload]),
        })

        const data = await readJsonSafe(res)

        if (!res.ok) {
          return json(
            {
              ok: false,
              error: 'Errore salvataggio intervista',
              details: data,
            },
            500
          )
        }

        return json({
          ok: true,
          message: 'Intervista salvata',
          record: Array.isArray(data) ? data[0] : data,
        })
      } catch (error) {
        return json(
          {
            ok: false,
            error: 'Errore salvataggio intervista',
            message: String(error),
          },
          500
        )
      }
    }

    // SALVA INTERVISTA - endpoint usato dal tablet attuale
    if (url.pathname === '/api/exitpoll' && request.method === 'POST') {
      try {
        const body = await request.json()

        const payload = {
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

        const res = await supabaseFetch(env, 'interviews', {
          method: 'POST',
          headers: {
            Prefer: 'return=representation',
          },
          body: JSON.stringify([payload]),
        })

        const data = await readJsonSafe(res)

        if (!res.ok) {
          return json(
            {
              ok: false,
              error: 'Errore salvataggio intervista',
              details: data,
            },
            500
          )
        }

        return json({
          ok: true,
          message: 'Intervista salvata',
          record: Array.isArray(data) ? data[0] : data,
        })
      } catch (error) {
        return json(
          {
            ok: false,
            error: 'Errore salvataggio intervista',
            message: String(error),
          },
          500
        )
      }
    }

    // STATISTICHE
    if (url.pathname === '/api/stats' && request.method === 'GET') {
      try {
        const res = await supabaseFetch(env, 'interviews?select=*&limit=1000')
        const data = await readJsonSafe(res)

        if (!res.ok) {
          return json(
            {
              ok: false,
              error: 'Errore statistiche',
              details: data,
            },
            500
          )
        }

        return json({
          ok: true,
          total: Array.isArray(data) ? data.length : 0,
          data: Array.isArray(data) ? data : [],
        })
      } catch (error) {
        return json(
          {
            ok: false,
            error: 'Errore statistiche',
            message: String(error),
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
          return json(
            {
              ok: false,
              error: 'Payload mancante',
            },
            400
          )
        }

        const deactivateRes = await supabaseFetch(
          env,
          'exitpoll_publications?active=eq.true',
          {
            method: 'PATCH',
            headers: {
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({
              active: false,
            }),
          }
        )

        if (!deactivateRes.ok) {
          const deactivateData = await readJsonSafe(deactivateRes)
          return json(
            {
              ok: false,
              error: 'Errore disattivazione pubblicazioni precedenti',
              details: deactivateData,
            },
            500
          )
        }

        const insertRes = await supabaseFetch(env, 'exitpoll_publications', {
          method: 'POST',
          headers: {
            Prefer: 'return=representation',
          },
          body: JSON.stringify([
            {
              type: tipo,
              data: payload,
              active: true,
              created_at: new Date().toISOString(),
            },
          ]),
        })

        const insertData = await readJsonSafe(insertRes)

        if (!insertRes.ok) {
          return json(
            {
              ok: false,
              error: 'Errore inserimento pubblicazione',
              details: insertData,
            },
            500
          )
        }

        return json({
          ok: true,
          message: 'Pubblicazione salvata',
          record: Array.isArray(insertData) ? insertData[0] : insertData,
        })
      } catch (error) {
        return json(
          {
            ok: false,
            error: 'Errore pubblicazione snapshot',
            message: String(error),
          },
          500
        )
      }
    }

    // RISULTATO PUBBLICO
    if (url.pathname === '/api/risultati' && request.method === 'GET') {
      try {
        const res = await supabaseFetch(
          env,
          'exitpoll_publications?active=eq.true&select=*&order=created_at.desc&limit=1'
        )

        const data = await readJsonSafe(res)

        if (!res.ok) {
          return json(
            {
              ok: false,
              error: 'Errore lettura risultati',
              details: data,
            },
            500
          )
        }

        if (!Array.isArray(data) || data.length === 0) {
          return json({})
        }

        const row = data[0]
        return json(row.data || {})
      } catch (error) {
        return json(
          {
            ok: false,
            error: 'Errore lettura risultati',
            message: String(error),
          },
          500
        )
      }
    }

    return json(
      {
        ok: false,
        error: 'Endpoint non trovato',
        path: url.pathname,
      },
      404
    )
  },
}