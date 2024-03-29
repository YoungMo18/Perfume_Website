/*
 * Name: Mo Young
 *
 * This is the client side javascript file for the Perfume e-commerce website. It calls the app.js
 * server in order to access a database of information used for the following main functionality:
 * 1. Account login and creation
 * 2. Displaying information about perfumes available and searching/filtering through them
 * 3. Checking out perfumes in a bulk (cart) order
 * 4. Viewing the order history for a signed in user
 */
'use strict';

(function() {
  window.addEventListener('load', init);

  /**
   * Initializes the base state of the site and many event listeners.
   * It contains no parameters or return statements.
   */
  async function init() {
    homeView();
    qs("#cart-btn").addEventListener("click", cartView);
    id("login-form").addEventListener("submit", requestLogin);
    id("home-btn").addEventListener("click", homeView);
    //id("toggle-display-btn").addEventListener("click", toggleDisplay);
    id("acc-btn").addEventListener("click", accountView);
    fetchAllPerfumes();
    id("store-btn").addEventListener("click", storeView);
    id("search-form").addEventListener("submit", conductSearch);
    id("sign-up-btn").addEventListener("click", createAccView);
    if (window.sessionStorage.getItem("loggedIn") === "true") {
      id("acc-btn").textContent = "Account";
      let userCookie = await cookieStore.get("username");
      id("logged-in-message").textContent = "Hello, " + userCookie.value;
      id("logout-btn").classList.remove("hidden");
    }
    id("logout-btn").addEventListener("click", logout);
    id("create-acc-form").addEventListener("submit", submitNewAcc);
    id("add-to-cart-form").addEventListener("submit", addItemToCart);
    id("confirm-btn").addEventListener("click", attemptCheckout);
    id("clear-cart-btn").addEventListener("click", clearCart);
    // id("confirm-btn").addEventListener("click", showSubmitOptions);
    // id("cancel-btn").addEventListener("click", cancelSubmissionOptions);
  }

  // /**
  //  * Shows the cart submission options (cancel or submit).
  //  * This function contains no parameters or return statements.
  //  */
  // function showSubmitOptions() {
  //   id("cart-place-order").classList.remove("hidden");
  // }

  // /**
  //  * Hides the cart submission options.
  //  * This function contains no parameters or return statements.
  //  */
  // function cancelSubmissionOptions() {
  //   id("cart-place-order").classList.add("hidden");
  // }

  /**
   * Fetches all perfumes in the database
   * It contains no parameters or return statements.
   */
  function fetchAllPerfumes() {
    fetch("/all")
      .then(statusCheck)
      .then(resp => resp.json())
      .then(populateStore)
      .catch(handleError);
  }

  /**
   * Populates store with all of the perfumes given by the promise and their information. This function
   * has no return statement.
   * @param {Promise} res - A JSON promise containing info about a set of perfumes
   */
  function populateStore(res) {
    id("main-holder").innerHTML = "";
    res.forEach((e) => {
      let div = document.createElement("div");
      let img = document.createElement("img");
      let companyName = document.createElement("p");
      let productName = document.createElement("p");
      let price = document.createElement("p");
      companyName.setAttribute("id", "cardTitle");
      companyName.textContent = e.company;
      productName.textContent = e.name + " (" + e.size + " oz)";
      productName.setAttribute("id", "cardText");
      price.textContent = "$" + e.price;
      price.setAttribute("id", "cardText");
      img.src = e.image;
      img.alt = e.name + " image";
      div.appendChild(img);
      div.appendChild(companyName);
      div.appendChild(productName);
      div.appendChild(price);
      div.classList.add("card");
      div.id = e.perfume_id;
      div.addEventListener("click", fetchProductInfo);
      id("main-holder").appendChild(div);
    });
  }

  /**
   * Obtains information about a perfume with an id matching the id of the html element which was
   * clicked to call this function. This function will only ever be called as a result of a click
   * event listener.
   * This function contains no parameters or return statements.
   */
  function fetchProductInfo() {
    fetch("/perfume/" + this.id)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(productView)
      .catch(handleError);
  }

  function homeView() {
    document.body.style.backgroundImage = "url('img/wallpaper4.jpg')";
    id("home").classList.remove("hidden");
    id("store").classList.add("hidden");
    id("login").classList.add("hidden");
    id("cart").classList.add("hidden");
    id("product").classList.add("hidden");
    id("create-acc").classList.add("hidden");
    id("error-msg").classList.add("hidden");
    qs("#checkout-error").classList.add("hidden");
    id("account").classList.add("hidden");
    id("shop-btn").addEventListener("click", storeView);
    // document.body.setAttribute("background-image", "url('img/perfumeWallpaper.jpg')");
  }

  /**
   * Switches the page view to the create account form
   * This function contains no parameters or return statements.
   */
  function createAccView() {
    document.body.style.backgroundImage = "none";
    clearInputs("#create-acc");
    id("home").classList.add("hidden");
    id("store").classList.add("hidden");
    id("login").classList.add("hidden");
    id("cart").classList.add("hidden");
    id("product").classList.add("hidden");
    id("create-acc").classList.remove("hidden");
    qs("#checkout-error").classList.add("hidden");
    id("error-msg").classList.add("hidden");
    id("create-acc-error").textContent = "";
  }

  /**
   * Clears the cart on the server side and updates the client side to reflect the empty cart.
   * This function contains no parameters or return statements.
   */
  function clearCart() {
    fetch("/cart/clear")
      .then(statusCheck)
      .then(resp => resp.text())
      .then(cartView)
      .catch(handleError);
  }

  /**
   * Attempts to check out the items stored in the cart. This is only possible if the user is
   * logged in. If not, the user is prompted to do log in before proceding.
   * This function contains no parameters or return statements.
   */
  function attemptCheckout() {
    if (window.sessionStorage.getItem("loggedIn") === "true") {
      fetch("/buy")
        .then(statusCheck)
        .then(resp => resp.text())
        .then(checkoutMessage)
        .catch(handleCheckoutError);
    } else {
      qs("#login-reminder").classList.remove("hidden");
    }
  }

  /**
   * Briefly displays a message post-checkout before returning the user to the store page
   * This function contains no parameters or return statements.
   */
  function checkoutMessage() {
    // qs("#buy-btn").classList.add("hidden");
    // qs("#cancel-btn").classList.add("hidden");
    qs("#checkout-message").classList.remove("hidden");
    setTimeout(function() {
      qs("#checkout-message").classList.add("hidden");
      // qs("#buy-btn").classList.remove("hidden");
      // qs("#cancel-btn").classList.remove("hidden");
      storeView();
    }, 500);
  }

  /**
   * Displays an error message matching the response from the server. This function has no return
   * statement.
   * @param {Error} err - A text representation of an error sent by the server
   */
  function handleCheckoutError(err) {
    qs("#checkout-error").classList.remove("hidden");
    qs("#checkout-error").textContent = err;
  }

  /**
   * Swaps to a product view containing company, quantity, price, etc. of a perfume.
   * This function has no return statment.
   * @param {Promise} res - A JSON promise containing data about a given perfume
   */
  function productView(res) {
    document.body.style.backgroundImage = "none";
    id("product-quantity-input").classList.remove("hidden");
    id("quantity-label").classList.remove("hidden");
    id("product-img").src = res.image;
    id("product-img").alt = res.name + " image";
    id("product-header").textContent = res.name + " (" + res.size + " oz)";
    id("product-company").textContent = res.company;
    id("product-price").textContent = "$" + res.price;
    id("product-desc").textContent = "Description: " + res.description;
    id("product-quantity-input").value = "1";
    id("product-quantity").textContent = res.quantity === 0 ? "Out of stock" : "Only " +
    res.quantity + " left in stock";
    if (res.quantity === 0) {
      id("product-quantity").textContent = "out of stock";
      hideQuantityInput();
      id("add-to-cart").classList.add("hidden");
    } else if (res.quantity < 0) {
      id("product-quantity").textContent = "E-Perfume";
      hideQuantityInput();
    } else {
      id("product-quantity").textContent = "Only " + res.quantity + " left in stock";
      id("product-quantity-input").max = res.quantity;
      id("add-to-cart").classList.remove("hidden");
    }
    id("home").classList.add("hidden");
    id("product").classList.remove("hidden");
    id("store").classList.add("hidden");
    id("cart").classList.add("hidden");
    id("login").classList.add("hidden");
    id("create-acc").classList.add("hidden");
    id("add-to-cart").value = res.perfume_id;
  }

  /**
   * Hides the quantity input
   * This function contains no parameters or return statements.
   */
  function hideQuantityInput() {
    id("product-quantity-input").classList.add("hidden");
    id("quantity-label").classList.add("hidden");
  }

  /**
   * Passes a perfume id and a quantity to the server for adding to the cart. This function has no
   * return statement.
   * @param {Event} event - The submit event which triggers this function
   */
  function addItemToCart(event) {
    event.preventDefault();
    console.log("test");
    let params = new FormData(id("add-to-cart-form"));
    params.set("perfumeid", qs("#add-to-cart").value);
    fetch("/cart", {method: "POST", body: params})
      .then(statusCheck)
      .then(resp => resp.text())
      .then(addedToCartPopup)
      .catch(handleError);
  }

  /**
   * Temporarily displays confirmation text upon adding an item to the cart
   * This function contains no parameters or return statements.
   */
  function addedToCartPopup() {
    qs("#add-to-cart").classList.add("hidden");
    qs("#cart-confirmation").classList.remove("hidden");
    setTimeout(function() {
      qs("#add-to-cart").classList.remove("hidden");
      qs("#cart-confirmation").classList.add("hidden");
    }, 2000);
  }

  /**
   * Sends a search request to the server. This function has no return statement.
   * @param {Event} event - The submit event which triggers this function
   */
  function conductSearch(event) {
    event.preventDefault();
    if (id("search-bar").value.trim() !== "") {
      let params = new FormData(id("search-form"));
      document.body.style.backgroundImage = "none";
      id("home").classList.add("hidden");
      id("store").classList.remove("hidden");
      id("cart").classList.add("hidden");
      id("login").classList.add("hidden");
      id("product").classList.add("hidden");
      id("create-acc").classList.add("hidden");
      id("account").classList.add("hidden");
      qs("#checkout-error").classList.add("hidden");
      id("error-msg").classList.add("hidden");
      qs("#store h2").textContent = "Search results for '" + id("search-bar").value.trim() + "'";
      clearInputs("#search-form");
      fetch("/search", {method: "POST", body: params})
        .then(statusCheck)
        .then(resp => resp.json())
        .then(populateStore)
        .catch(handleError);
    }

  }

  /**
   * Swaps to the store view and populates it with all perfumes
   * This function contains no parameters or return statements.
   */
  function storeView() {
    document.body.style.backgroundImage = "none";
    id("store").classList.remove("hidden");
    id("home").classList.add("hidden");
    id("cart").classList.add("hidden");
    id("login").classList.add("hidden");
    id("product").classList.add("hidden");
    id("create-acc").classList.add("hidden");
    id("account").classList.add("hidden");
    qs("#checkout-error").classList.add("hidden");
    id("error-msg").classList.add("hidden");
    qs("#store h2").textContent = "All Products";
    fetchAllPerfumes();
  }

  /**
   * Swaps to account view if already logged in, swaps to login page if not
   * This function contains no parameters or return statements.
   */
  async function accountView() {
    if (window.sessionStorage.getItem("loggedIn") === "true") {
      let userCookie = await cookieStore.get("username");
      qs("#account h2").textContent = userCookie.value + "'s Purchase History";
      document.body.style.backgroundImage = "none";
      id("home").classList.add("hidden");
      id("store").classList.add("hidden");
      id("cart").classList.add("hidden");
      id("login").classList.add("hidden");
      id("product").classList.add("hidden");
      id("create-acc").classList.add("hidden");
      qs("#checkout-error").classList.add("hidden");
      id("error-msg").classList.add("hidden");
      qs("#store h2").textContent = "All Products";
      id("account").classList.remove("hidden");
      fetch("/history")
        .then(statusCheck)
        .then(resp => resp.json())
        .then(populateAccHistory)
        .catch(handleError);
    } else {
      clearInputs("#login");
      id("remember-me").checked = false;
      document.body.style.backgroundImage = "none";
      id("home").classList.add("hidden");
      id("store").classList.add("hidden");
      id("cart").classList.add("hidden");
      id("login").classList.remove("hidden");
      id("product").classList.add("hidden");
      id("create-acc").classList.add("hidden");
      qs("#checkout-error").classList.add("hidden");
      id("error-msg").classList.add("hidden");
      id("login-error").textContent = "";
      if (window.localStorage.getItem("username")) {
        id("username").value = window.localStorage.getItem("username");
      }
    }
  }

  /**
   * Fills the account view with a user's purchase history. This function has no return statement.
   * @param {Promise} res - A JSON promise containing information about a user's prior purchases
   */
  function populateAccHistory(res) {
    qs("#history-holder").innerHTML = "";
    res.forEach((e) => {
      if (!qs("#" + e.purchase_id)) {
        let orderContainer = document.createElement("div");
        let orderNumber = document.createElement("h3");
        orderNumber.textContent = "Order #: " + e.purchase_id;
        orderContainer.appendChild(orderNumber);
        orderContainer.id = e.purchase_id;
        orderContainer.classList.add("order-container");
        qs("#history-holder").appendChild(orderContainer);
      }
      let orderObject = document.createElement("div");
      orderObject.classList.add("order-object");
      let orderTitle = document.createElement("p");
      orderTitle.id = "order-title";
      orderTitle.textContent = e.name + " by " + e.company;
      let orderQuantity = document.createElement("p");
      orderQuantity.id = "order-quantity";
      orderQuantity.textContent = "Q: " + e.quantity;
      let orderPrice = document.createElement("p");
      orderPrice.id = "order-price";
      orderPrice.textContent = "$" + (e.price * e.quantity).toFixed(2);
      orderObject.appendChild(orderTitle);
      orderObject.appendChild(orderQuantity);
      orderObject.appendChild(orderPrice);
      orderPrice.classList.add(e.purchase_id);
      qs("#" + e.purchase_id).appendChild(orderObject);
    });
    addHistorySums();
  }

  /**
   * Adds a summative price to the bottom of each transaction in the purchase history
   * This function contains no parameters or return statements.
   */
  function addHistorySums() {
    qsa(".order-container").forEach((order) => {
      let orderTotal = 0;
      let orderID = order.id;
      qsa("." + orderID).forEach((priceText) => {
        orderTotal += parseFloat(priceText.textContent.replace("$", ""));
      });
      // let orderSumObject = document.createElement("div");
      // orderSumObject.classList.add("order-object");
      // order.appendChild(orderSumObject);
      // let orderSumText = document.createElement("p");
      // orderSumText.textContent = "TOTAL PRICE";
      // let orderSumPrice = document.createElement("p");
      // orderSumPrice.textContent = "$" + orderTotal;
      // orderSumObject.appendChild(orderSumText);
      // orderSumObject.appendChild(orderSumPrice);
      addTotal(order, orderTotal);
    });
  }

  /**
   * Swaps between card and list view in the store tab
   * This function contains no parameters or return statements.
   */
  // function toggleDisplay() {
  //   let isListTarget = this.value === "list";
  //   this.textContent = isListTarget ? "Card View" : "List View";
  //   this.value = isListTarget ? "card" : "list";
  //   // this.textContent = "Card View";
  //   // this.value = "card";
  //   id("main-holder").classList.toggle("list-view");
  //   id("main-holder").classList.toggle("card-view");
  // }

  /**
   * Sends login details (username and password) from the login form to the server for validation.
   * This function has no return statement.
   * @param {Event} event -The submit event which triggers this function via event listener
   */
  function requestLogin(event) {
    event.preventDefault();
    let params = new FormData(id("login-form"));
    fetch("/login", {method: "POST", body: params})
      .then(statusCheck)
      .then(resp => resp.json())
      .then(updateSitePostLogin)
      .catch(handleLoginError);
  }

  /**
   * Updates the site's visuals and window storage to reflect that a user is logged in
   * This function contains no parameters or return statements.
   */
  async function updateSitePostLogin() {
    id("acc-btn").textContent = "Account";
    let userCookie = await cookieStore.get("username");
    id("logged-in-message").textContent = "Hello, " + userCookie.value;
    id("logout-btn").classList.remove("hidden");
    if (qs("#remember-me").checked) {
      window.localStorage.setItem("username", userCookie.value);
    } else {
      window.localStorage.removeItem("username");
    }
    window.sessionStorage.setItem("loggedIn", "true");
    storeView();
  }

  /**
   * Sends new account information to the server to check its validity
   * @param {Event} event - The submit event which triggers this function via event listener
   */
  function submitNewAcc(event) {
    event.preventDefault();
    let params = new FormData(id("create-acc-form"));
    fetch("/newUser", {method: "POST", body: params})
      .then(statusCheck)
      .then(resp => resp.text())
      .then(newAccRedirectToLogin)
      .catch(handleCreateAccError);
  }

  /**
   * Briefly thanks the user for creating an account before redirecting them to login
   * This function contains no parameters or return statements.
   */
  function newAccRedirectToLogin() {
    id("redirect-txt").classList.remove("hidden");
    setTimeout(function() {
      id("redirect-txt").classList.add("hidden");
      accountView();
    }, 500);
  }

  /**
   * Displays the passed error message below the account creation form. This function has no return
   * statement.
   * @param {Error} res - An error detailing what went wrong from the server.
   */
  function handleCreateAccError(res) {
    id("create-acc-error").textContent = res;
  }

  /**
   * Clears cookies and window storage and updates the page to reflect the logged-out state
   * This function contains no parameters or return statements.
   */
  function logout() {
    id("acc-btn").textContent = "Login";
    fetch("/logout")
      .then(statusCheck)
      .then(resp => resp.text())
      .catch(handleError);
    id("logged-in-message").textContent = "";
    id("logout-btn").classList.add("hidden");
    storeView();
    window.sessionStorage.clear();
  }

  /**
   * Displays error text towards the top of the page. This function has no return statement.
   * @param {Error} err - A message pertaining to an error from the server
   */
  function handleError(err) {
    console.error(err);
    id("error-msg").classList.remove("hidden");
    id("error-msg").textContent = err;
  }

  /**
   * Displays a login error if one happened (i.e. password does not match). This function
   * has no return statement.
   * @param {Error} res - an error message from the server detailing what when wrong during login
   */
  function handleLoginError(res) {
    id("login-error").textContent = res;
  }

  /**
   * Swaps to the cart view and fetches the relevant data from the server
   * This function contains no parameters or return statements.
   */
  function cartView() {
    document.body.style.backgroundImage = "none";
    id("home").classList.add("hidden");
    id("store").classList.add("hidden");
    id("cart").classList.remove("hidden");
    id("login").classList.add("hidden");
    id("product").classList.add("hidden");
    id("create-acc").classList.add("hidden");
    id("account").classList.add("hidden");
    qs("#login-reminder").classList.add("hidden");
    id("cart-place-order").classList.add("hidden");
    qs("#checkout-error").classList.add("hidden");
    id("error-msg").classList.add("hidden");
    fetch("/cart/all")
      .then(statusCheck)
      .then(resp => resp.json())
      .then(populateCart)
      .catch(handleError);
  }

  /**
   * Fills the cart with items from the returned promise. Some elements are slightly changed if the
   * cart is empty. This function has no return statement.
   * @param {Promise} res - A promise containing cart info.
   */
  function populateCart(res) {
    if (res.length === 0) {
      qs("#cart h2").textContent = "Cart";
      // qs("#buy-btn").classList.add("hidden");
      qs("#clear-cart-btn").classList.add("hidden");
      id("confirm-btn").classList.add("hidden");
    } else {
      qs("#cart h2").textContent = "Cart";
      // qs("#buy-btn").classList.remove("hidden");
      qs("#clear-cart-btn").classList.remove("hidden");
      id("confirm-btn").classList.remove("hidden");
    }
    qs("#cart-items").innerHTML = "";
    let totalCost = 0.00;
    res.forEach((cartItem) => {
      let orderObject = document.createElement("div");
      orderObject.classList.add("order-object");
      let orderTitle = document.createElement("p");
      orderTitle.id = "order-title";
      orderTitle.textContent = cartItem.name + " by " + cartItem.company;
      let orderQuantity = document.createElement("p");
      orderQuantity.id = "order-quantity";
      orderQuantity.textContent = "Q: " + cartItem.quantity;
      let orderPrice = document.createElement("p");
      orderPrice.id = "order-price";
      orderPrice.textContent = "$" + (cartItem.price * cartItem.quantity).toFixed(2);
      orderObject.appendChild(orderTitle);
      orderObject.appendChild(orderQuantity);
      orderObject.appendChild(orderPrice);
      qs("#cart-items").appendChild(orderObject);
      totalCost += parseFloat((cartItem.price * cartItem.quantity).toFixed(2));
    });
    // let orderSumObject = document.createElement("div");
    // orderSumObject.classList.add("order-object");
    // qs("#cart-items").appendChild(orderSumObject);
    // let orderSumText = document.createElement("p");
    // orderSumText.textContent = "TOTAL PRICE";
    // let orderSumPrice = document.createElement("p");
    // orderSumPrice.textContent = "$" + totalCost.toFixed(2);
    // orderSumObject.appendChild(orderSumText);
    // orderSumObject.appendChild(orderSumPrice);
    addTotal(qs("#cart-items"), totalCost);
  }

  function addTotal(object, totalCost) {
    let orderSumObject = document.createElement("div");
    orderSumObject.classList.add("order-object");
    object.appendChild(orderSumObject);
    let orderSumText = document.createElement("p");
    orderSumText.textContent = "TOTAL PRICE";
    let orderSumPrice = document.createElement("p");
    orderSumPrice.textContent = "$" + totalCost.toFixed(2);
    orderSumObject.appendChild(orderSumText);
    orderSumObject.appendChild(orderSumPrice);
  }

  /**
   * confirms that the passed promise is ok, throws an error otherwise
   * @param {Promise} res - A promise obtained from pokeapi
   * @returns {Promise} The promise unmodified
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * The id(id) method accesses an element by the id.fdf
   * @param {id} id - contains the name of the id.
   * @return {Element} returns element that matches id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * The qs(selector) method accesses a single node.
   * statements.
   * @param {string} selector - contains the name of the selector.
   * @return {Element} returns first element that matches selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * The qsa(selector) method accesses all elements.
   * @param {string} selector - contains the name of the selector.
   * @return {NodeList} list of all elements that matches selector.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Clears input children of the passed css query
   * @param {String} parent - a string representing a css query
   */
  function clearInputs(parent) {
    qsa(parent + " input").forEach((e) => {
      if (e.type !== "checkbox") {
        e.value = "";
      }
    });
  }
})();