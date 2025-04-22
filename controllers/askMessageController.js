export const ask = async (req, res) => {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "microsoft/mai-ds-r1:free",
          messages: [
            {
              role: "user",
              content: req.body.message,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    res.status(200).json({
      status: "success",
      responseMessage:
        data?.choices[0]?.message?.content || "Something went wrong",
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({
      status: "failed",
      message: error,
    });
  }
};
