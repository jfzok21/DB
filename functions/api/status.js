export async function onRequest(context) {
  const { env } = context;

  const TOTAL = 36;

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

const { results } = await env.DB
  .prepare(`
    SELECT 
      COUNT(*) AS used,
      SUM(CASE WHEN drink = 'coffee' THEN 1 ELSE 0 END) AS coffee,
      SUM(CASE WHEN drink = 'tea'    THEN 1 ELSE 0 END) AS tea,
      SUM(CASE WHEN drink = 'milk'   THEN 1 ELSE 0 END) AS milk
    FROM registrations
  `)
  .all();

const row = results[0] || {};
const used = row.used || 0;
const left = Math.max(TOTAL - used, 0);

return new Response(
  JSON.stringify({
    total: TOTAL,
    used,
    left,
    drinks: {
      coffee: row.coffee || 0,
      tea: row.tea || 0,
      milk: row.milk || 0
    }
  }),
  { headers: { "Content-Type": "application/json" } }
);
