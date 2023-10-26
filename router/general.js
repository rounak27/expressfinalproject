const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
let booklistPromise= new Promise((resolve,reject)=>{
    const bookList = Object.values(books);
    if (bookList.length > 0) {
        resolve(bookList);
      }
    else {
        reject(new Error('No books available'));
      }
    });



public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    booklistPromise.then((bookList)=>
    {
       
        res.send(JSON.stringify(bookList));
        });
});
//    res.write(JSON.stringify(books[id]) + '\n');

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const getBookDetails = (isbn) => {
        return new Promise((resolve, reject) => {
            // Check if the book exists in the local database
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                // If not found, reject with an error
                reject(new Error('Book with this ISBN not found'));
            }
        });
    };

    getBookDetails(isbn)
        .then(bookDetails => {
            res.json(bookDetails);
        })
        .catch(error => {
            res.status(404).json({ error: error.message });
        });
});
  
// Get book details based on author using Promise callbacks
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const matchingBooks = [];

    booklistPromise
        .then(bookList => {
            bookList.forEach(book => {
                if (book.author === author) {
                    matchingBooks.push(book);
                }
            });

            if (matchingBooks.length > 0) {
                res.json(matchingBooks);
            } else {
                res.status(404).json({ error: 'No books by this author found' });
            }
        })
        .catch(error => {
            res.status(404).json({ error: error.message });
        });
});


// Get all books based on title
// Get all books based on title using Promise callbacks and the existing bookListPromise
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    booklistPromise
        .then(bookList => {
            const matchingBooks = bookList.filter(book => book.title === title);
            if (matchingBooks.length > 0) {
                res.json(matchingBooks);
            } else {
                res.status(404).json({ error: 'No books with this title found' });
            }
        })
        .catch(error => {
            res.status(404).json({ error: error.message });
        });
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
const isbn = req.params.isbn;
    
if (books[isbn]) {
    const reviews = books[isbn].reviews;
    res.json(reviews);
} else {
    res.status(404).json({ error: 'No book with this ISBN found' });
}});

module.exports.general = public_users;
