export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "POST only" }),
      { status: 405, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }

  try {
    const body = await request.json();
    const id = Number(body.id);

    if (!id) {
      return new Response(
        JSON.stringify({ error: "缺少 id" }),
        { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    await env.DB.prepare("DELETE FROM registrations WHERE id = ?")
      .bind(id)
      .run();

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ success: false, error: "刪除時發生錯誤" }),
      { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}