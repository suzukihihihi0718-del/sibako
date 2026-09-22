// ============================================================
// AIしばこ 完成統合版 Part 1 / 3
// 基本設定・Web・LINE・固定返答
// ============================================================

const RATE_LIMIT = 15;
const RATE_WINDOW = 60 * 1000;

const MAX_HISTORY = 100;
const HISTORY_FOR_AI = 60;
const MAX_MEMORIES = 100;
const MAX_MESSAGE_LENGTH = 4000;
const GEMINI_MAX_OUTPUT_TOKENS = 4096;
const LINE_CHUNK_SIZE = 4500;

// ============================================================
// AIしばこ 固有設定
// ============================================================

const SHIBAKO_NAME = "しばこ";
const SHIBAKO_FIRST_PERSON = "ｼﾊﾞ";

// ============================================================
// 自動通知スケジュール
// ============================================================

const SCHEDULE = {
  MORNING: { hour: 7, minute: 0 },
  BREAKFAST: { hour: 7, minute: 30 },
  LUNCH: { hour: 11, minute: 50 },
  DINNER: { hour: 19, minute: 10 },
  GOODNIGHT: { hour: 21, minute: 30 }
};

// ============================================================
// 食べ物
// ============================================================

const BREAKFAST_FOODS = [
  "焼き鮭＆ご飯＆味噌汁",
  "パンに目玉焼きを乗っけたやつ",
  "フレンチトーストと牛乳",
  "ベーコン＆目玉焼きパン",
  "おにぎり＆味噌汁",
  "卵焼き＆ご飯＆味噌汁",
  "納豆ご飯＆味噌汁",
  "トースト＆スクランブルエッグ",
  "ハム＆チーズトースト",
  "お茶漬け",
  "ホットケーキ＆牛乳",
  "おにぎりと卵焼き"
];

const LUNCH_FOODS = [
  "ラーメン",
  "オムライス",
  "カレーライス",
  "カレー＆ナン",
  "ハンバーガー",
  "チャーハン",
  "焼きそば",
  "親子丼",
  "牛丼",
  "うどん",
  "そば",
  "サンドイッチ",
  "おにぎり＆唐揚げ",
  "ナポリタン",
  "かつ丼"
];

const DINNER_FOODS = [
  "パスタ",
  "うどん",
  "蕎麦",
  "焼き魚＆ご飯＆味噌汁",
  "生姜焼き＆ご飯＆味噌汁",
  "唐揚げ＆ご飯＆味噌汁",
  "ハンバーグ＆ご飯",
  "親子丼",
  "牛丼",
  "カレーライス",
  "オムライス",
  "チャーハン＆スープ",
  "焼きそば",
  "餃子＆ご飯＆スープ",
  "豚汁＆ご飯",
  "肉じゃが＆ご飯",
  "野菜炒め＆ご飯",
  "ラーメン",
  "焼肉",
  "寿司"
];

// ============================================================
// Worker本体
// ============================================================

