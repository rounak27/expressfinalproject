const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user)=>{
        return user.username === username
      });
      if(userswithsamename.length > 0){
        return true;
      } else {
        return false;
      }
    }

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
      });
      if(validusers.length > 0){
        return true;
      } else {
        return false;
      }
    }

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
  
    if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: '1h' });
  
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(401).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Get ISBN from the route parameter
    const reviewText = req.body.review; // Get review text from the request body
    const username = req.session.authorization.username; // Get the username from the session

    if (!isbn || !reviewText || !username) {
        return res.status(400).json({ message: "Invalid request" });
    }

    if (books[isbn]) {
        // Check if the user has already reviewed this book
        if (books[isbn].reviews[username]) {
            // Modify the existing review
            books[isbn].reviews[username] = reviewText;
            return res.status(200).json({ message: "Review modified successfully" });
        } else {
            // Add a new review
            books[isbn].reviews[username] = reviewText;
            return res.status(200).json({ message: "Review added successfully" });
        }
    } else {
        return res.status(404).json({ message: "Book with this ISBN not found" });
    }
});
// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Get ISBN from the route parameter
    const username = req.session.authorization.username; // Get the username from the session

    if (!isbn || !username) {
        return res.status(400).json({ message: "Invalid request" });
    }

    if (books[isbn]) {
        // Check if the user has a review for this book
        if (books[isbn].reviews[username]) {
            // Delete the user's review
            delete books[isbn].reviews[username];
            return res.status(200).json({ message: "Review deleted successfully" });
        } else {
            return res.status(404).json({ message: "No review found for this book and user" });
        }
    } else {
        return res.status(404).json({ message: "Book with this ISBN not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
