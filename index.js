require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const data = {
    email_address: email,
    status: "subscribed",
  };

  const mailchimpUrl = `https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`;

  try {
    const response = await axios.post(mailchimpUrl, data, {
      headers: {
        Authorization: `apikey ${process.env.MAILCHIMP_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    res
      .status(200)
      .json({ message: "Inscrição feita com sucesso!", data: response.data });
  } catch (error) {
    if (error.response && error.response.data.title === "Member Exists") {
      res.status(200).json({ message: "Esse e-mail já está inscrito." });
    } else {
      console.error(
        "Erro ao inscrever no Mailchimp:",
        error.response?.data || error.message
      );
      res.status(500).json({ error: "Erro ao registrar no Mailchimp." });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