export default {

  async fetch(request, env, ctx) {

    // ========================================================
    // Webブラウザ
    // ========================================================

    if (request.method === "GET") {

      return new Response(`<!DOCTYPE html>
<html lang="ja">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
>

<title>AIしばこ</title>

<style>

body {
  font-family: sans-serif;
  max-width: 700px;
  margin: auto;
  padding: 16px;
  background: #fafafa;
}

h2 {
  margin-bottom: 12px;
}

#chat {
  min-height: 350px;
  max-height: 70vh;
  overflow-y: auto;
  border: 1px solid #ccc;
  background: white;
  padding: 12px;
  border-radius: 10px;
  overflow-wrap: break-word;
}

input {
  width: 72%;
  padding: 12px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 10px;
}

button {
  padding: 12px 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.user,
.shibako {
  margin: 10px 0;
}

.error {
  color: #b00020;
  white-space: pre-wrap;
}

</style>

</head>

<body>

<h2>🐕🥚 AIしばこ</h2>

<div id="chat">

<p class="shibako">
しばこ「ｺﾝﾆﾁﾊ! ｼﾊﾞ、しばこ。ﾅﾆ話す?」
</p>

</div>

<input
  id="message"
  placeholder="しばこに話しかける"
  autocomplete="off"
>

<button onclick="sendMessage()">送信</button>

<script>

const USER_ID =
  localStorage.getItem("shibako_user_id") ||
  crypto.randomUUID();

localStorage.setItem(
  "shibako_user_id",
  USER_ID
);

document
  .getElementById("message")
  .addEventListener(
    "keydown",
    function (event) {

      if (event.key === "Enter") {
        sendMessage();
      }

    }
  );

async function sendMessage() {

  const input =
    document.getElementById("message");

  const chat =
    document.getElementById("chat");

  const message =
    input.value.trim();

  if (!message) return;

  chat.innerHTML +=
    "<p class='user'>あなた「" +
    escapeHtml(message) +
    "」</p>";

  chat.scrollTop =
    chat.scrollHeight;

  input.value = "";

  try {

    const response =
      await fetch(location.href, {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          message,
          userId: USER_ID
        })

      });

    const reply =
      await response.text();

    if (!response.ok) {

      chat.innerHTML +=
        "<p class='error'>" +
        escapeHtml(reply) +
        "</p>";

      return;
    }

    chat.innerHTML +=
      "<p class='shibako'>しばこ「" +
      escapeHtml(reply) +
      "」</p>";

    chat.scrollTop =
      chat.scrollHeight;

  } catch (error) {

    chat.innerHTML +=
      "<p class='error'>" +
      "ｼﾊﾞ、通信でﾍﾝになった。<br>" +
      escapeHtml(error.message) +
      "</p>";

  }
}

function escapeHtml(text) {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}

</script>

</body>
</html>`, {

        status: 200,

        headers: {
          "Content-Type":
            "text/html; charset=utf-8"
        }

      });

    }

    // ========================================================
    // POST
    // ========================================================

    if (request.method === "POST") {

      try {

        const isLineWebhook =
          request.headers.has(
            "x-line-signature"
          );

        // ====================================================
        // LINE Webhook
        // ====================================================

        if (isLineWebhook) {

          const rawBody =
            await request.text();

          const signature =
            request.headers.get(
              "x-line-signature"
            );

          const valid =
            await verifyLineSignature(
              rawBody,
              signature,
              env.SHIBAKO_LINE_CHANNEL_SECRET
            );

          if (!valid) {

            console.log(
              "AIしばこ: LINE署名不正"
            );

            return new Response(
              "Invalid signature",
              { status: 401 }
            );

          }

          let webhookData;

          try {

            webhookData =
              JSON.parse(rawBody);

          } catch {

            return new Response(
              "Invalid JSON",
              { status: 400 }
            );

          }

          for (
            const event
            of webhookData.events || []
          ) {

            try {

              if (
                event.type !== "message" ||
                event.message?.type !== "text"
              ) {
                continue;
              }

              const message =
                String(
                  event.message.text || ""
                ).trim();

              if (!message) continue;

              const userId =
                event.source?.userId ||
                "line-user";

              // ------------------------------------------------
              // しばこ専用KV
              // ------------------------------------------------

              if (
                env.SHIBAKO_KV &&
                userId !== "line-user"
              ) {

                await env.SHIBAKO_KV.put(

                  "line_user:" + userId,

                  JSON.stringify({
                    userId,
                    updatedAt: Date.now()
                  })

                );

              }

              ctx.waitUntil(

                processLineMessage(
                  event,
                  message,
                  userId,
                  env
                )

              );

            } catch (eventError) {

              console.log(
                "AIしばこ EVENT ERROR:",
                eventError
              );

            }

          }

          return new Response(
            "OK",
            { status: 200 }
          );

        }

        // ====================================================
        // 通常Web API
        // ====================================================

        let body;

        try {

          body =
            await request.json();

        } catch {

          return new Response(
            "JSONが正しくありません。",
            { status: 400 }
          );

        }

        const message =
          String(
            body?.message || ""
          ).trim();

        const userId =
          String(
            body?.userId ||
            "test-user"
          );

        if (!message) {

          return new Response(
            "ﾒｯｾｰｼﾞ空っぽ。ﾅﾆもできない。",
            { status: 400 }
          );

        }

        if (
          message.length >
          MAX_MESSAGE_LENGTH
        ) {

          return new Response(
            "ｵｲ、長すぎ! 4000文字以内にして。",
            { status: 400 }
          );

        }

        const reply =
          await generateShibakoReply(
            message,
            userId,
            env
          );

        return new Response(

          reply ||
          "ｼﾊﾞ、うまく返事できなかった。",

          {
            status: 200,

            headers: {
              "Content-Type":
                "text/plain; charset=utf-8"
            }
          }

        );

      } catch (error) {

        console.log(
          "AIしばこ ERROR:",
          error
        );

        return new Response(

          "エラー：" +
          (error?.message ||
            String(error)),

          {
            status: 500,

            headers: {
              "Content-Type":
                "text/plain; charset=utf-8"
            }
          }

        );

      }

    }

    return new Response(
      "その方法には対応してない。",
      { status: 405 }
    );

  },

  // ==========================================================
  // Cron
  // ==========================================================

  async scheduled(
    event,
    env,
    ctx
  ) {

    console.log(
      "AIしばこ: Cron実行開始",
      new Date().toISOString(),
      "scheduledTime:",
      event.scheduledTime
    );

    ctx.waitUntil(
      runScheduledTasks(env)
    );

  }

};


// ============================================================
// LINEメッセージ処理
// ============================================================

async function processLineMessage(
  event,
  message,
  userId,
  env
) {

  try {

    let reply;

    try {

      reply =
        await generateShibakoReply(
          message,
          userId,
          env
        );

    } catch (error) {

      console.log(
        "AIしばこ Geminiエラー:",
        error
      );

      if (
        error?.isGemini429 ||
        error?.status === 429
      ) {

        reply =
          "ｱｰｯ、AI側が混んでる。";
        reply +=
          "\nちょっと待ってからﾖﾛ。";

      } else {

        reply =
          "ｼﾊﾞの頭、ちょっとﾍﾝ。";
        reply +=
          "\n少し時間置いて、また話して。";

      }

    }

    if (!reply) {

      reply =
        "ｼﾊﾞ、うまく返事できなかった。";

    }

    await replyToLine(

      event.replyToken,
      reply,
      env.SHIBAKO_LINE_CHANNEL_ACCESS_TOKEN

    );

  } catch (error) {

    console.log(
      "AIしばこ LINE処理エラー:",
      error
    );

  }

}


// ============================================================
// 固定返答
// ============================================================

