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

    const { data: mentomResponseData } = await mentomApi.post("/api/gateway/hosted-form", hostedFormPayload);

    // Validate the response from Mentom API
    if (typeof mentomResponseData !== 'object' || mentomResponseData === null || !mentomResponseData.url) {
      console.error("Unexpected response from Mentom API:", mentomResponseData);
      // It's good practice to avoid sending the raw mentomResponseData to the client if it's unexpected HTML
      throw new Error("Invalid or unexpected response received from payment gateway.");
    }

    res.status(200).json(mentomResponseData);

  } catch (error) {
    console.error("Error generating Mentom Hosted Form:", error.message); // Log the error message
    // Check if the error is from Axios and contains response data from Mentom
    if (axios.isAxiosError(error) && error.response) {
      console.error("Axios error response from Mentom:", error.response.data);
      // Send a more specific error message if possible, or a generic one
      // Avoid sending raw error.response.data to client unless sanitized
      res.status(500).json({ message: "Error communicating with payment gateway. Please try again later." });
    } else {
      // For other types of errors, use the error message or a generic one
      res.status(500).json({ message: error.message || "An unexpected error occurred while generating the Hosted Form." });
    }
  }
}
