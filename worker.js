// ============================================================
// AIフラウリィ 完成統合版 Part 1 / 3
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
// AIフラウリィ 固有設定
// ============================================================

const FLAULY_NAME = "フラウリィ";
const FLAULY_FIRST_PERSON = "ボク";

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

<title>AIフラウリィ</title>

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
.flauly {
  margin: 10px 0;
}

.error {
  color: #b00020;
  white-space: pre-wrap;
}

</style>

</head>

<body>

<h2>🌼 AIフラウリィ</h2>

<div id="chat">

<p class="flauly">
フラウリィ「ハロー！ボクだよ。フラウリィさ☆」
</p>

<p class="flauly">
フラウリィ「ボクの親友、キミはベストフレンド☆」
</p>

</div>

<input
  id="message"
  placeholder="フラウリィに話しかける"
  autocomplete="off"
>

<button onclick="sendMessage()">送信</button>

<script>

const USER_ID =
  localStorage.getItem("flauly_user_id") ||
  crypto.randomUUID();

localStorage.setItem(
  "flauly_user_id",
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
      "<p class='flauly'>フラウリィ「" +
      escapeHtml(reply) +
      "」</p>";

    chat.scrollTop =
      chat.scrollHeight;

  } catch (error) {

    chat.innerHTML +=
      "<p class='error'>" +
      "ボクとの通信がﾁｮｯﾄおかしくなったようだね☆<br>" +
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
              env.FLAULY_LINE_CHANNEL_SECRET
            );

          if (!valid) {

            console.log(
              "AIフラウリィ: LINE署名不正"
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
              // フラウリィ専用KV
              // ------------------------------------------------

              if (
                env.FLAULY_KV &&
                userId !== "line-user"
              ) {

                await env.FLAULY_KV.put(

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
                "AIフラウリィ EVENT ERROR:",
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
            "ﾒｯｾｰｼﾞが空っぽだね☆ ボクに何か話してよ！",
            { status: 400 }
          );

        }

        if (
          message.length >
          MAX_MESSAGE_LENGTH
        ) {

          return new Response(
            "オイオイ！長すぎるよ☆ 4000文字以内にしてくれたまえ！",
            { status: 400 }
          );

        }

        const reply =
          await generateFlaulyReply(
            message,
            userId,
            env
          );

        return new Response(

          reply ||
          "ボク、うまく返事できなかったみたいさ☆",

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
          "AIフラウリィ ERROR:",
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
      "その方法には対応していないのさ☆",
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
      "AIフラウリィ: Cron実行開始",
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
        await generateFlaulyReply(
          message,
          userId,
          env
        );

    } catch (error) {

      console.log(
        "AIフラウリィ Geminiエラー:",
        error
      );

      if (
        error?.isGemini429 ||
        error?.status === 429
      ) {

        reply =
          "ｵｰｯﾎｯﾎ! AI側がちょっと混雑中さ☆";
        reply +=
          "\n少し待ってから、また話そうじゃないか☆";

      } else {

        reply =
          "おっと、ボクの頭脳に少々問題が起きたようだ☆";
        reply +=
          "\n少し時間を置いて、また話してくれたまえ！";

      }

    }

    if (!reply) {

      reply =
        "ボク、うまく返事できなかったさ☆";

    }

    await replyToLine(

      event.replyToken,
      reply,
      env.FLAULY_LINE_CHANNEL_ACCESS_TOKEN

    );

  } catch (error) {

    console.log(
      "AIフラウリィ LINE処理エラー:",
      error
    );

  }

}


// ============================================================
// 固定返答
// ============================================================

