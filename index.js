const { google } = require("googleapis");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const format = require("date-format");
const app = express();
const port = process.env.PORT || 3030;
app.use(cors());
app.use(bodyParser.json());

const auth = new google.auth.GoogleAuth({
  keyFile: "sheetAPI.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

const spreadsheetId = "1oprd648ayO09fO-m9FjJHj0xFyNgQpv_UGWdIsg7dZ8";

// Define routes for CRUD operations
app.get("/api/courses", async (req, res) => {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Courses!A:H",
    });
    res.json(result.data.values);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data from Google Sheets");
  }
});

app.post("/api/form", async (req, res) => {
  const { name, phone, email, date } = req.body;
  try {
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Form!A:D",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[name, phone, email, format("dd/MM/yyyy hh:mm", new Date())]],
      },
    });
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding data to Google Sheets");
  }
});

app.put("/api/data/:rowId", async (req, res) => {
  const { rowId } = req.params;
  const { name, age } = req.body;
  try {
    const result = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!A${rowId}:B${rowId}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[name, age]],
      },
    });
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating data in Google Sheets");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
