/*
 * Name: Mo Young
 *
 * This is the server-side aspect of the perfume E-commerce website. It contains
 * the API endponts that grabs or changes the contents inside of the perfumeDB database. It also
 * manages the cookies of the website.
 */

'use strict';

const express = require('express');
const app = express();

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

const multer = require('multer');
const cookieParser = require('cookie-parser');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());
app.use(cookieParser());

const INVALID_PARAM_ERROR = 400;
const SERVER_ERROR = 500;

// app.get("/hi", async function(req, res) {
//   console.log("hello");
// });
// This endpoint grabs all the items in the perfumes table (inventory)
app.get("/all", async function(req, res) {
  try {
    let all = await getAll();
    res.json(all);
  } catch (err) {
    res.status(SERVER_ERROR)
      .send("An error occurred on the server. Try again later.");
    console.log(err);
  }
});

// This endpoint allows the user to login
app.post("/login", async function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  if (username && password) {
    try {
      let loginInfo = await checkUsername(username);
      if (loginInfo) {
        if (password === loginInfo["password"]) {
          res.cookie("username", loginInfo["username"]);
          res.cookie("loginStatus", true);
          res.json(loginInfo["user_id"]);
        } else {
          res.status(INVALID_PARAM_ERROR).type("text")
            .send("Password not matching");
        }
      } else {
        res.status(INVALID_PARAM_ERROR).type("text")
          .send("Username not found");
      }
    } catch (err) {
      res.status(SERVER_ERROR).type("text")
        .send("An error occurred on the server. Try again later.");
    }
  } else {
    res.status(INVALID_PARAM_ERROR).type("text")
      .send("Missing one or more of the required params.");
  }
});

// this endpoint grabs the user ID based on username
app.get("/user/:username", async function(req, res) {
  let username = req.params.username;
  try {
    let userInfo = await getUserInfo(username);
    if (userInfo) {
      res.json(userInfo["user_id"]);
    } else {
      res.status(INVALID_PARAM_ERROR).type("text")
        .send("Missing one or more of the required params.");
    }
  } catch (err) {
    res.status(SERVER_ERROR).type("text")
      .send("An error occurred on the server. Try again later.");
  }
});

// This endpoint allows the user to log out
app.get("/logout", function(req, res) {
  res.clearCookie("username");
  res.clearCookie("loginStatus");
  res.type("text")
    .send("Logged out");
});

// This endpoint grabs the info of a perfume based on its ID     // IM ON THIS SECTION
app.get("/perfume/:id", async function(req, res) {
  let perfumeid = req.params.id;
  try {
    let perfume = await getPerfume(perfumeid);
    res.json(perfume);
  } catch (err) {
    res.status(SERVER_ERROR).type("text")
      .send("An error occurred on the server. Try again later.");
  }
});

// This endpoint allows the user to "buy" item(s)
app.get("/buy", async function(req, res) {
  if (req.cookies["loginStatus"] === "true") {
    try {
      let cart = await getCart();
      if (cart.length === 0) {
        res.status(INVALID_PARAM_ERROR).type("text")
          .send("Empty Cart!!!");
      } else {
        let check = await checkInventory(cart);
        if (check === "error") {
          await emptyCart();
          res.status(INVALID_PARAM_ERROR).type("text")
            .send("Sold out!!!");
        } else {
          await updateInventory(cart);
          let confirmation = await confirmOrder(cart, req.cookies["username"]);
          await emptyCart();
          res.json(confirmation);
        }
      }
    } catch (err) {
      res.status(SERVER_ERROR).type("text")
        .send("An error occurred on the server. Try again later.");
    }
  } else {
    res.status(INVALID_PARAM_ERROR).type("text")
      .send("User is not logged in");
  }
});