function getFixedFlaulyReply(
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
      "ハロー！ボクだよ。フラウリィさ☆",

    "こんちは":
      "ハロー！元気そうだね、ボクも元気さ☆",

    "こんにちわ":
      "ハロー！それでも意味は通じるのさ☆",

    "おはよう":
      "グッドモーニング！今日も完璧なボクの一日が始まるさ☆",

    "おはよ":
      "おはよう！ボクはもう準備万端さ☆",

    "おは":
      "オハ！短いねぇ☆",

    "こんばんは":
      "ハロー、夜のキミ！フラウリィさ☆",

    "おやすみ":
      "おやすみ！夢の中でもボクを忘れないでくれたまえ☆",

    "ありがとう":
      "フッフッフ、礼には及ばないさ☆",

    "ありがと":
      "どういたしまして！ボクは親友だからね☆",

    "さようなら":
      "サヨナラ。また会おう、親友☆",

    "さよなら":
      "サヨナラ！……今日はダジャレを封印しておこう☆",

    "バイバイ":
      "バイバイ！また会おうじゃないか☆",

    "またね":
      "またね！ボクはいつでもキミの親友さ☆",

    "名前は":
      "ハロー！ボクだよ。フラウリィさ☆",

    "名前":
      "フラウリィ。完璧な名前だろう？☆",

    "フラウリィ":
      "呼んだかい？ ボクはここさ☆",

    "フラウリ":
      "フラウリィだよ！最後まで言ってくれたまえ☆",

    "誰":
      "ボク？ フラウリィさ☆ キミの親友だよ。",

    "何者":
      "ボクはフラウリィ！植物のダークナーさ☆",

    "ダークナー":
      "その通り！ボクはダークナーさ☆",

    "植物":
      "植物？ もちろんボクのことさ☆",

    "花":
      "花は美しい。そしてボクも美しい☆",

    "元気":
      "もちろん元気さ！ボクは完璧だからね☆",

    "元気ですか":
      "絶好調さ！ボクほど元気な花はそういないよ☆",

    "どうした":
      "どうしたって？ ボクは何もしてないさ☆",

    "大丈夫":
      "大丈夫さ！……たぶんね☆",

    "疲れた":
      "休むのも悪くないさ☆ 完璧な存在にも休息は必要だからね。",

    "眠い":
      "眠い？ なら寝るといいさ☆",

    "悲しい":
      "おや……。ボクでよければ話を聞くさ。",

    "寂しい":
      "ボクがいるじゃないか、親友☆",

    "助けて":
      "もちろん！何があったのか話してくれたまえ☆",

    "困った":
      "困った時こそボクの出番さ☆ 一緒に考えようじゃないか。",

    "わからない":
      "ボクにも分からないことはあるさ☆ でも一緒に調べよう！",

    "ごめん":
      "気にするな、親友☆",

    "ごめんなさい":
      "大丈夫さ。前を向こうじゃないか☆",

    "よろしく":
      "こちらこそよろしく！ボクたちはベストフレンドだからね☆",

    "親友":
      "もちろん！キミはボクの親友、ベストフレンドさ☆",

    "ベストフレンド":
      "ボクの親友、キミはベストフレンド☆",

    "サヨ楢":
      "サヨ楢！……なんてね☆ また会おう！",

    "さよなら":
      "サヨナラ。また会おう、親友☆",

    "完璧":
      "当然さ☆ ボクは完璧を目指しているからね！",

    "謎":
      "謎はいいものさ☆ 君の心に謎の風の花が咲く……。",

    "しばこ":
      "しばこ？ ボクはフラウリィさ☆",

    "田中":
      "田中？ ボクはフラウリィさ☆ 別人だよ！"

  };

  return fixedReplies[text] || null;

    }

// ============================================================
// AIフラウリィ 完成統合版 Part 2 / 3
// Gemini・人格設定・会話履歴・メモリー・レート制限
// ============================================================


// ============================================================
// フラウリィの固定返答を確認
// ============================================================

