import axios from "axios";

export async function POST(req, res) {
  try {
    // Get Mentom options from Medusa configuration
    const mentomOptions = req.scope.resolve("mentomPaymentProviderOptions");
    const { apiKey, terminalId, baseUrl } = mentomOptions;

    // Extract necessary data from the request body (sent from storefront)
    const { amount, externalId, returnUrl, ...rest } = req.body as {
      amount: number;
      externalId: string;
      returnUrl: string;
      [key: string]: any;
    };

    if (!amount || !externalId || !returnUrl) {
      return res.status(400).json({ message: "Missing required parameters: amount, externalId, returnUrl" });
    }

    const mentomApi = axios.create({
      baseURL: baseUrl?.replace(/\/+$/, "") ?? "https://gateway.mentomdashboard.com",
      timeout: 15000,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const hostedFormPayload = {
      terminal: { id: terminalId },
      amount,
      externalId,
      returnUrl,
      ...rest, // Include any other parameters from the storefront
    };

    const { data } = await mentomApi.post("/api/gateway/hosted-form", hostedFormPayload);

    res.status(200).json(data);

  } catch (error) {
    console.error("Error generating Mentom Hosted Form:", error);
    res.status(500).json({ message: "Error generating Hosted Form" });
  }
}