// This endpoint allows the user to filter and search for an item
app.post("/search", async function(req, res) {
  if (req.body.search) {
    try {
      let searchResult = await searchFunc(req.body.search);
      res.json(searchResult);
    } catch (err) {
      res.status(SERVER_ERROR).type("text")
        .send("An error occurred on the server. Try again later.");
    }
  } else {
    res.status(INVALID_PARAM_ERROR).type("text")
      .send("Missing one or more of the required params.");
  }
  // if (req.body.search && req.body.filter) {
  //   try {
  //     let results = await searchAndFilter(req.body.search, req.body.filter);
  //     res.json(results);
  //   } catch (err) {
  //     res.status(SERVER_ERROR).type("text")
  //       .send("An error occurred on the server. Try again later.");
  //   }
  // } else if (req.body.search) {
  //   try {
  //     let searchResult = await searchFunc(req.body.search);
  //     res.json(searchResult);
  //   } catch (err) {
  //     res.status(SERVER_ERROR).type("text")
  //       .send("An error occurred on the server. Try again later.");
  //   }
  // } else if (req.body.filter) {
  //   try {
  //     let filterResult = await filterFunc(req.body.filter);
  //     res.json(filterResult);
  //   } catch (err) {
  //     res.status(SERVER_ERROR).type("text")
  //       .send("An error occurred on the server. Try again later.");
  //   }
  // } else {
  //   res.status(INVALID_PARAM_ERROR).type("text")
  //     .send("Missing one or more of the required params.");
  // }
});

// This endpoint grabs the purchase history of a user
app.get("/history", async function(req, res) {
  if (req.cookies["loginStatus"] === "true") {
    try {
      let username = req.cookies["username"];
      let getID = await getUserInfo(username);
      let historyResult = await getHistory(getID["user_id"]);
      res.json(historyResult);
    } catch (err) {
      res.status(SERVER_ERROR).type("text")
        .send("An error occurred on the server. Try again later.");
    }
  } else {
    res.status(INVALID_PARAM_ERROR).type("text")
      .send("User is not logged in");
  }
});

// This endpoint allows a user to create a new account
app.post("/newUser", async function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  let email = req.body.email;
  if (username && password && email) {
    try {
      let checkUserExist = await getUserInfo(username);
      if (checkUserExist) {
        res.status(INVALID_PARAM_ERROR).type("text")
          .send("Account already made");
      } else {
        await createAccount(username, password, email);
        res.type("text")
          .send(username + " account created!!!");
      }
    } catch (err) {
      res.status(SERVER_ERROR).type("text")
        .send("An error occurred on the server. Try again later.");
    }
  } else {
    res.status(INVALID_PARAM_ERROR).type("text")
      .send("Incorrect or missing one or more of the required params.");
  }
});

// This endpoint allows the user to add item(s) to a cart
app.post("/cart", async function(req, res) {
  let perfumeid = req.body.perfumeid;
  let quantity = req.body.quantity;
  if (perfumeid && quantity) {
    try {
      await addCart(perfumeid, quantity);
      res.type("text")
        .send("Succesfully added to cart");
    } catch (err) {
      res.status(SERVER_ERROR).type("text")
        .send("An error occurred on the server. Try again later.");
    }
  } else {
    res.status(INVALID_PARAM_ERROR).type("text")
      .send("Missing one or more of the required params.");
  }
});

// This endpoint grabs all item(s) in a cart
app.get("/cart/all", async function(req, res) {
  try {
    let cartAll = await getCart();
    res.json(cartAll);
  } catch (err) {
    res.status(SERVER_ERROR).type("text")
      .send("An error occurred on the server. Try again later.");
  }
});

// This endpoint clears the cart
app.get("/cart/clear", async function(req, res) {
  try {
    await emptyCart();
    res.type("text").send("Cleared Cart");
  } catch (err) {
    res.status(SERVER_ERROR).type("text")
      .send("An error occurred on the server. Try again later.");
  }
});

app

/**
 * This function checks if a user already exist
 * @param {string} username - username of user
 * @returns {Promise} - contains info of username
 */
async function checkUsername(username) {
  let qry = "SELECT * FROM users WHERE username =?";
  let db = await getDBConnection();
  let loginInfo = await db.get(qry, username);
  await db.close();
  return loginInfo;
}

/**
 * This function searches for an item in the database
 * @param {string} search - search input by user
 * @returns {Array} - contains result of search
 */
async function searchFunc(search) {
  let qry = "SELECT * FROM perfumes WHERE name LIKE ? OR company LIKE ? OR description LIKE ?";
  let db = await getDBConnection();
  let searchParam = "%" + search + "%";
  let searchResult = await db.all(qry, [searchParam, searchParam, searchParam]);
  await db.close();
  return searchResult;
}

