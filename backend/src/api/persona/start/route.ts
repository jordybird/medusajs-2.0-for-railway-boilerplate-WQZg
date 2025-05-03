import axios from "axios";

export default async function startInquiry(req, res) {
  const { customerId } = req.body;           // comes from frontend / session

  const { data: inquiry } = await axios.post(
    "https://api.withpersona.com/inquiry",
    {
      templateId: process.env.PERSONA_TEMPLATE_ID,
      environmentId: process.env.PERSONA_ENV_ID, // sandbox env_xxx
      referenceId: customerId,
    },
    {
      auth: { username: process.env.PERSONA_SECRET_KEY, password: "" },
    }
  );

  const link = `https://withpersona.com/verify?inquiry-id=${inquiry.id}`;
  res.json({ link });
}
