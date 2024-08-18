import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { phone } = req.body;
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      const response = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
        params: {
          authorization:
            "RPjGU3qCngTObpvorWXIys98wKFf270aZE1YuB5ekVxmDchNJLL1nauD4hlSBHYeNkwcKgxEbfGQOyT0",
          variables_values: otp,
          route: "otp",
          numbers: phone,
        },
        headers: {
          "cache-control": "no-cache",
        },
      });

      res.status(200).json({ success: true, otp });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ success: false, error: "Failed to send OTP" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