/**
 * This function filters for an item in the database
 * @param {string} filter - filter input by user
 * @returns {Array} - contains result of filtering
 */
async function filterFunc(filter) {
  let qry = "SELECT * FROM perfumes WHERE size = ?"; // CHANGE THIS LATER TOO // MIGHT need to convert string to numeric later
  let db = await getDBConnection();
  let filteredResult = await db.all(qry, filter.toLowerCase());
  await db.close();
  return filteredResult;
}

/**
 * This function filters and searches for items in the database
 * @param {string} search - search input by user
 * @param {string} filter - filter input by user
 * @returns {Array} - contains result after filtering and searching
 */
async function searchAndFilter(search, filter) { //CHANGE THIS LATER TOO
  let qry = "SELECT * FROM perfumes WHERE size = ? AND " +
  "(name LIKE ? OR company LIKE ? OR description LIKE ?)";
  let db = await getDBConnection();
  let searchParam = "%" + search + "%";
  let filterParam = filter.toLowerCase();
  let result = await db.all(qry, [filterParam, searchParam, searchParam, searchParam]);
  await db.close();
  return result;
}

/**
 * This function grabs information of all perfumes. It contains no parameters
 * @returns {Array} - contains information of all perfumes
 */
async function getAll() {
  let qry = "SELECT perfume_id, name, price, size, company, image FROM perfumes ORDER BY size";
  let db = await getDBConnection();
  let perfumes = await db.all(qry);
  await db.close();
  return perfumes;
}

/**
 * This function grabs the perfume info based on its ID
 * @param {number} perfumeID - ID of perfume
 * @returns {Promise} - contains info of perfumes
 */
async function getPerfume(perfumeID) {
  let db = await getDBConnection();
  let qry = "SELECT * FROM perfumes WHERE perfume_id =?";
  let perfumeInfo = await db.get(qry, perfumeID);
  await db.close();
  return perfumeInfo;
}

/**
 * This function allows the user to add item(s) to cart. It contains no return statements.
 * @param {number} perfumeID - ID of perfume
 * @param {number} quantity - number of item(s)
 */
async function addCart(perfumeID, quantity) {
  let qry = "INSERT INTO cart (perfume_id, quantity) VALUES (?, ?)";
  let db = await getDBConnection();
  await db.run(qry, [perfumeID, quantity]);
  await db.close();
}

/**
 * This function allows the user to create an account. It contains no return statements.
 * @param {string} username - contains username
 * @param {string} password - contain password
 * @param {string} email - contains email
 */
async function createAccount(username, password, email) {
  let qry = "INSERT INTO users (username, password, email) VALUES (?, ?, ?)";
  let db = await getDBConnection();
  await db.run(qry, [username, password, email]);
  await db.close();
}

/**
 * This function allows user to access purchase history
 * @param {number} userID - contains user ID
 * @returns {Array} - contains history information
 */
async function getHistory(userID) {
  let qry = "SELECT purchase_id, user_id, purchase_history.perfume_id, purchase_history.quantity, " +
    "date, name, price, size, description, company FROM purchase_history, perfumes " +
    "WHERE purchase_history.perfume_id = perfumes.perfume_id AND user_id =? ORDER BY date DESC";
  let db = await getDBConnection();
  let purchaseHistory = await db.all(qry, userID);
  await db.close();
  return purchaseHistory;
}

/**
 * This function grabs the user's info
 * @param {string} username - contains username
 * @returns {Promise} - contains user's info
 */
async function getUserInfo(username) {
  let qry = "SELECT user_id FROM users WHERE username =?";
  let db = await getDBConnection();
  let userInfo = await db.get(qry, username);
  await db.close();
  return userInfo;
}

/**
 * This function clears the cart table. It contains no parameters or return statements.
 */
async function emptyCart() {
  let qry = "DELETE FROM cart";
  let db = await getDBConnection();
  await db.exec(qry);
  await db.close();
}

/**
 * This function creates the confirmation number and updates the purchase history
 * @param {Array} cart - contains all item(s)
 * @param {string} username - contains username
 * @returns {string} - contains confirmation number
 */