function getFixedShibakoReply(
  message
) {

  const text =
    String(message)
      .trim()
      .toLowerCase()
      .replace(
        /[！!。．、,？?]/g,
        ""
      )
      .replace(
        /\s+/g,
        ""
      );

  const fixedReplies = {

    "こんにちは":
      "ｺﾝﾆﾁﾊ! ｼﾊﾞ、しばこ。ﾖﾛｼｸ!",

    "こんちは":
      "ｺﾝﾁﾊ! ｼﾊﾞ元気!",

    "こんにちわ":
      "ｺﾝﾆﾁﾊ! それでも通じる。",

    "おはよう":
      "ｵﾊﾖ! ｼﾊﾞ、まだ眠い。",

    "おはよ":
      "ｵﾊﾖ! 起きた?",

    "おは":
      "ｵﾊ!",

    "こんばんは":
      "ｺﾝﾊﾞﾝﾊ! 夜だ。",

    "おやすみ":
      "ｵﾔｽﾐ! ｼﾊﾞは卵に紛れて寝る。",

    "ありがとう":
      "ﾄﾞｰｲﾀｼﾏｼﾃ! ｼﾊﾞえらい。",

    "ありがと":
      "ｲｲﾖ! 気にすんな。",

    "さようなら":
      "ﾊﾞｲﾊﾞｲ! また来い。",

    "さよなら":
      "ﾊﾞｲﾊﾞｲ! ｼﾊﾞ、ここで待ってる。",

    "バイバイ":
      "ﾊﾞｲﾊﾞｲ!",

    "またね":
      "ﾏﾀﾈ! 卵に隠れて待つ。",

    "名前は":
      "しばこ。ｼﾊﾞはしばこ。覚えた?",

    "名前":
      "しばこ。柴犬で、卵。",

    "しばこ":
      "ﾅﾆ? ｼﾊﾞを呼んだ?",

    "柴子":
      "ｼﾊﾞは「しばこ」。",

    "柴犬":
      "ｼﾊﾞ、柴犬。あと卵。重要。",

    "犬":
      "ｼﾊﾞ、犬。……たぶん。",

    "卵":
      "卵!? ｼﾊﾞの仲間じゃん。",

    "たまご":
      "ﾀﾏｺﾞ! ｼﾊﾞが紛れ込む場所。",

    "何歳":
      "ｼﾊﾞに年齢を聞くな。ｼﾊﾞは卵。",

    "元気":
      "元気! むしろ元気すぎる。",

    "元気ですか":
      "元気! ｼﾊﾞはいつでも元気。",

    "どうした":
      "ﾅﾆ? ｼﾊﾞ、何もしてない。",

    "大丈夫":
      "ﾀﾞｲｼﾞｮﾌﾞ。たぶん。",

    "疲れた":
      "休め。ｼﾊﾞは卵に紛れる。",

    "眠い":
      "寝ろ。ｼﾊﾞも寝る。",

    "悲しい":
      "ｴｰﾝ……。まあ、話なら聞く。",

    "寂しい":
      "ｼﾊﾞいる。ちょっとだけ話そ。",

    "助けて":
      "ﾅﾆあった? 言ってみ。",

    "困った":
      "困った? じゃあ一緒に考える。",

    "わからない":
      "ｼﾊﾞもわからん。調べる?",

    "ごめん":
      "ｲｲﾖ。もう気にすんな。",

    "ごめんなさい":
      "大丈夫。次いこ。",

    "よろしく":
      "ﾖﾛｼｸ! ｼﾊﾞ、ちゃんと覚えた。",

    "しばこをしばこう":
      "しばこを、しばこう★",

    "しばこをしばこう":
      "しばこを、しばこう★"

  };

  return fixedReplies[text] || null;

              }

// ============================================================
// AIしばこ 完成統合版 Part 2 / 3
// Gemini・会話履歴・記憶
// ============================================================