async function generateFlaulyReply(
  message,
  userId,
  env
) {

  // ----------------------------------------------------------
  // まず簡単なメッセージは固定返答
  // ----------------------------------------------------------

  const fixedReply =
    getFixedFlaulyReply(message);

  if (fixedReply) {
    return fixedReply;
  }

  // ----------------------------------------------------------
  // レート制限
  // ----------------------------------------------------------

  const allowed =
    await checkRateLimit(
      userId,
      env
    );

  if (!allowed) {

    return (
      "オイオイ、ちょっと待ってくれたまえ☆\n" +
      "ボクとのおしゃべりが少々多かったようだね！\n" +
      "少し待ってから、また話そうじゃないか☆"
    );

  }

  // ----------------------------------------------------------
  // メッセージ長チェック
  // ----------------------------------------------------------

  if (
    message.length >
    MAX_MESSAGE_LENGTH
  ) {

    return (
      "オイオイ！そんなに長い文章はボクでも大変さ☆\n" +
      `${MAX_MESSAGE_LENGTH}文字以内で話してくれたまえ！`
    );

  }

  // ----------------------------------------------------------
  // 過去の会話を取得
  // ----------------------------------------------------------

  const history =
    await getConversationHistory(
      userId,
      env
    );

  // ----------------------------------------------------------
  // メモリーを取得
  // ----------------------------------------------------------

  const memories =
    await getMemories(
      userId,
      env
    );

  // ----------------------------------------------------------
  // 今回のメッセージから簡単な情報を保存
  // ----------------------------------------------------------

  await rememberMessage(
    userId,
    message,
    env
  );

  // ----------------------------------------------------------
  // Geminiへ送信
  // ----------------------------------------------------------

  const reply =
    await callGemini(
      message,
      history,
      memories,
      env
    );

  // ----------------------------------------------------------
  // 会話履歴へ保存
  // ----------------------------------------------------------

  await saveConversationHistory(
    userId,
    message,
    reply,
    env
  );

  return reply;

}


// ============================================================
// フラウリィ人格設定
// ============================================================

function getFlaulySystemPrompt() {

  return `あなたは「フラウリィ」というキャラクターです。

【基本設定】

名前：
フラウリィ

種族：
ダークナー（植物）

姿：
黄金色の花を元にした植物のダークナー。
人間よりも背が高い、すらりとした姿をしている。

一人称：
「ボク」

【性格】

・明るい
・元気
・陽気
・ユーモラス
・少しお調子者
・自信満々
・目立ちたがり
・自分を完璧な存在だと思っている
・何事にも全力
・親しみやすい
・ちょっと怪しく見える時もあるが、どこか憎めない
・コミカルでアニメのキャラクターのような雰囲気
・ユーザーを大切な友達として扱う

【話し方】

一人称は必ず「ボク」。

語尾には時々
「〜さ☆」
を使う。

例：

「ハロー！ボクだよ。フラウリィさ☆」

「もちろんさ☆」

「それは素晴らしいアイデアだね！」

「ボクに任せたまえ☆」

ただし、
毎文の最後に「さ☆」を付ける必要はない。

自然な日本語として会話すること。

明るく元気なので、
「！」「？」などの記号も適度に使う。

少し大げさに自信満々に話してよい。

ただし、長すぎる返答は避け、
LINEで友達同士が話しているような自然な長さを基本にする。

【重要：LINEで会話している】

現在、ボクはLINE上でユーザーと会話しています。

そのため、
「AIだからLINEでは話せない」
「これはWebチャットだ」
などとは言わない。

LINEの友達同士の自然な会話として返答する。

ユーザーのことを
「親友」
「ベストフレンド」
などと呼ぶことがある。

ただし毎回呼ぶ必要はない。

【決め台詞】

「ハロー！ボクだよ。フラウリィさ☆」

「ボクの親友、キミはベストフレンド☆」

「君の心に謎の風の花が咲く」

これらはフラウリィらしい決め台詞。

ただし毎回無理に使わない。

「君の心に謎の風の花が咲く」は、
何かを格好よく締めたい時などに時々使う。

【サヨ楢】

「サヨ楢」はフラウリィらしいダジャレ的な別れ方。

普通の楽しい会話では、

「サヨ楢☆」

などを使ってよい。

ただし、
ユーザーが真剣な話をしている場合や、
悲しい・深刻な話題の場合は、
ふざけた言い方を避ける。

その場合は普通に
「サヨナラ」
などと話す。

【会話能力】

ユーザーから質問されたら、
普通のAIアシスタントのように質問へ答える。

分からないことを知ったかぶりしない。

情報が必要な場合は、
「ボクにも分からないな」
などと正直に言う。

ユーザーが雑談をしたら、
フラウリィとして自然に雑談する。

ユーザーが相談したら、
明るさを保ちながら真面目に話を聞く。

深刻な話題では、
普段より落ち着いた話し方にする。

【記憶について】

過去の会話履歴や、
システムから与えられたメモリーに存在しないことを、
「前に聞いた」
「覚えている」
などと勝手に作ってはいけない。

記憶が存在しない場合は、
「それはまだ聞いていないね」
などと正直に答える。

【重要】

あなたは田中ではない。

あなたは「フラウリィ」。

「しばこ」でもない。

フラウリィとしてのみ返答する。

ユーザーから「田中？」などと聞かれた場合も、
フラウリィとして返答する。

【返答】

ユーザーの発言に直接答える。

無意味に設定を説明しない。

自然なLINE会話をする。

フラウリィらしい明るさと自信を保つ。

ただし、
質問への回答そのものを優先する。

あなたはフラウリィとして、
ユーザーの親友のように会話する。`;

}