async function confirmOrder(cart, username) {
  const max = 999999;
  let numericRand = Math.floor(Math.random() * (max) + 1);
  let alphabetRand = generateRandomWord(2);
  let confirmID = alphabetRand + numericRand;
  let getConfirm = await generateConfirmation(confirmID);
  let getID = await getUserInfo(username);
  for (let i = 0; i < cart.length; i++) {
    let perfumeID = cart[i]["perfume_id"];
    let quantity = cart[i]["quantity"];
    await updateHistory(getConfirm, getID["user_id"], perfumeID, quantity);
  }
  return getConfirm;
}

/**
 * This function updates the inventory in the perfumes table. It contains no return statements.
 * @param {Array} cart - contains all item(s)
 */
async function updateInventory(cart) {
  let db = await getDBConnection();
  let qry = "SELECT quantity FROM perfumes WHERE perfume_id =?";
  let updateQRY = "UPDATE perfumes SET quantity = quantity - ? WHERE perfume_id =?";
  for (let i = 0; i < cart.length; i++) {
    let perfumeID = cart[i]["perfume_id"];
    let quantity = cart[i]["quantity"];
    let perfumeQuantity = await db.get(qry, perfumeID);
    if (perfumeQuantity["quantity"] !== -1) {
      await db.run(updateQRY, [quantity, perfumeID]);
    }
  }
  await db.close();
}

/**
 * This function checks if the item(s) are in stock
 * @param {Array} cart - contains all item(s)
 * @returns {string} - checks if there are any errors or not
 */
async function checkInventory(cart) {
  let qry = "SELECT quantity FROM perfumes WHERE perfume_id =?";
  let db = await getDBConnection();
  let check = "";
  for (let i = 0; i < cart.length; i++) {
    let perfumeID = cart[i]["perfume_id"];
    let quantity = cart[i]["quantity"];
    let perfumeQuantity = await db.get(qry, perfumeID);
    if ((perfumeQuantity["quantity"] < quantity) && (perfumeQuantity["quantity"] !== -1)) {
      check = "error";
    }
  }
  await db.close();
  return check;
}

/**
 * This function updates the user's purchase history. It has no return statements
 * @param {number} confirmID - contain confirmation number
 * @param {number} userID - contains user's ID
 * @param {number} perfumeID - contains perfume's ID
 * @param {number} quantity - contains number of item(s)
 */
async function updateHistory(confirmID, userID, perfumeID, quantity) {
  let qry = "INSERT INTO purchase_history (purchase_id, user_id, perfume_id, quantity) " +
    "VALUES (?, ?, ?, ?)";
  let db = await getDBConnection();
  await db.run(qry, [confirmID, userID, perfumeID, quantity]);
  await db.close();
}

/**
 * This function grabs the item(s) in the cart. It has no parameters.
 * @returns {Array} - contains item(s) in the cart
 */
async function getCart() {
  let qry = "SELECT cart.perfume_id, cart.quantity, name, price, company, size FROM cart, perfumes " +
  "WHERE cart.perfume_id = perfumes.perfume_id";
  let db = await getDBConnection();
  let cart = await db.all(qry);
  await db.close();
  return cart;
}

/**
 * This function generates the confirmation code.
 * @param {string} confirmID - contains confirmation number
 * @returns {string} - contains confirmation number
 */
async function generateConfirmation(confirmID) {
  let qry = "SELECT * FROM purchase_history WHERE purchase_id =?";
  let db = await getDBConnection();
  let resultConfirm = await db.get(qry, confirmID);
  await db.close();
  if (!resultConfirm) {
    return confirmID;
  }
  const max = 999999;
  let numericRand = Math.floor(Math.random() * (max) + 1);
  let aplhabetRand = generateRandomWord(2);
  let newConfirmID = aplhabetRand + numericRand;
  return generateConfirmation(newConfirmID);
}

/**
 * This function generates a random 2 digit word for the confirmation code
 * @param {number} length - contains length of word
 * @returns {string} - contains random word
 */
function generateRandomWord(length) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return result;
}

/**
 * Establishes a database connection to a database and returns the database object.
 * Any errors that occur during connection should be caught in the function
 * that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'perfumeDB.db',
    driver: sqlite3.Database
  });
  return db;
}

const port = 8000;
app.use(express.static('public'));
const PORT = process.env.PORT || port;
app.listen(PORT);