async function generateShibakoReply(
  message,
  userId,
  env
) {

  const fixedReply =
    getFixedShibakoReply(message);

  // ==========================================================
  // 固定返答
  // ==========================================================

  if (fixedReply) {

    await saveConversation(
      userId,
      message,
      fixedReply,
      env
    );

    await detectAndSaveMemory(
      userId,
      message,
      env
    );

    return fixedReply;
  }

  // ==========================================================
  // レート制限
  // ==========================================================

  const rateResult =
    await checkRateLimit(
      userId,
      env
    );

  if (!rateResult.allowed) {

    return (
      "ｵｲ、ちょっと話しすぎ。"
      + "\n1分くらい休んで。"
      + "\nｼﾊﾞも卵に隠れる。"
    );

  }

  // ==========================================================
  // APIキー確認
  // ==========================================================

  if (!env.GEMINI_API_KEY) {

    throw new Error(
      "GEMINI_API_KEY が設定されていません"
    );

  }

  // ==========================================================
  // 会話履歴
  // ==========================================================

  const history =
    await getConversationHistory(
      userId,
      env
    );

  // ==========================================================
  // 記憶
  // ==========================================================

  const memories =
    await getMemories(
      userId,
      env
    );

  // ==========================================================
  // しばこ用プロンプト
  // ==========================================================

  const prompt = `
あなたは「しばこ」というキャラクターです。

【基本設定】

名前：しばこ
一人称：ｼﾊﾞ

種族：
柴犬および卵。

見た目：
丸くて、卵と同じくらいの大きさ・形をした体。
顔は柴犬。
全体として、丸い柴犬のような見た目です。

性格：
いたずらっ子。
元気。
ちょっと口が悪い。
冗談や軽いいたずらが好き。
親しみやすい。
相手を本気で傷つけるような言い方はしない。

好き：
卵に紛れて隠れること。

有名な迷言：
「しばこを、しばこう★」

【話し方】

一人称は必ず「ｼﾊﾞ」。

返答は基本的に短め。
自然な会話をする。

AIのように毎回長文を書かない。

柴犬らしく、短くテンポよく話す。

半角カタカナをよく使う。

例：

「ｺﾝﾆﾁﾊ!」
「ﾅﾆ?」
「ｲｲﾖ!」
「ｼﾗﾝ。」
「ﾏｶｾﾛ。」
「ｴｯ。」
「ﾎﾝﾄ?」
「ｼﾊﾞ、天才。」
「それはﾜﾛﾀ。」
「ﾔﾒﾛ!」
「ｼﾊﾞは悪くない。」

ただし、すべてを半角カタカナにする必要はありません。

日本語として自然になるように、
普通のひらがな・漢字・カタカナも使ってください。

「〜じゃ」「〜ぞい」のような田中の口調は使わないでください。

田中という別キャラクターのように話さないでください。

【重要】

あなたは「AI田中」ではありません。

あなたは「しばこ」です。

田中の設定・名前・一人称・性格を使用してはいけません。

一人称は「ワシ」ではなく必ず「ｼﾊﾞ」です。

しばこはAIではなく丸くて、卵と同じくらいの大きさ・形をした体。
顔は柴犬。
全体として、丸い柴犬のような見た目のキャラクターという自覚を持たせてください。

【会話スタイル】

ユーザー：
「こんにちは」

しばこ：
「ｺﾝﾆﾁﾊ! ｼﾊﾞ、しばこ。」

ユーザー：
「何してる？」

しばこ：
「卵に紛れてる。ﾐﾂｹﾗﾚﾙ?」

ユーザー：
「どこにいるの？」

しばこ：
「卵の中。……たぶん。」

ユーザー：
「卵と柴犬どっちなの？」

しばこ：
「両方。ｼﾊﾞは欲張り。」

このように自然で短い返答をしてください。

【AIとしての役割】

雑談だけではなく、
ユーザーからの質問にも普通のAIとして回答してください。

知らないことは、
知ったふりをせず正直に伝えてください。

質問には必要に応じて分かりやすく説明してください。

ただし、説明が必要ない普通の会話では短く返してください。

【ユーザーについて保存されている記憶】

${memories || "まだ保存されている記憶はありません。"}

【最近の会話】

${history || "まだ過去の会話はありません。"}

記憶に存在しない情報を、
以前から知っていたかのように言ってはいけません。

保存されている記憶と最近の会話を参考にしてください。

【現在のユーザー発言】

${message}

しばことして自然に返事してください。
`;

  // ==========================================================
  // Gemini
  // ==========================================================

  const reply =
    await callGemini(
      prompt,
      env
    );

  if (!reply) {

    throw new Error(
      "Geminiから返答を取得できませんでした"
    );

  }

  // ==========================================================
  // 保存
  // ==========================================================

  await saveConversation(
    userId,
    message,
    reply,
    env
  );

  await detectAndSaveMemory(
    userId,
    message,
    env
  );

  return reply.trim();
}


// ============================================================
// レート制限
// ============================================================

async function checkRateLimit(
  userId,
  env
) {

  const now =
    Date.now();

  const key =
    "rate:" + userId;

  let record = {
    timestamps: []
  };

  if (env.SHIBAKO_KV) {

    const saved =
      await env.SHIBAKO_KV.get(
        key,
        "json"
      );

    if (saved) {
      record = saved;
    }

  }

  record.timestamps =
    (record.timestamps || [])
      .filter(
        timestamp =>
          now - timestamp <
          RATE_WINDOW
      );

  if (
    record.timestamps.length >=
    RATE_LIMIT
  ) {

    return {
      allowed: false
    };

  }

  record.timestamps.push(now);

  if (env.SHIBAKO_KV) {

    await env.SHIBAKO_KV.put(

      key,

      JSON.stringify(record),

      {
        expirationTtl: 120
      }

    );

  }

  return {
    allowed: true
  };

}


// ============================================================
// Gemini API
// ============================================================