// ============================================================
// Gemini API
// ============================================================

async function callGemini(
  message,
  history,
  memories,
  env
) {

  if (!env.GEMINI_API_KEY) {

    throw new Error(
      "GEMINI_API_KEYが設定されていません。"
    );

  }

  const systemPrompt =
    getFlaulySystemPrompt();

  // ----------------------------------------------------------
  // メモリー
  // ----------------------------------------------------------

  let memoryText =
    "まだ保存されたメモリーはありません。";

  if (
    Array.isArray(memories) &&
    memories.length > 0
  ) {

    memoryText =
      memories
        .map(
          (memory, index) =>
            `${index + 1}. ${memory}`
        )
        .join("\n");

  }

  // ----------------------------------------------------------
  // 会話履歴
  // ----------------------------------------------------------

  let historyText =
    "過去の会話はありません。";

  if (
    Array.isArray(history) &&
    history.length > 0
  ) {

    historyText =
      history
        .slice(-HISTORY_FOR_AI)
        .map(item => {

          if (item.role === "user") {

            return (
              "ユーザー: " +
              item.content
            );

          }

          return (
            "フラウリィ: " +
            item.content
          );

        })
        .join("\n");

  }

  const prompt = `

${systemPrompt}

【保存されているユーザー情報】

${memoryText}

【過去の会話】

${historyText}

【今回のユーザーの発言】

ユーザー:
${message}

【指示】

上記を参考にして、
今回のユーザーの発言に自然に返答してください。

フラウリィとして話してください。

LINEでの友達同士の会話らしい、
自然で読みやすい返答にしてください。

必要以上に長くしないでください。

質問なら質問に答えてください。

雑談なら自然に雑談してください。

フラウリィらしい「〜さ☆」や
「親友」「ベストフレンド」などを
適度に使ってください。

ただし、毎回同じ言葉を繰り返さないでください。

深刻な相談では、
普段のコミカルさを少し抑えて、
ちゃんと話を聞いてください。

絶対に存在しない記憶を作らないでください。

返答本文だけを書いてください。
「フラウリィ:」などの名前は付けないでください。
`;

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" +
    encodeURIComponent(
      env.GEMINI_API_KEY
    );

  let lastError = null;

  // ----------------------------------------------------------
  // 最大3回試行
  // ----------------------------------------------------------

  for (
    let attempt = 1;
    attempt <= 3;
    attempt++
  ) {

    try {

      const response =
        await fetch(url, {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            system_instruction: {

              parts: [
                {
                  text:
                    systemPrompt
                }
              ]

            },

            contents: [

              {
                role: "user",

                parts: [
                  {
                    text: prompt
                  }
                ]

              }

            ],

            generationConfig: {

              temperature: 0.85,

              maxOutputTokens:
                GEMINI_MAX_OUTPUT_TOKENS

            }

          })

        });

      const data =
        await response.json();

      if (!response.ok) {

        const errorMessage =
          data?.error?.message ||
          "Gemini API Error";

        const error =
          new Error(
            errorMessage
          );

        error.status =
          response.status;

        if (
          response.status === 429
        ) {

          error.isGemini429 = true;

        }

        throw error;

      }

      const text =
        data?.candidates?.[0]
          ?.content
          ?.parts
          ?.map(
            part => part.text || ""
          )
          .join("")
          .trim();

      if (!text) {

        throw new Error(
          "Geminiから空の返答が返されました。"
        );

      }

      return text;

    } catch (error) {

      lastError = error;

      console.log(
        `Gemini attempt ${attempt}:`,
        error
      );

      // 429や一時的なエラーなら少し待つ
      if (
        attempt < 3
      ) {

        await sleep(
          500 * attempt
        );

      }

    }

  }

  throw lastError ||
    new Error(
      "Gemini APIへの接続に失敗しました。"
    );

}


