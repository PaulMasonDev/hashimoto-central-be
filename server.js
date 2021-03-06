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
  res.send(
    await getHtml(`https://www.healmedelicious.com/page/1/?s=${searchTerm}`)
  );
});

app.put("/hmd/generateCondensedRecipe", async (req, res) => {
  const { link } = req.body;
  res.send(await generateCondensedRecipe(link));
});

const extractPageNumber = (url) => {
  regex = /page\/\d+/;
  const urlPageSection = url.match(regex)[0];
  return parseInt(urlPageSection.match(/\d+/));
};

const incrementPage = (url) => {
  return extractPageNumber(url) + 1;
};
const loadHtml = async (url) => {
  // console.log(incrementPage(url));
  // let newUrl = url;
  // let status = 200;
  // while ((status = 200)) {
  //   try {
  //     const response = await axios.get(newUrl);
  //     console.log(response.status);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

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
  const sourceUrl = "healmedelicious.com";
  const sourceName = "Heal Me Delicious";
  const healMeDeliciousLinks = $(".entry-header");
  const linkArr = [];
  healMeDeliciousLinks.each((index, value) => {
    const link = $(value).find("a.entry-image-link").attr("href");
    const imgSrc = $(value).find(".entry-image-link").find("img").attr("src");
    const name = $(value).find(".entry-title-link").text();
    linkArr.push({ link, imgSrc, name, sourceUrl, sourceName });
  });
  console.log({ linkArr });
  return linkArr;
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