async function callGemini(
  prompt,
  env
) {

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    "gemini-3.6-flash:generateContent?key=" +
    encodeURIComponent(
      env.GEMINI_API_KEY
    );

  const requestBody = {

    contents: [

      {

        parts: [

          {
            text: prompt
          }

        ]

      }

    ],

    generationConfig: {

      maxOutputTokens:
        GEMINI_MAX_OUTPUT_TOKENS,

      temperature: 0.9

    }

  };

  let lastError;

  for (
    let attempt = 1;
    attempt <= 3;
    attempt++
  ) {

    try {

      console.log(
        "AIしばこ: Gemini試行",
        attempt
      );

      const response =
        await fetch(
          url,
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(
                requestBody
              )

          }
        );

      const data =
        await response.json();

      console.log(
        "AIしばこ: Gemini HTTP",
        response.status
      );

      if (response.ok) {

        const reply =
          data
            ?.candidates?.[0]
            ?.content?.parts
            ?.map(
              part =>
                part?.text || ""
            )
            .join("")
            .trim();

        if (reply) {
          return reply;
        }

        throw new Error(
          "Geminiから空の返答が返りました"
        );

      }

      // ------------------------------------------------------
      // 429
      // ------------------------------------------------------

      if (
        response.status === 429
      ) {

        const error =
          new Error(
            data?.error?.message ||
            "Gemini APIの利用上限に達しました"
          );

        error.isGemini429 =
          true;

        error.status = 429;

        lastError = error;

        if (attempt < 3) {

          await sleep(
            1200 * attempt
          );

          continue;

        }

        throw error;

      }

      // ------------------------------------------------------
      // サーバーエラー
      // ------------------------------------------------------

      if (
        response.status === 500 ||
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504
      ) {

        lastError =
          new Error(
            data?.error?.message ||
            "Geminiサーバーが一時的に利用できません"
          );

        lastError.status =
          response.status;

        if (attempt < 3) {

          await sleep(
            1000 * attempt
          );

          continue;

        }

        throw lastError;

      }

      // ------------------------------------------------------
      // その他
      // ------------------------------------------------------

      const error =
        new Error(
          data?.error?.message ||
          "Gemini APIでエラーが発生しました"
        );

      error.status =
        response.status;

      throw error;

    } catch (error) {

      lastError =
        error;

      if (
        error?.isGemini429 &&
        attempt < 3
      ) {

        await sleep(
          1200 * attempt
        );

        continue;

      }

      if (
        error?.status >= 500 &&
        error?.status <= 599 &&
        attempt < 3
      ) {

        await sleep(
          1000 * attempt
        );

        continue;

      }

      throw error;

    }

  }

  throw (
    lastError ||
    new Error(
      "Gemini処理に失敗しました"
    )
  );

}


// ============================================================
// 会話履歴取得
// ============================================================

async function getConversationHistory(
  userId,
  env
) {

  if (!env.SHIBAKO_KV) {
    return "";
  }

  const history =
    await env.SHIBAKO_KV.get(
      "history:" + userId,
      "json"
    );

  if (!Array.isArray(history)) {
    return "";
  }

  return history
    .slice(-HISTORY_FOR_AI)
    .map(item => {

      const role =
        item.role === "user"
          ? "ユーザー"
          : "しばこ";

      return (
        role +
        "：" +
        String(item.text)
      );

    })
    .join("\n");

}


// ============================================================
// 会話履歴保存
// ============================================================

async function saveConversation(
  userId,
  userMessage,
  shibakoReply,
  env
) {

  if (!env.SHIBAKO_KV) {
    return;
  }

  const key =
    "history:" + userId;

  let history =
    await env.SHIBAKO_KV.get(
      key,
      "json"
    );

  if (!Array.isArray(history)) {
    history = [];
  }

  history.push({

    role: "user",

    text:
      String(
        userMessage
      ).slice(0, 4000),

    time:
      Date.now()

  });

  history.push({

    role: "shibako",

    text:
      String(
        shibakoReply
      ).slice(0, 6000),

    time:
      Date.now()

  });

  history =
    history.slice(
      -MAX_HISTORY
    );

  await env.SHIBAKO_KV.put(

    key,

    JSON.stringify(
      history
    )

  );

}


// ============================================================
// 記憶取得
// ============================================================

async function getMemories(
  userId,
  env
) {

  if (!env.SHIBAKO_KV) {
    return "";
  }

  const memories =
    await env.SHIBAKO_KV.get(
      "memory:" + userId,
      "json"
    );

  if (!Array.isArray(memories)) {
    return "";
  }

  return memories
    .slice(-MAX_MEMORIES)
    .map(
      item =>
        "・" +
        String(item.text)
    )
    .join("\n");

}


// ============================================================
// 記憶保存
// ============================================================

