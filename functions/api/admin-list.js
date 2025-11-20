export async function onRequest(context) {
  const { env } = context;

  try {
    const { results } = await env.DB
      .prepare(`
        SELECT
          id,
          name,
          email,
          created_at
        FROM registrations
        ORDER BY id DESC
      `)
      .all();

    // 把時間戳記轉成比較好看的字串
    const data = results.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      created_at: new Date(row.created_at).toLocaleString("zh-TW")
    }));

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "讀取名單時發生錯誤" }),
      { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}
