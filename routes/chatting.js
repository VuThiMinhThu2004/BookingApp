const express = require('express');
const router = express.Router();
const db = require('../database');

function isLoggedIn(req, res, next) {
    if (req.session.userId) {
        console.log(`User ID: ${req.session.userId}, Email: ${req.session.email}`);
        next();
    } else {
        res.redirect('/loginform');
    }
}

router.get("/chat", isLoggedIn, (req, res) => {
    console.log(req.session.userId);
    const query = `SELECT id, email FROM account WHERE id = ${req.session.userId};`;
    console.log("Executing DB Query:", query); 
    db.query(query, (err, result) => {
      if (err) {
        console.error("Error executing DB Query:", err); 
        throw err; 
      } else {
        console.log(result);
        res.render("chat.ejs", {
          user: {
            user_id:  "1to" + result[0].id,
            email: result[0].email,
          },
        });
      }
    });
  });
  
  router.post("/chat", isLoggedIn, async (req, res) => {
    res.redirect("/chat");
  });


module.exports = router;
