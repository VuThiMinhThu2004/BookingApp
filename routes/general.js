const express = require('express');
const router = express.Router();
const path = require('path');
const db=require('../database');
const bcrypt=require('bcrypt');
const { route } = require('./users');
const cli = require('../connect_redis.js');
const Rating = require('../model_mongodb/dbmongo.js');
const { isModuleNamespaceObject } = require('util/types');

router.get('/',(req,res)=>{
    res.redirect('/index');
})

router.get('/index', (req, res) => {
    res.render('index.ejs', {message: req.flash('success')});
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
router.get('/detail', (req, res) => {
    const { id } = req.query;
    //console.log(id);
    let link = `detail${id}.ejs`;
    cli.zincrby(`myzset${req.session.userId}`, 1, `${id}`, (err, reply) => {
        if (err) {
          console.error('Error incrementing score:', err);
        }
    });
    res.render(link);
})
// router.get('/detail1', (req, res) => {
//     res.render('detail1.ejs');
// })
// router.get('/detail2', (req, res) => {
//     res.render('detail2.ejs');
// })
// router.get('/detail3', (req, res) => {
//     res.render('detail3.ejs');
// })
// router.get('/detail4', (req, res) => {
//     res.render('detail4.ejs');
// })
// router.get('/detail5', (req, res) => {
//     res.render('detail5.ejs');
// })
// router.get('/detail6', (req, res) => {
//     res.render('detail6.ejs');
// })
router.get('/Assignment_r1', (req, res) => {
    res.render('Assignment_r1.ejs');
})
router.get('/Assignment_db1', (req, res) => {
    res.render('Assignment_db1.ejs');
})
router.get('/Assignment_s1', (req, res) => {
    res.render('Assignment_s1.ejs');
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

async function getSort(userId) {
    return new Promise((resolve, reject) => {
      cli.zrevrange(`myzset${userId}`, 0, -1, (err, members) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(members);
      });
    });
}

async function getInfo(i) {
    return new Promise(async (resolve, reject) => {
        db.query(`select id, name, description, link, image, price_each_day from type t 
                    join month_price m on t.id = m.type_id 
                    where m.month = extract(month from NOW()) and id =  ${i};`, 
                    (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);       
        })
    });
}
  
router.get('/rooms', async (req, res) => {
    let userID = 0;
    if (req.session.userId) {
        userID = req.session.userId;
    }
    console.log(userID);
    let mem = await getSort(userID);
    //console.log(mem);
    var data = [];
    for(let i = 0; i < mem.length; i++) {
        let dataRow = await getInfo(mem[i]);
        data.push(dataRow[0]);
    }
    res.render('rooms.ejs', {data});
})

async function getRate(i) {
    let data = await Rating.aggregate([
        { $match: {idRoom: Number(i)} },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $project: { _id: 0, stars: '$_id', count: 1 } }
    ]);
    if(data.length == 0) {
        return([0, i]); 
    }
    else {
        let total_rating = 0;
        rating_based_on_stars = 0
        //console.log(data);
        data.forEach((rate,index) => {
            total_rating += rate.count;
            rating_based_on_stars += rate.count * rate.stars;
        })
        let rating_average = (rating_based_on_stars/total_rating).toFixed(1);
        //console.log(rating_average);
        return([Number(rating_average), i]);
    }
}

router.get('/get_data', async (req, res) =>{
    var type = req.query.parent_value;
    if(type == 'Default') {
        console.log("hu");
        res.redirect('/rooms');
    }
    else if(type == 'Reviews') {
        let arr = new Array();
        db.query('SELECT count(*) as cnt FROM bookingapp.type;', async (err, result) => {
            let n = result[0].cnt;
            //console.log(result[0].cnt);
            for(let i = 0; i < n; i++) {
                //console.log(await getRate(i));
                arr.push(await getRate(i));
            }
            arr.sort();
            //console.log(arr);
            let data = new Array();
            for(let i = arr.length - 1; i > 0; i--) {
                //console.log(arr[i][1]);
                let dataRow = await getInfo(arr[i][1]);
                data.push(dataRow[0]);
            }
            //console.log(data);
            res.render('rooms.ejs', {data});
        })

    }
    else {
        var query = "";
        if(type == 'Price') {
            query = "select id, name, description, link, image, price_each_day from type t " + 
            "join month_price m on t.id = m.type_id " +
            "where m.month = extract(month from NOW()) " +
            "order by price_each_day asc;";
        }
        if(type == 'Popularity') {
            query = "select id, name, description, link, image, price_each_day from type t " + 
            "join month_price m on t.id = m.type_id " +
            "left join (select count(*) as cnt, room.type_id from room_reserved rr " +
            "join room on room.id = rr.room_id " + 
            "group by room.type_id) as T using (type_id) " + 
            "where m.month = extract(month from NOW()) " +
            "order by T.cnt desc;";
        }
        if(type == 'Spacing') {
            query = "select id, name, description, link, image, price_each_day from type t " + 
            "join month_price m on t.id = m.type_id " +
            "where m.month = extract(month from NOW()) " +
            "order by capacity asc;";
        }
        console.log(query);
        db.query(query, function(err, data){
            if (err) throw err;
            // console.log(data);
            // console.log(data.length);
            res.json(data);

        });
    }
});

router.post('/room_search', function(req, res) {
    const { search } = req.body;
    const query = `select distinct id, name, description, link, image, price_each_day from type t
                  join month_price m on t.id = m.type_id
                  where m.month = extract(month from NOW()) and
                  match(description) against('${search}');`;
    db.query(query, (err, data) => {
        //console.log(data);
        if (err) throw err;
        else
            res.render('rooms.ejs', {data});
    })
});
module.exports = router