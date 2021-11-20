const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

app.use(express.json());

//TODO: REFACTOR server.js with routes,
//CREATE NEW ROUTES FOR DIFFERENT WEBSITES
app.get("/hmd/getLinkList/:searchTerm", async (req, res) => {
  const { searchTerm } = req.params;
  res.send(await getHtml(`https://www.healmedelicious.com/?s=${searchTerm}`));
});

app.put("/hmd/generateCondensedRecipe", async (req, res) => {
  const { link } = req.body;
  res.send(await generateCondensedRecipe(link));
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

const generateCondensedRecipe = async (url) => {
  const $ = await loadHtml(url);
  const ingredients = $(".tasty-recipe-ingredients li");
  const ingredientsArr = [];
  ingredients.each((index, value) => {
    //console.log($(value).text());
    ingredientsArr.push($(value).text());
  });
  const instructions = $(".tasty-recipe-instructions li");
  const instructionsArr = [];
  instructions.each((index, value) => {
    instructionsArr.push($(value).text());
  });
  return { ingredients: ingredientsArr, instructions: instructionsArr };
};

const getHtml = async (url) => {
  const $ = await loadHtml(url);
  const source = "healmedelicious.com";
  const healMeDeliciousLinks = $(".entry-header");
  const linkArr = [];
  healMeDeliciousLinks.each((index, value) => {
    const link = $(value).find("a.entry-image-link").attr("href");
    const imgSrc = $(value).find(".entry-image-link").find("img").attr("src");
    const name = $(value).find(".entry-title-link").text();
    linkArr.push({ link, imgSrc, name, source });
  });
  return linkArr;
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
