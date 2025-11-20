export async function onRequest(context) {
  const { env } = context;

  const { results } = await env.DB
    .prepare(`
      SELECT id, name, email, created_at
      FROM registrations
      ORDER BY id DESC
    `)
    .all();

  const data = results.map(row => ({
    id: row.id,
    name: row.name,
    email: row.email,
    created_at: new Date(row.created_at).toLocaleString("zh-TW")
  }));

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}