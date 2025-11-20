export async function onRequest(context) {
  const { request, env } = context;
  const TOTAL = 50;

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "POST only" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await request.json();
  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const now = Date.now();

  if (!name || !email) {
    return new Response(
      JSON.stringify({ error: "姓名和 Email 必填" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const countRes = await env.DB.prepare(
    "SELECT COUNT(*) AS used FROM registrations"
  ).all();
  const used = countRes.results[0].used;

  if (used >= TOTAL) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "名額已滿",
        total: TOTAL,
        used,
        left: 0
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    await env.DB.prepare(
      "INSERT INTO registrations (name, email, created_at) VALUES (?, ?, ?)"
    ).bind(name, email, now).run();
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: "Email 已存在" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const afterRes = await env.DB.prepare(
    "SELECT COUNT(*) AS used FROM registrations"
  ).all();
  const newUsed = afterRes.results[0].used;
  const left = TOTAL - newUsed;

  return new Response(
    JSON.stringify({
      success: true,
      message: "報名成功",
      total: TOTAL,
      used: newUsed,
      left
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