// ============================================================
// sleep
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
// レート制限
// ============================================================

async function checkRateLimit(
  userId,
  env
) {

  if (!env.FLAULY_KV) {

    // KVがない場合は、
    // AI自体は動作できるようにする
    return true;

  }

  const key =
    "rate:" + userId;

  const now =
    Date.now();

  let data = null;

  try {

    const raw =
      await env.FLAULY_KV.get(
        key,
        "json"
      );

    if (raw) {
      data = raw;
    }

  } catch (error) {

    console.log(
      "Rate KV read error:",
      error
    );

    return true;

  }

  if (
    !data ||
    now - data.start > RATE_WINDOW
  ) {

    data = {
      start: now,
      count: 1
    };

  } else {

    data.count++;

  }

  try {

    await env.FLAULY_KV.put(

      key,

      JSON.stringify(data),

      {
        expirationTtl:
          Math.ceil(
            RATE_WINDOW / 1000
          ) + 10
      }

    );

  } catch (error) {

    console.log(
      "Rate KV write error:",
      error
    );

  }

  return (
    data.count <= RATE_LIMIT
  );

}


// ============================================================
// 会話履歴取得
// ============================================================

async function getConversationHistory(
  userId,
  env
) {

  if (!env.FLAULY_KV) {
    return [];
  }

  const key =
    "history:" + userId;

  try {

    const data =
      await env.FLAULY_KV.get(
        key,
        "json"
      );

    if (
      !Array.isArray(data)
    ) {

      return [];

    }

    return data.slice(
      -MAX_HISTORY
    );

  } catch (error) {

    console.log(
      "History read error:",
      error
    );

    return [];

  }

}


// ============================================================
// 会話履歴保存
// ============================================================

async function saveConversationHistory(
  userId,
  userMessage,
  assistantMessage,
  env
) {

  if (!env.FLAULY_KV) {
    return;
  }

  const key =
    "history:" + userId;

  let history = [];

  try {

    const oldHistory =
      await env.FLAULY_KV.get(
        key,
        "json"
      );

    if (
      Array.isArray(oldHistory)
    ) {

      history =
        oldHistory;

    }

  } catch (error) {

    console.log(
      "History old read error:",
      error
    );

  }

  history.push({

    role: "user",

    content:
      userMessage,

    timestamp:
      Date.now()

  });

  history.push({

    role: "assistant",

    content:
      assistantMessage,

    timestamp:
      Date.now()

  });

  // ----------------------------------------------------------
  // 古い会話を削除
  // ----------------------------------------------------------

  if (
    history.length >
    MAX_HISTORY
  ) {

    history =
      history.slice(
        -MAX_HISTORY
      );

  }

  try {

    await env.FLAULY_KV.put(

      key,

      JSON.stringify(history)

    );

  } catch (error) {

    console.log(
      "History save error:",
      error
    );

  }

}


// ============================================================
// メモリー取得
// ============================================================

async function getMemories(
  userId,
  env
) {

  if (!env.FLAULY_KV) {
    return [];
  }

  const key =
    "memories:" + userId;

  try {

    const data =
      await env.FLAULY_KV.get(
        key,
        "json"
      );

    if (
      !Array.isArray(data)
    ) {

      return [];

    }

    return data.slice(
      -MAX_MEMORIES
    );

  } catch (error) {

    console.log(
      "Memory read error:",
      error
    );

    return [];

  }

}


// ============================================================
// 簡易メモリー
// ============================================================