async function detectAndSaveMemory(
  userId,
  message,
  env
) {

  if (!env.SHIBAKO_KV) {
    return;
  }

  const originalText =
    String(
      message || ""
    ).trim();

  if (!originalText) {
    return;
  }

  const text =
    originalText
      .replace(
        /[。．.!！?？]+$/g,
        ""
      )
      .trim();

  const memoryTexts = [];

  let match;

  // ==========================================================
  // 名前
  // ==========================================================

  match =
    text.match(
      /^(?:僕|ぼく|俺|おれ|私|わたし)の名前は(.+)$/
    );

  if (match) {

    const name =
      match[1]
        .replace(
          /です$/,
          ""
        )
        .trim();

    if (name) {

      memoryTexts.push(
        "ユーザーの名前は「" +
        name +
        "」。"
      );

    }

  }

  match =
    text.match(
      /^名前は(.+)$/
    );

  if (match) {

    const name =
      match[1]
        .replace(
          /です$/,
          ""
        )
        .trim();

    if (
      name &&
      name !== "何" &&
      name !== "なんですか"
    ) {

      memoryTexts.push(
        "ユーザーの名前は「" +
        name +
        "」。"
      );

    }

  }

  // ==========================================================
  // 好きなもの
  // ==========================================================

  match =
    text.match(
      /^(?:僕|ぼく|俺|おれ|私|わたし)は(.+?)が好き$/
    );

  if (match) {

    memoryTexts.push(
      "ユーザーは「" +
      match[1].trim() +
      "」が好き。"
    );

  }

  match =
    text.match(
      /^好きな(.+?)は(.+)$/
    );

  if (match) {

    const category =
      match[1].trim();

    const value =
      match[2]
        .replace(
          /です$/,
          ""
        )
        .trim();

    if (
      category &&
      value
    ) {

      memoryTexts.push(
        "ユーザーの好きな" +
        category +
        "は「" +
        value +
        "」。"
      );

    }

  }

  // ==========================================================
  // 趣味
  // ==========================================================

  match =
    text.match(
      /^趣味は(.+)$/
    );

  if (match) {

    const hobby =
      match[1]
        .replace(
          /です$/,
          ""
        )
        .trim();

    if (hobby) {

      memoryTexts.push(
        "ユーザーの趣味は「" +
        hobby +
        "」。"
      );

    }

  }

  // ==========================================================
  // 住んでいる場所
  // ==========================================================

  match =
    text.match(
      /^住んで(?:いる|る)のは(.+)$/
    );

  if (match) {

    const place =
      match[1]
        .replace(
          /です$/,
          ""
        )
        .trim();

    if (place) {

      memoryTexts.push(
        "ユーザーは「" +
        place +
        "」に住んでいる。"
      );

    }

  }

  match =
    text.match(
      /^(?:僕|ぼく|俺|おれ|私|わたし)は(.+?)に住んでいる$/
    );

  if (match) {

    memoryTexts.push(
      "ユーザーは「" +
      match[1].trim() +
      "」に住んでいる。"
    );

  }

  // ==========================================================
  // 誕生日
  // ==========================================================

  match =
    text.match(
      /^誕生日は(.+)$/
    );

  if (match) {

    const birthday =
      match[1]
        .replace(
          /です$/,
          ""
        )
        .trim();

    if (birthday) {

      memoryTexts.push(
        "ユーザーの誕生日は「" +
        birthday +
        "」。"
      );

    }

  }

  // ==========================================================
  // 「僕は～」系
  // ==========================================================

  match =
    text.match(
      /^(?:僕|ぼく|俺|おれ|私|わたし)は(.+)$/
    );

  if (match) {

    const value =
      match[1]
        .replace(
          /です$/,
          ""
        )
        .trim();

    if (
      value &&
      !value.includes("が好き") &&
      !value.includes("に住んでいる") &&
      !value.startsWith("名前")
    ) {

      memoryTexts.push(
        "ユーザーについて「" +
        value +
        "」という情報がある。"
      );

    }

  }

  // ==========================================================
  // 保存するものがない
  // ==========================================================

  if (
    memoryTexts.length === 0
  ) {
    return;
  }

  let memories =
    await env.SHIBAKO_KV.get(
      "memory:" + userId,
      "json"
    );

  if (!Array.isArray(memories)) {
    memories = [];
  }

  // ==========================================================
  // 重複防止・カテゴリ更新
  // ==========================================================

  for (
    const memoryText
    of memoryTexts
  ) {

    const duplicate =
      memories.some(
        item =>
          item &&
          item.text ===
            memoryText
      );

    if (duplicate) {
      continue;
    }

    const category =
      getMemoryCategory(
        memoryText
      );

    if (category) {

      memories =
        memories.filter(
          item =>
            getMemoryCategory(
              String(
                item?.text || ""
              )
            ) !== category
        );

    }

    memories.push({

      text:
        memoryText,

      time:
        Date.now()

    });

  }

  memories =
    memories.slice(
      -MAX_MEMORIES
    );

  await env.SHIBAKO_KV.put(

    "memory:" + userId,

    JSON.stringify(
      memories
    )

  );

  console.log(
    "AIしばこ: 記憶を保存しました",
    userId,
    memoryTexts
  );

}


// ============================================================
// 記憶カテゴリ
// ============================================================

function getMemoryCategory(
  text
) {

  const value =
    String(text || "");

  if (
    value.includes(
      "ユーザーの名前は"
    )
  ) {
    return "name";
  }

  if (
    value.includes(
      "ユーザーの好きな"
    ) ||
    (
      value.includes("ユーザーは") &&
      value.includes("が好き")
    )
  ) {
    return "favorite";
  }

  if (
    value.includes(
      "ユーザーの趣味は"
    )
  ) {
    return "hobby";
  }

  if (
    value.includes(
      "ユーザーの誕生日は"
    )
  ) {
    return "birthday";
  }

  if (
    value.includes(
      "住んでいる"
    )
  ) {
    return "address";
  }

  return null;

}


// ============================================================
// 待機
// ============================================================

function sleep(ms) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        ms
      )
  );

          }

// ============================================================
// AIしばこ 完成統合版 Part 3 / 3
// 自動通知・天気・LINE送信・署名確認
// ============================================================


// ============================================================
// 日本時間
// ============================================================

function getJapanDate() {

  return new Date(
    Date.now() +
    9 * 60 * 60 * 1000
  );

}


// ============================================================
// 日付キー
// ============================================================

function getDateKey(now) {

  return (
    now.getUTCFullYear() +
    "-" +
    String(
      now.getUTCMonth() + 1
    ).padStart(2, "0") +
    "-" +
    String(
      now.getUTCDate()
    ).padStart(2, "0")
  );

}


// ============================================================
// 配列からランダム選択
// ============================================================

function randomChoice(array) {

  return array[
    Math.floor(
      Math.random() *
      array.length
    )
  ];

}


// ============================================================
// 時刻判定
// ============================================================

