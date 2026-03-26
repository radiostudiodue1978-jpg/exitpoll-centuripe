const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-key',
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
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  return response
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

    // TEST
    if (url.pathname === '/api/health') {
      return json({
        ok: true,
        service: 'exitpoll-worker',
        time: new Date().toISOString(),
      })
    }

    // CONFIGURAZIONE ELEZIONE
    if (url.pathname === '/api/config' && request.method === 'GET') {
      try {
        const res = await supabaseFetch(
          env,
          'election_config?select=*&limit=1'
        )

        const text = await res.text()

        return new Response(text, {
          status: res.status,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...corsHeaders,
          },
        })
      } catch (error) {
        return json(
          {
            ok: false,
            error: 'Errore lettura configurazione',
          },
          500
        )
      }
    }

    // SALVA INTERVISTA
    if (url.pathname === '/api/interview' && request.method === 'POST') {
      try {
        const body = await request.json()

        const res = await supabaseFetch(env, 'interviews', {
          method: 'POST',
          body: JSON.stringify(body),
        })

        const text = await res.text()

        return new Response(text, {
          status: res.status,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...corsHeaders,
          },
        })
      } catch (error) {
        return json(
          {
            ok: false,
            error: 'Errore salvataggio intervista',
          },
          500
        )
      }
    }

    // STATISTICHE
    if (url.pathname === '/api/stats' && request.method === 'GET') {
      try {
        const res = await supabaseFetch(
          env,
          'interviews?select=*&limit=1000'
        )

        const data = await res.json()

        return json({
          ok: true,
          total: data.length,
          data: data,
        })
      } catch (error) {
        return json(
          {
            ok: false,
            error: 'Errore statistiche',
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