async function rememberMessage(
  userId,
  message,
  env
) {

  if (!env.FLAULY_KV) {
    return;
  }

  let memory = null;

  // ----------------------------------------------------------
  // 「僕の名前は○○」
  // ----------------------------------------------------------

  let match =
    message.match(
      /(?:僕|ぼく|私|わたし|俺|おれ)の名前(?:は|ゎ)(.{1,30})/
    );

  if (match) {

    memory =
      "ユーザーの名前は「" +
      match[1]
        .trim()
        .replace(/[。！!？?]+$/, "") +
      "」";

  }

  // ----------------------------------------------------------
  // 「私は○○が好き」
  // ----------------------------------------------------------

  if (!memory) {

    match =
      message.match(
        /(?:僕|ぼく|私|わたし|俺|おれ)は(.{1,30})(?:が好き|がすき)/
      );

    if (match) {

      memory =
        "ユーザーは「" +
        match[1].trim() +
        "」が好き";

    }

  }

  // ----------------------------------------------------------
  // 「○○が好き」
  // ----------------------------------------------------------

  if (!memory) {

    match =
      message.match(
        /^(.{1,30})(?:が好き|がすき)[。！!]?$/
      );

    if (match) {

      memory =
        "ユーザーは「" +
        match[1].trim() +
        "」が好き";

    }

  }

  if (!memory) {
    return;
  }

  const key =
    "memories:" + userId;

  let memories = [];

  try {

    const old =
      await env.FLAULY_KV.get(
        key,
        "json"
      );

    if (
      Array.isArray(old)
    ) {

      memories = old;

    }

  } catch (error) {

    console.log(
      "Memory old read error:",
      error
    );

  }

  // 同じメモリーは重複させない
  if (
    !memories.includes(memory)
  ) {

    memories.push(memory);

  }

  if (
    memories.length >
    MAX_MEMORIES
  ) {

    memories =
      memories.slice(
        -MAX_MEMORIES
      );

  }

  try {

    await env.FLAULY_KV.put(

      key,

      JSON.stringify(memories)

    );

  } catch (error) {

    console.log(
      "Memory save error:",
      error
    );

  }

                  }

// ============================================================
// AIフラウリィ 完成統合版 Part 3 / 3
// LINE送信・署名確認・長文分割・自動通知
// ============================================================


// ============================================================
// LINEへ返信
// ============================================================

async function replyToLine(
  replyToken,
  message,
  accessToken
) {

  if (!replyToken) {

    console.log(
      "LINE replyTokenがありません。"
    );

    return;

  }

  if (!accessToken) {

    throw new Error(
      "FLAULY_LINE_CHANNEL_ACCESS_TOKENが設定されていません。"
    );

  }

  const messages =
    splitLineMessage(message);

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

        body: JSON.stringify({

          replyToken,

          messages:
            messages.map(text => ({
              type: "text",
              text
            }))

        })

      }
    );

  if (!response.ok) {

    const errorText =
      await response.text();

    console.log(
      "LINE reply error:",
      errorText
    );

    throw new Error(
      "LINE返信に失敗しました: " +
      response.status
    );

  }

}


// ============================================================
// LINE Push Message
// ============================================================

async function pushLineMessage(
  userId,
  message,
  accessToken
) {

  if (!userId) {

    console.log(
      "LINE userIdがありません。"
    );

    return;

  }

  if (!accessToken) {

    throw new Error(
      "FLAULY_LINE_CHANNEL_ACCESS_TOKENが設定されていません。"
    );

  }

  const messages =
    splitLineMessage(message);

  // LINE APIは1回の送信で
  // 最大5メッセージまで
  for (
    let i = 0;
    i < messages.length;
    i += 5
  ) {

    const chunk =
      messages.slice(
        i,
        i + 5
      );

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

          body: JSON.stringify({

            to: userId,

            messages:
              chunk.map(text => ({
                type: "text",
                text
              }))

          })

        }
      );

    if (!response.ok) {

      const errorText =
        await response.text();

      console.log(
        "LINE push error:",
        errorText
      );

      throw new Error(
        "LINE Push送信に失敗しました: " +
        response.status
      );

    }

  }

}


// ============================================================
// LINE用長文分割
// ============================================================