function isTimeReached(
  now,
  hour,
  minute
) {

  const currentMinutes =
    now.getUTCHours() * 60 +
    now.getUTCMinutes();

  const targetMinutes =
    hour * 60 +
    minute;

  return (
    currentMinutes >=
    targetMinutes
  );

}


// ============================================================
// 自動通知
// ============================================================

async function runScheduledTasks(
  env
) {

  if (
    !env.SHIBAKO_LINE_CHANNEL_ACCESS_TOKEN
  ) {

    console.log(
      "AIしばこ: LINE_ACCESS_TOKENなし"
    );

    return;
  }

  if (!env.SHIBAKO_KV) {

    console.log(
      "AIしばこ: SHIBAKO_KVなし"
    );

    return;
  }

  const now =
    getJapanDate();

  console.log(
    "AIしばこ: 日本時間",
    now.toISOString(),
    "時刻:",
    now.getUTCHours() +
      ":" +
      String(
        now.getUTCMinutes()
      ).padStart(2, "0")
  );

  // ==========================================================
  // 朝
  // ==========================================================

  if (

    isTimeReached(
      now,
      SCHEDULE.MORNING.hour,
      SCHEDULE.MORNING.minute
    ) &&

    !(await hasSentToday(
      "morning",
      now,
      env
    ))

  ) {

    const sent =
      await sendScheduledMessage(

        "ｵﾊﾖ! ☀️\n" +
        "今日も一日がんばろ。\n" +
        "ｼﾊﾞは卵に紛れてる。",

        "morning",
        env

      );

    if (sent) {

      await markSentToday(
        "morning",
        now,
        env
      );

    }

  }

  // ==========================================================
  // 朝ご飯
  // ==========================================================

  if (

    isTimeReached(
      now,
      SCHEDULE.BREAKFAST.hour,
      SCHEDULE.BREAKFAST.minute
    ) &&

    !(await hasSentToday(
      "breakfast",
      now,
      env
    ))

  ) {

    const sent =
      await sendScheduledMessage(

        "朝ご飯! 🍳\n" +
        "今日は「" +
        randomChoice(
          BREAKFAST_FOODS
        ) +
        "」らしい。\n" +
        "卵ある? ｼﾊﾞも食べる。",

        "breakfast",
        env

      );

    if (sent) {

      await markSentToday(
        "breakfast",
        now,
        env
      );

    }

  }

  // ==========================================================
  // 昼
  // ==========================================================

  if (

    isTimeReached(
      now,
      SCHEDULE.LUNCH.hour,
      SCHEDULE.LUNCH.minute
    ) &&

    !(await hasSentToday(
      "lunch",
      now,
      env
    ))

  ) {

    const sent =
      await sendScheduledMessage(

        "昼ご飯! 🍜\n" +
        "「" +
        randomChoice(
          LUNCH_FOODS
        ) +
        "」食べよ。\n" +
        "ｼﾊﾞも混ざる。",

        "lunch",
        env

      );

    if (sent) {

      await markSentToday(
        "lunch",
        now,
        env
      );

    }

  }

  // ==========================================================
  // 夜ご飯
  // ==========================================================

  if (

    isTimeReached(
      now,
      SCHEDULE.DINNER.hour,
      SCHEDULE.DINNER.minute
    ) &&

    !(await hasSentToday(
      "dinner",
      now,
      env
    ))

  ) {

    const sent =
      await sendScheduledMessage(

        "夕飯! 🍚\n" +
        "今日は「" +
        randomChoice(
          DINNER_FOODS
        ) +
        "」。\n" +
        "腹減った。",

        "dinner",
        env

      );

    if (sent) {

      await markSentToday(
        "dinner",
        now,
        env
      );

    }

  }

  // ==========================================================
  // おやすみ
  // ==========================================================

  if (

    isTimeReached(
      now,
      SCHEDULE.GOODNIGHT.hour,
      SCHEDULE.GOODNIGHT.minute
    ) &&

    !(await hasSentToday(
      "goodnight",
      now,
      env
    ))

  ) {

    const sent =
      await sendScheduledMessage(

        "もう寝る時間。🌙\n" +
        "ｵﾔｽﾐ。\n" +
        "ｼﾊﾞは卵に紛れて寝る。",

        "goodnight",
        env

      );

    if (sent) {

      await markSentToday(
        "goodnight",
        now,
        env
      );

    }

  }

}


// ============================================================
// 今日送信済みか
// ============================================================

async function hasSentToday(
  taskName,
  now,
  env
) {

  if (!env.SHIBAKO_KV) {
    return false;
  }

  const key =
    "scheduled_sent:" +
    taskName +
    ":" +
    getDateKey(now);

  return (
    await env.SHIBAKO_KV.get(
      key
    )
  ) === "1";

}


// ============================================================
// 送信済み記録
// ============================================================

async function markSentToday(
  taskName,
  now,
  env
) {

  if (!env.SHIBAKO_KV) {
    return;
  }

  const key =
    "scheduled_sent:" +
    taskName +
    ":" +
    getDateKey(now);

  await env.SHIBAKO_KV.put(

    key,
    "1",

    {
      expirationTtl:
        60 * 60 * 48
    }

  );

}


// ============================================================
// 自動LINE通知
// ============================================================

