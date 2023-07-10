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

app.get("/api/names/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Names!A:I",
    });
    // res.json(result.data.values);

    const timesRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Times!A:I",
    });
    const timesData = timesRes.data.values;
    const data = result.data.values;

    // NAMES SHEET
    const codeColumnIndex = 1; // Replace with the desired column index (0-based)

    // TIMES SHEET
    const programColumnIndex = 1; // Replace with the desired column index (0-based)
    const groupColumnIndex = 4; // Replace with the desired column index (0-based)

    const searchValue = code; // Replace with the desired value to search for

    const rowData = data.find((row) => row[codeColumnIndex] === searchValue);
    const rowIndex = data.indexOf(rowData);

    const rowTime = timesData.find(
      (row) =>
        row[programColumnIndex] === rowData[5] &&
        row[groupColumnIndex] === rowData[6]
    );
    if (rowData && rowTime) {
      console.log(rowData);
      console.log(rowTime);

      res.json({
        rowId: rowIndex + 1,
        code: rowData[1],
        name: rowData[2],
        dept: rowData[3],
        company: rowData[4],
        program: rowData[5],
        group: rowData[6],
        mobile: rowData[7] || "",
        email: rowData[8] || "",
        startDate: rowTime[5],
        endDate: rowTime[6],
        days: rowTime[7],
        time: rowTime[8],
      });
    } else {
      res.json({ error: "Error" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data from Google Sheets");
  }
});

app.patch("/api/names/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const { mobile, email, rowId } = req.body;
    // Replace with the row number you want to update
    const range = `Names!H${rowId}:I${rowId}`;

    // Prepare the updated values for specific columns
    const values = [
      [
        mobile, // 7 Mobile
        email,
      ], // 8 Email
    ];
    // Update the row data with PATCH
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED", // Optional, determines how the input values are interpreted
      resource: { values },
    });

    console.log("Row data updated with PATCH:", response.data);
    res.status(200).send("Row data updated");
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

app.get("/api", async (req, res) => {
  try {
    res.send("Hello !!!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating data in Google Sheets");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