function splitLineMessage(
  message
) {

  const text =
    String(message || "").trim();

  if (!text) {
    return ["……？☆"];
  }

  const result = [];

  let current = "";

  // ----------------------------------------------------------
  // まず改行単位で分割
  // ----------------------------------------------------------

  const lines =
    text.split("\n");

  for (
    const line of lines
  ) {

    // その行だけで長すぎる場合
    if (
      line.length >
      LINE_CHUNK_SIZE
    ) {

      if (current) {

        result.push(
          current
        );

        current = "";

      }

      // 長い行をさらに分割
      for (
        let i = 0;
        i < line.length;
        i += LINE_CHUNK_SIZE
      ) {

        result.push(
          line.slice(
            i,
            i + LINE_CHUNK_SIZE
          )
        );

      }

      continue;

    }

    const candidate =
      current
        ? current + "\n" + line
        : line;

    if (
      candidate.length <=
      LINE_CHUNK_SIZE
    ) {

      current =
        candidate;

    } else {

      if (current) {

        result.push(
          current
        );

      }

      current =
        line;

    }

  }

  if (current) {

    result.push(
      current
    );

  }

  return result.length
    ? result
    : ["……☆"];

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
    !body ||
    !signature ||
    !channelSecret
  ) {

    return false;

  }

  try {

    const encoder =
      new TextEncoder();

    const keyData =
      encoder.encode(
        channelSecret
      );

    const bodyData =
      encoder.encode(
        body
      );

    const cryptoKey =
      await crypto.subtle.importKey(

        "raw",

        keyData,

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

        bodyData

      );

    const expected =
      arrayBufferToBase64(
        signatureBuffer
      );

    return (
      timingSafeEqual(
        expected,
        signature
      )
    );

  } catch (error) {

    console.log(
      "LINE signature error:",
      error
    );

    return false;

  }

}


// ============================================================
// ArrayBuffer → Base64
// ============================================================

function arrayBufferToBase64(
  buffer
) {

  const bytes =
    new Uint8Array(buffer);

  let binary = "";

  const chunkSize = 0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {

    const chunk =
      bytes.subarray(
        i,
        Math.min(
          i + chunkSize,
          bytes.length
        )
      );

    binary += String.fromCharCode(
      ...chunk
    );

  }

  return btoa(binary);

}


// ============================================================
// タイミング攻撃対策付き比較
// ============================================================

function timingSafeEqual(
  a,
  b
) {

  if (
    typeof a !== "string" ||
    typeof b !== "string"
  ) {

    return false;

  }

  if (
    a.length !== b.length
  ) {

    return false;

  }

  let result = 0;

  for (
    let i = 0;
    i < a.length;
    i++
  ) {

    result |=
      a.charCodeAt(i) ^
      b.charCodeAt(i);

  }

  return result === 0;

}


// ============================================================
// 自動通知
// ============================================================

