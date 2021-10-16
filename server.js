const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "build")));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/getLinkList/:searchTerm", async (req, res) => {
  const { searchTerm } = req.params;
  res.send(await getHtml(`https://www.healmedelicious.com/?s=${searchTerm}`));
});

const loadHtml = async (url) => {
  try {
    //This is how to get the website:
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    return $;
  } catch (err) {
    console.log(err.message);
  }
};

const getHtml = async (url) => {
  const $ = await loadHtml(url);
  const healMeDeliciousLinks = $(".entry-header");
  const linkArr = [];
  healMeDeliciousLinks.each((index, value) => {
    const link = $(value).find("a.entry-image-link").attr("href");
    const imgSrc = $(value)
      .find(".entry-image-link")
      .find("img")
      .attr("data-src");
    const name = $(value).find(".entry-title-link").text();
    linkArr.push({ link, imgSrc, name });
  });
  const testValue = $(".entry-header a").attr("href");
  console.log({ linkArr });
  return linkArr;
};

app.listen((port = 5000), () => {
  console.log(`Listening on port ${port}`);
});
