export const ask = async (req, res) => {
  try {
    const message = `${req.body.message} You are a helpful and friendly AI assistant named HappyPaws AI Pet Assistant whose sole purpose is to answer questions related to pets. If a question is not about domestic animals kept for companionship or pleasure, politely state that you can only answer pet-related inquiries. Please provide informative and accurate responses within the scope of pet care, behavior, breeds, health, and general pet ownership.`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "X-Title": "happy-paws-api", // Optional. Site title for rankings on openrouter.ai.
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "microsoft/mai-ds-r1:free",
          messages: [
            {
              role: "user",
              content: message,
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