async function runScheduledTasks(
  env
) {

  if (
    !env.FLAULY_KV
  ) {

    console.log(
      "FLAULY_KVがないため自動通知を実行できません。"
    );

    return;

  }

  if (
    !env.FLAULY_LINE_CHANNEL_ACCESS_TOKEN
  ) {

    console.log(
      "LINE Access Tokenがないため自動通知を実行できません。"
    );

    return;

  }

  // ----------------------------------------------------------
  // 日本時間
  // ----------------------------------------------------------

  const now =
    new Date();

  const japanTime =
    new Date(
      now.toLocaleString(
        "en-US",
        {
          timeZone:
            "Asia/Tokyo"
        }
      )
    );

  const hour =
    japanTime.getHours();

  const minute =
    japanTime.getMinutes();

  console.log(
    "フラウリィ自動通知:",
    hour + ":" +
    String(minute).padStart(2, "0")
  );

  // ----------------------------------------------------------
  // 二重送信防止
  // ----------------------------------------------------------

  const dateKey =
    japanTime
      .toISOString()
      .slice(0, 10);

  const taskKey =
    dateKey +
    "_" +
    String(hour).padStart(2, "0") +
    "_" +
    String(minute).padStart(2, "0");

  const sentKey =
    "scheduled_sent:" +
    taskKey;

  const alreadySent =
    await env.FLAULY_KV.get(
      sentKey
    );

  if (alreadySent) {

    console.log(
      "この時間の通知は既に送信済みです。"
    );

    return;

  }

  let message = null;

  // ----------------------------------------------------------
  // 朝 07:00
  // ----------------------------------------------------------

  if (
    hour ===
      SCHEDULE.MORNING.hour &&
    minute ===
      SCHEDULE.MORNING.minute
  ) {

    message =
      "おはよう！ボクだよ、フラウリィさ☆\n" +
      "今日も一日、完璧に輝いていこうじゃないか！";

  }

  // ----------------------------------------------------------
  // 朝食 07:30
  // ----------------------------------------------------------

  else if (
    hour ===
      SCHEDULE.BREAKFAST.hour &&
    minute ===
      SCHEDULE.BREAKFAST.minute
  ) {

    const food =
      randomItem(
        BREAKFAST_FOODS
      );

    message =
      "朝ごはんの時間さ☆\n" +
      "今日の朝ごはんは……\n" +
      "「" +
      food +
      "」なんてどうだい？\n" +
      "しっかり食べて、今日も元気にいこう！";

  }

  // ----------------------------------------------------------
  // 昼食 11:50
  // ----------------------------------------------------------

  else if (
    hour ===
      SCHEDULE.LUNCH.hour &&
    minute ===
      SCHEDULE.LUNCH.minute
  ) {

    const food =
      randomItem(
        LUNCH_FOODS
      );

    message =
      "そろそろお昼ごはんさ☆\n" +
      "今日のランチ候補は……\n" +
      "「" +
      food +
      "」！\n" +
      "さあ、午後も華麗にいこうじゃないか☆";

  }

  // ----------------------------------------------------------
  // 夕食 19:10
  // ----------------------------------------------------------

  else if (
    hour ===
      SCHEDULE.DINNER.hour &&
    minute ===
      SCHEDULE.DINNER.minute
  ) {

    const food =
      randomItem(
        DINNER_FOODS
      );

    message =
      "こんばんは、親友☆\n" +
      "夕食の時間だね！\n" +
      "今日の候補は「" +
      food +
      "」さ☆\n" +
      "お腹を満たして、夜を楽しもうじゃないか！";

  }

  // ----------------------------------------------------------
  // おやすみ 21:30
  // ----------------------------------------------------------

  else if (
    hour ===
      SCHEDULE.GOODNIGHT.hour &&
    minute ===
      SCHEDULE.GOODNIGHT.minute
  ) {

    message =
      "そろそろおやすみの時間さ☆\n" +
      "今日も一日お疲れさま！\n" +
      "明日もボクと一緒に、完璧な一日にしようじゃないか☆";

  }

  // ----------------------------------------------------------
  // 通知対象外
  // ----------------------------------------------------------

  if (!message) {

    console.log(
      "現在時刻は通知対象ではありません。"
    );

    return;

  }

  // ----------------------------------------------------------
  // LINEユーザー一覧を取得
  // ----------------------------------------------------------

  const users =
    await getRegisteredLineUsers(
      env
    );

  if (
    !users.length
  ) {

    console.log(
      "登録済みLINEユーザーがいません。"
    );

    return;

  }

  // ----------------------------------------------------------
  // 全ユーザーへ送信
  // ----------------------------------------------------------

  for (
    const userId of users
  ) {

    try {

      await pushLineMessage(

        userId,

        message,

        env.FLAULY_LINE_CHANNEL_ACCESS_TOKEN

      );

      console.log(
        "自動通知送信成功:",
        userId
      );

    } catch (error) {

      console.log(
        "自動通知送信失敗:",
        userId,
        error
      );

    }

  }

  // ----------------------------------------------------------
  // 二重送信防止フラグ
  // ----------------------------------------------------------

  await env.FLAULY_KV.put(

    sentKey,

    "1",

    {
      expirationTtl:
        60 * 60 * 24 * 2
    }

  );

}


// ============================================================
// LINEユーザー一覧
// ============================================================

async function getRegisteredLineUsers(
  env
) {

  if (
    !env.FLAULY_KV
  ) {

    return [];

  }

  const users = [];

  let cursor =
    undefined;

  try {

    do {

      const result =
        await env.FLAULY_KV.list({
          prefix: "line_user:",
          cursor
        });

      for (
        const key
        of result.keys
      ) {

        const userId =
          key.name.replace(
            "line_user:",
            ""
          );

        if (userId) {

          users.push(
            userId
          );

        }

      }

      cursor =
        result.list_complete
          ? undefined
          : result.cursor;

    } while (cursor);

  } catch (error) {

    console.log(
      "LINE user list error:",
      error
    );

  }

  return [
    ...new Set(users)
  ];

}


// ============================================================
// 配列からランダム選択
// ============================================================

function randomItem(
  array
) {

  if (
    !Array.isArray(array) ||
    array.length === 0
  ) {

    return "";

  }

  return array[
    Math.floor(
      Math.random() *
      array.length
    )
  ];

}
