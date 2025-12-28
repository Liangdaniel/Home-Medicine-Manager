
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '未配置 DeepSeek API Key' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: '请提供药品名称或描述' });
  }

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个专业的药剂师。请根据用户提供的药品名称或简短描述，推断出药品的详细信息。必须以 JSON 格式输出，包含字段：name(通用名), brand(品牌), ingredients(成分), specs(规格), indications(适应症), usage(用法用量), expiryDate(若用户未提供日期，请设为空字符串)。请确保信息符合临床常识，并尽可能精准补全。"
          },
          {
            role: "user",
            content: `分析以下药品内容：${text}`
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'DeepSeek API 调用失败');

    const result = JSON.parse(data.choices[0].message.content);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("DeepSeek Error:", error);
    return res.status(500).json({ error: 'AI 分析失败', details: error.message });
  }
}
