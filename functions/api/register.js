export async function onRequest(context) {
  const { request, env } = context;
  const TOTAL = 36;

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "POST only" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await request.json();
  const name  = (body.name  || "").trim();
  const email = (body.email || "").trim();
  const phone = (body.phone || "").trim();
  const drink = (body.drink || "").trim();   // ← ★★ 新增
  const now   = Date.now();

  // 驗證
  if (!name || !email) {
    return new Response(
      JSON.stringify({ error: "姓名和 Email 必填" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!drink) {
    return new Response(
      JSON.stringify({ error: "請選擇飲品" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 名額
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
      "INSERT INTO registrations (name, email, phone, drink, created_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(name, email, phone, drink, now).run();
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
      left,
      drink   // 可選：回傳你選的飲品
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}