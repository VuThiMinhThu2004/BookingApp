const express = require('express');
const router = express.Router();
const path = require('path');
const db=require('../database');
const bcrypt=require('bcrypt');
const { route } = require('./users');

router.get('/',(req,res)=>{
    res.redirect('/index');
})

router.get('/index', (req, res) => {
    res.render('index.ejs', {message: req.flash('success')});
})

router.get('/rooms', (req, res) => {
    const query = "select distinct name, description, link, image, price_each_day from type t " + 
                  "join month_price m on t.id = m.type_id " +
                  "where m.month = extract(month from NOW());"
    db.query(query, (err, data) => {
        console.log(data);
        if (err) throw err;
        else
            res.render('rooms.ejs', {data});
    })
})

router.get('/about', (req, res) => {
    res.render('about.ejs');
})


router.get('/contact', (req, res) => {
    res.render('contact.ejs');
})

router.get('/restaurant', (req, res) => {
    res.render('restaurant.ejs');
})

router.get('/spa', (req, res) => {
    res.render('spa.ejs');
})
router.get('/detail1', (req, res) => {
    res.render('detail1.ejs');
})
router.get('/detail2', (req, res) => {
    res.render('detail2.ejs');
})
router.get('/detail3', (req, res) => {
    res.render('detail3.ejs');
})
router.get('/detail4', (req, res) => {
    res.render('detail4.ejs');
})
router.get('/detail5', (req, res) => {
    res.render('detail5.ejs');
})
router.get('/detail6', (req, res) => {
    res.render('detail6.ejs');
})
router.get('/Assignment_r', (req, res) => {
    res.render('Assignment_r.ejs');
})
router.get('/Assignment_db', (req, res) => {
    res.render('Assignment_db.ejs');
})
router.get('/Assignment_s', (req, res) => {
    res.render('Assignment_s.ejs');
})

router.get('/Assignment_r', (req, res) => {
    res.render('Assignment_r.ejs');
})
router.get('/Assignment_db', (req, res) => {
    res.render('Assignment_db.ejs');
})
router.get('/Assignment_s', (req, res) => {
    res.render('Assignment_s.ejs');
})


router.get('/Assignment_r2', (req, res) => {
    res.render('Assignment_r2.ejs');
})
router.get('/Assignment_db2', (req, res) => {
    res.render('Assignment_db2.ejs');
})
router.get('/Assignment_s2', (req, res) => {
    res.render('Assignment_s2.ejs');
})


router.get('/Assignment_r3', (req, res) => {
    res.render('Assignment_r3.ejs');
})
router.get('/Assignment_db3', (req, res) => {
    res.render('Assignment_db3.ejs');
})
router.get('/Assignment_s3', (req, res) => {
    res.render('Assignment_s3.ejs');
})


router.get('/Assignment_r4', (req, res) => {
    res.render('Assignment_r4.ejs');
})
router.get('/Assignment_db4', (req, res) => {
    res.render('Assignment_db4.ejs');
})
router.get('/Assignment_s4', (req, res) => {
    res.render('Assignment_s4.ejs');
})


router.get('/Assignment_r5', (req, res) => {
    res.render('Assignment_r5.ejs');
})
router.get('/Assignment_db5', (req, res) => {
    res.render('Assignment_db5.ejs');
})
router.get('/Assignment_s5', (req, res) => {
    res.render('Assignment_s5.ejs');
})


router.get('/Assignment_r6', (req, res) => {
    res.render('Assignment_r6.ejs');
})
router.get('/Assignment_db6', (req, res) => {
    res.render('Assignment_db6.ejs');
})
router.get('/Assignment_s6', (req, res) => {
    res.render('Assignment_s6.ejs');
})

router.get('/get_data', function(req, res){
    var type = req.query.parent_value;
    var query = "";
    if(type == 'Price') {
        query = "select name, description, link, image, price_each_day from type t " + 
        "join month_price m on t.id = m.type_id " +
        "where m.month = extract(month from NOW()) " +
        "order by price_each_day asc;";
    }
    if(type == 'Popularity') {
        query = "select name, description, link, image, price_each_day from type t " + 
        "join month_price m on t.id = m.type_id " +
        "join (select count(*) as cnt, room.type_id from room_reserved rr " +
        "join room on room.id = rr.room_id " + 
        "group by room.type_id) as T using (type_id) " + 
        "where m.month = extract(month from NOW()) " +
        "order by T.cnt asc;";
    }
    if(type == 'Spacing') {
        query = "select name, description, link, image, price_each_day from type t " + 
        "join month_price m on t.id = m.type_id " +
        "where m.month = extract(month from NOW()) " +
        "order by capacity asc;";
    }
    console.log(query);
    db.query(query, function(err, data){
        if (err) throw err;
        console.log(data);
        res.json(data);

    });
});

router.post('/room_search', function(req, res) {
    const { search } = req.body;
    const query = `select distinct name, description, link, image, price_each_day from type t
                  join month_price m on t.id = m.type_id
                  where m.month = extract(month from NOW()) and
                  match(description) against('${search}');`;
    db.query(query, (err, data) => {
        console.log(data);
        if (err) throw err;
        else
            res.render('rooms.ejs', {data});
    })
});
module.exports = router