export async function onRequest(context) {
  const { env } = context;

  const TOTAL = 50;

  try {
    const { results } = await env.DB
      .prepare('SELECT COUNT(*) AS used FROM registrations')
      .all();

    const used = results[0]?.used || 0;
    const left = Math.max(TOTAL - used, 0);

    return new Response(
      JSON.stringify({ total: TOTAL, used, left }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "取得名額失敗" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
