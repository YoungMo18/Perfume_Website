# *BookAPI* API Documentation
*This API contains information about all the books from the textbook ecommerce website. It allows users to access data about inventory (books), purchase history, user accounts, etc.*

## *allBooks*
**Request Format:** *"/all"*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Contains price, ID, quantity,
name, genre, author and short description of all books*


**Example Request:** *"/all"*

**Example Response:**
*
```json
[
  {
    "book_id": 1,
    "name": "Japanese Textbook",
    "price": 50.99
  },
  ...
]
```
*

**Error Handling:**
*500 "An error occurred on the server. Try again later."*


## *login*
**Request Format:** *"/login" username, password*

**Request Type:** *POST*

**Returned Data Format**: JSON

**Description:** *Allows user to login (cookies) and returns user ID*

**Example Request:** *"/all" username = bobby, password = wagner*

**Example Response:**
*
```json
8
```
```cookies
username: bobby
loginstatus: true
```
*

**Error Handling:**
*400 "Password not matching", 400 "Username not found", 500 "An error occurred on the server. Try again later.", 400 "Missing one or more of the required params."*


## *userID*
**Request Format:** *"/user/:username"*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Allows user to grab user ID based on username*

**Example Request:** *"/user/cstrong4"*

**Example Response:**
*
```json
1
```
*

**Error Handling:**
*500 "An error occurred on the server. Try again later.", 400 "Missing one or more of the required params."*


## *logout*
**Request Format:** *"/logout"*

**Request Type:** *GET*

**Returned Data Format**: TEXT

**Description:** *Logs the user out*

**Example Request:** *"/logout"*

**Example Response:**
*
```
"Logged out"
```
```cookies
username:
loginstatus:
```
*

**Error Handling:**
*No error handling, all it does is clear cookies*


## *bookID*
**Request Format:** *"/book/:id"*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Grabs the info of a book based on its ID*

**Example Request:** *"/book/2"*

**Example Response:**
*
```json
{
  "name": "Calculus I: The First Instalment",
  "price": 79.99,
  "quantity": 100,
  "description": "Teaches you all you'll need to know about Calculus and nothing you'll need to know for any other aspect of your life.",
  "genres": "math"
}
```
*

**Error Handling:**
*500 "An error occurred on the server. Try again later."*


## *buy*
**Request Format:** *"/buy"*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Allows the user to "buy" item(s)*

**Example Request:** *"/buy"*

**Example Response:**
*
```
"kq1635"
```
*

**Error Handling:**
*500 "An error occurred on the server. Try again later.", 400 "Sold out!!!", 400 "Empty Cart!!!", 400 "User is not logged in"*


## *searchAndFilter*
**Request Format:** *"/search", search, filter*

**Request Type:** *POST*

**Returned Data Format**: JSON

**Description:** *Allows the user to filter and search for an item*

**Example Request:** *"/search", search = rya, filter = language*

**Example Response:**
*
```json
[
  {
    "book_id": 5,
    "name": "Spanish Textbook",
    "price": 50.99,
    "quantity": 45,
    "description": "Spanish is one of the greatest romance languages. This textbook will teach you to speak it somewhat.",
    "genres": "language",
    "author": "Ryan Garcia"
  },
  {
    "book_id": 6,
    "name": "Spanish (Online)",
    "price": 60.99,
    "quantity": -1,
    "description": "Spanish is one of the greatest romance languages. This textbook will teach you to speak it somewhat.",
    "genres": "language",
    "author": "Ryan Garcia"
  }
]
```
*

**Error Handling:**
*500 "An error occurred on the server. Try again later.", 400 "Missing one or more of the required params."*


## *purchaseHistory*
**Request Format:** *"/history"*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Grabs the purchase history of a user*

**Example Request:** *"/history"*

**Example Response:**
*
```json
[
  {
    "purchase_id": "ta212153",
    "user_id": 8,
    "book_id": 6,
    "quantity": 2,
    "date": "2023-12-11 15:13:15",
    "name": "Spanish (Online)",
    "price": 60.99,
    "description": "Spanish is one of the greatest romance languages. This textbook will teach you to speak it somewhat.",
    "genres": "language",
    "author": "Ryan Garcia"
  },
  ...
]
```
*

**Error Handling:**
*500 "An error occurred on the server. Try again later.", 400 "User is not logged in"*


## *newUser*
**Request Format:** *"/newUser", username, password, email*

**Request Type:** *POST*

**Returned Data Format**: TEXT

**Description:** *Allows a user to create a new account*

**Example Request:** *"/newUser", username = Bobby, password = Wagner, email = BW45@Seahawks.edu*

**Example Response:**
*
```
"Bobby account created!!!"
```
*

**Error Handling:**
*500 "An error occurred on the server. Try again later.", 400 "Account already made", 400 "Incorrect or missing one or more of the required params."*


## *cart*
**Request Format:** *"/cart", bookid, quantity*

**Request Type:** *POST*

**Returned Data Format**: TEXT

**Description:** *Allows the user to add item(s) to a cart*

**Example Request:** *"/cart", bookid = 4, quantity = 2*

**Example Response:**
*
```
"Succesfully added to cart"
```
*

**Error Handling:**
*500 "An error occurred on the server. Try again later.", 400 "Incorrect or missing one or more of the required params."*


## *allCart*
**Request Format:** *"/cart/all"*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Grabs all item(s) in a cart*


**Example Request:** *"/cart/all"*

**Example Response:**
*
```json
[
  {
    "book_id": 5,
    "quantity": 3,
    "id": 1
  },
  {
    "book_id": 6,
    "quantity": 2,
    "id": 2
  }
]
```
*

**Error Handling:**
*500 "An error occurred on the server. Try again later."*


## *clearCart*
**Request Format:** *"/cart/clear"*

**Request Type:** *GET*

**Returned Data Format**: TEXT

**Description:** *Clears all item(s) in the cart*


**Example Request:** *"/cart/clear"*

**Example Response:**
*
```
"Cleared Cart"
```
*

**Error Handling:**
*500 "An error occurred on the server. Try again later."*