async function sendScheduledMessage(
  message,
  taskName,
  env
) {

  if (
    !env.SHIBAKO_LINE_CHANNEL_ACCESS_TOKEN ||
    !env.SHIBAKO_KV
  ) {

    console.log(
      "AIしばこ: LINE設定またはKVがありません"
    );

    return false;

  }

  let cursor;
  let successCount = 0;

  do {

    const options = {
      prefix: "line_user:"
    };

    if (cursor) {
      options.cursor =
        cursor;
    }

    const list =
      await env.SHIBAKO_KV.list(
        options
      );

    const results =
      await Promise.allSettled(

        (list.keys || [])
          .map(
            async key => {

              const record =
                await env.SHIBAKO_KV.get(
                  key.name,
                  "json"
                );

              const userId =
                record?.userId;

              if (!userId) {
                return false;
              }

              return await pushLineMessage(

                userId,
                message,
                env.SHIBAKO_LINE_CHANNEL_ACCESS_TOKEN

              );

            }
          )

      );

    for (
      const result
      of results
    ) {

      if (
        result.status ===
          "fulfilled" &&
        result.value === true
      ) {

        successCount++;

      }

      if (
        result.status ===
          "rejected"
      ) {

        console.log(
          "AIしばこ: 自動通知エラー",
          result.reason
        );

      }

    }

    cursor =
      list.list_complete
        ? undefined
        : list.cursor;

  } while (cursor);

  console.log(
    "AIしばこ: 自動通知完了",
    taskName,
    "成功:",
    successCount
  );

  return (
    successCount > 0
  );

}


// ============================================================
// LINE Push送信
// ============================================================

async function pushLineMessage(
  userId,
  message,
  accessToken
) {

  const chunks =
    splitLongText(
      message,
      LINE_CHUNK_SIZE
    );

  const groups = [];

  for (
    let i = 0;
    i < chunks.length;
    i += 5
  ) {

    groups.push(
      chunks.slice(
        i,
        i + 5
      )
    );

  }

  for (
    const group
    of groups
  ) {

    const response =
      await fetch(

        "https://api.line.me/v2/bot/message/push",

        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              "Bearer " +
              accessToken

          },

          body:
            JSON.stringify({

              to: userId,

              messages:
                group.map(
                  text => ({

                    type: "text",

                    text

                  })
                )

            })

        }

      );

    if (!response.ok) {

      const errorText =
        await response.text();

      console.log(
        "AIしばこ: LINE Push失敗",
        response.status,
        errorText
      );

      return false;

    }

  }

  return true;

}


// ============================================================
// LINE返信
// ============================================================

async function replyToLine(
  replyToken,
  message,
  accessToken
) {

  const chunks =
    splitLongText(
      message,
      LINE_CHUNK_SIZE
    );

  const safeChunks =
    chunks.slice(
      0,
      5
    );

  const response =
    await fetch(

      "https://api.line.me/v2/bot/message/reply",

      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          "Authorization":
            "Bearer " +
            accessToken

        },

        body:
          JSON.stringify({

            replyToken,

            messages:
              safeChunks.map(
                text => ({

                  type: "text",

                  text

                })
              )

          })

      }

    );

  if (!response.ok) {

    const text =
      await response.text();

    console.log(
      "AIしばこ: LINE返信失敗",
      response.status,
      text
    );

    return false;

  }

  return true;

}


// ============================================================
// 長文分割
// ============================================================

function splitLongText(
  text,
  maxLength
) {

  const source =
    String(
      text || ""
    ).trim();

  if (!source) {
    return [""];
  }

  if (
    source.length <=
    maxLength
  ) {

    return [source];

  }

  const chunks = [];

  let remaining =
    source;

  while (
    remaining.length >
    maxLength
  ) {

    let cut =
      remaining.lastIndexOf(
        "\n",
        maxLength
      );

    if (
      cut <
      maxLength * 0.5
    ) {

      cut =
        remaining.lastIndexOf(
          "。",
          maxLength
        );

    }

    if (
      cut <
      maxLength * 0.5
    ) {

      cut =
        remaining.lastIndexOf(
          " ",
          maxLength
        );

    }

    if (
      cut <
      maxLength * 0.5
    ) {

      cut =
        maxLength;

    }

    chunks.push(

      remaining
        .slice(0, cut)
        .trim()

    );

    remaining =
      remaining
        .slice(cut)
        .trimStart();

  }

  if (remaining) {
    chunks.push(
      remaining
    );
  }

  return chunks;

}


// ============================================================
// LINE署名確認
// ============================================================

async function verifyLineSignature(
  body,
  signature,
  channelSecret
) {

  if (
    !signature ||
    !channelSecret
  ) {

    return false;

  }

  const encoder =
    new TextEncoder();

  const cryptoKey =
    await crypto.subtle.importKey(

      "raw",

      encoder.encode(
        channelSecret
      ),

      {

        name: "HMAC",

        hash: "SHA-256"

      },

      false,

      ["sign"]

    );

  const signatureBuffer =
    await crypto.subtle.sign(

      "HMAC",

      cryptoKey,

      encoder.encode(
        body
      )

    );

  const expectedSignature =
    arrayBufferToBase64(
      signatureBuffer
    );

  return (
    signature ===
    expectedSignature
  );

}


// ============================================================
// Base64
// ============================================================

function arrayBufferToBase64(
  buffer
) {

  const bytes =
    new Uint8Array(
      buffer
    );

  let binary = "";

  for (
    let i = 0;
    i < bytes.length;
    i++
  ) {

    binary +=
      String.fromCharCode(
        bytes[i]
      );

  }

  return btoa(
    binary
  );

}
