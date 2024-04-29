const express = require('express');
const router = express.Router();
const db=require('../database');
const bcrypt=require('bcrypt');
const puppeteer = require('puppeteer');
const cli = require('../connect_redis.js');

function isLoggedOut(req,res,next){
    if (req.session.userId)
        res.redirect('/booking');
    else next();
}

function isLoggedIn(req,res,next)
{
    if (req.session.userId)
        next();
    else res.redirect('/loginform');
}

function containsSpecialCharacters(str) {
    const regex = /\./;;
    return regex.test(str);
}

async function getCheckLink(Input) {
    if (containsSpecialCharacters(Input)) {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('https://safeweb.norton.com/');
        await page.waitForSelector("input[type='url']", { timeout: 2000 });
        const input = await page.$("input[type='url']");
        await input.type(Input);
        await input.press('Enter');
        try {
            await page.waitForNavigation()
            const ratingElement = await page.$("p.rating-label.xl-body-text-bold");
            const ratingText = await page.evaluate(ratingElement => ratingElement.textContent, ratingElement);
            await browser.close();
            return ratingText;
            
        }
        catch {
            await browser.close();
            return "Not Link";
        }
    }
    else {
        return "Not Link";
    }
}

router.post('/signup', async (req,res)=>{
    const {fname, lname, email,password} = req.body;
    let hashedPassword= await bcrypt.hash(password,10);
    let checkfName = await getCheckLink(fname);
    console.log("fname:" + checkfName);
    if (checkfName === "Not Link" || checkfName === "Safe") {
        let checklName = await getCheckLink(lname);
        console.log("lname:" + checklName);
        if (checklName === "Not Link" || checklName === "Safe") {
            let checkPassword = await getCheckLink(password);
            console.log(checkPassword);
            if ((checkPassword === "Not Link" || checkPassword === "Safe") ) {
                db.beginTransaction((err) => {
                    if (err) throw err;
                    db.query(`SELECT * FROM account WHERE email='${email}'`, (err, results) => {
                        if (err) {
                            db.rollback(() => {
                                throw err;
                            });
                        }
                        if (results.length > 0) {
                            req.flash('error', 'Email already registered');
                            res.redirect('/signupform');
                            db.rollback();
                        } else {
                            db.query(`INSERT INTO account (email,password) VALUES ('${email}','${hashedPassword}')`, (err) => {
                                if (err) {
                                    db.rollback(() => {
                                        throw err;
                                    });
                                }
                                const { fname, lname, phone, dob } = req.body;
                                db.query(`SELECT id FROM account WHERE email='${email}'`, (err, results) => {
                                    if (err) {
                                        db.rollback(() => {
                                            throw err;
                                        });
                                    }
                                    const id = results[0].id;
                                    db.query(`INSERT INTO booker VALUES (${id},'${fname}','${lname}','${dob}','${phone}')`, (err) => {
                                        if (err) {
                                            db.rollback(() => {
                                                throw err;
                                            });
                                        }
                                        db.commit((err) => {
                                            if (err) {
                                                db.rollback(() => {
                                                    throw err;
                                                });
                                            }
                                            res.redirect('/init_redis');
                                        });
                                    });
                                });
                            });
                        }
                    });
                });
            }
            else {
                return res.status(400).json({ error: 'Password not valid.' });
            }
        }
        else {
            return res.status(400).json({ error: 'last name not valid.' });
        }
    }
    else {
        return res.status(400).json({ error: 'First name not valid.' });
    }
})

router.get('/init_redis', (req,res) =>{
    db.query(`SELECT count(*) as cnt FROM bookingapp.booker;`, (err, result) => {
        cli.zadd(`myzset${result[0].cnt + 1}`, 0, '1', 0, '2', 0, '3', 0, '4', 0, '5', 0, '6', (err, reply) => {
            if (err) {
            console.error('Error incrementing score:', err);
            }
            console.log(`myzset${result[0].cnt + 1}`);
        });
    });
    res.redirect('/loginform');
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(404).json({ message: 'Please enter all fields' });
        return; 
    }
    let checkPassword = await getCheckLink(password);
    console.log(checkPassword);
    if ((checkPassword === "Not Link" || checkPassword === "Safe")) {
        db.query(`SELECT * FROM account WHERE email='${email}' AND type_of_account = 'booker'`, (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                const user = results[0];
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        req.session.userId = user.id;
                        res.redirect('/index');
                    } else {
                        req.flash('error', 'Password is not correct');
                        res.redirect('/loginform');
                    }
                });
            } else {
                req.flash('error', 'Email is not registered');
                res.redirect('/loginform');
            }
        });
    }
    else {
        return res.status(400).json({ error: 'Password not valid.' });
    }
});

router.get('/profile', isLoggedIn, (req, res) => {
    db.query(`select * 
              from account join booker on account.id=booker.id 
              where account.id=${req.session.userId}`, (err,results)=>{
                if (err) throw err;
                const userData=results[0];
                db.query(`select b.reservation_id,date_in,date_out,number,a.status
                from reservation a 
                join room_reserved b on a.id=b.reservation_id 
                join room c on b.room_id=c.id join payment d on a.id=d.reservation_id
                where booker_id=${req.session.userId}
                order by reservation_id`,(err,results)=>{
                            if (err) throw err;
                            const userReservation = [];
                            let i=0; //number of reservations
                            results.forEach((element,index,arr) => {
                                if (index===0 || element.reservation_id != arr[index-1].reservation_id)
                                {
                                    userReservation.push({
                                        reservation_id: element.reservation_id,
                                        date_in: element.date_in,
                                        date_out: element.date_out,
                                        roomList: [element.number],
                                        status: element.status
                                    });
                                    i++;
                                }
                                else
                                {
                                    userReservation[i-1].roomList.push(element.number);
                                }
                            });
                            res.render('profile.ejs',{userData, userReservation});
                        })
              })
})

router.get('/loginform', isLoggedOut, (req, res) => {
    res.render('loginform.ejs',{message:req.flash('error')});
})//if already logged in, redirect to /booking

router.get('/editProfile', isLoggedIn, (req, res) => {
    const id=req.query.id;
    if (id)  //param id exists
    {
        if (Number(id)===req.session.userId)  //user can only edit their own profile 
        {
            db.query(`select * 
                    from account join booker on account.id=booker.id 
                    where account.id=${id}`,(err,results)=>{
                        if (err) throw err;
                        const userData=results[0];
                        if (userData){    //user exists in database
                            res.render('editProfile.ejs',{userData, message: req.flash('error')});
                        }
                        else res.redirect('/index')  

        })
        }
        else res.redirect('/index')   //not allow editing others' profiles
        
    }
    else res.redirect('/index'); //param id not exists
   
    
})

router.post('/editProfile',isLoggedIn, async(req,res)=>{
    //check not duplicated email
    const {id,fname,lname,email,phone,dob}=req.body;
    
    let checkfName = await getCheckLink(fname);
    console.log("fname:" + checkfName);
    if (checkfName === "Not Link" || checkfName === "Safe") {
        let checklName = await getCheckLink(lname);
        console.log("lname:" + checklName);
        if (checklName === "Not Link" || checklName === "Safe") {
            db.query(`select * from account where email='${email}' and id<>${id}`,(err,results)=>{
                if (err) throw err;
                if (results.length>0) //duplicated email
                {
                    // res.json({error:'Email already registered'})
                    req.flash('error','Email already registered');
                    res.redirect(`/editProfile?id=${id}`);
                }
                else  db.query(`update account, booker
                                set first_name='${fname}',last_name='${lname}',email='${email}',phone='${phone}',birth_date='${dob}'
                                where account.id=booker.id
                                and account.id=${id}`,(err)=>{
                                    if (err) throw err;
                                    res.redirect('/profile');
                })
            })
        }
    }
   
})

router.get('/editPassword', isLoggedIn, (req, res) => {
    const id=req.query.id;
    if (id)  //param id exists
    {
        if (Number(id)===req.session.userId)  //user can only edit their own profile 
        {
            res.render('editPassword.ejs',{id,message: req.flash('error')});
        }
        else res.redirect('/index')   //not allow editing others' profiles
        
    }
    else res.redirect('/index'); //param id not exists
    
})

router.post('/editPassword',isLoggedIn, async (req,res)=>{
    const {id,oldPassword,newPassword,newPassword2}=req.body;
    let CheckOldPassword = getCheckLink(oldPassword);
    if (CheckOldPassword === "Not Link" || CheckOldPassword === "Safe") {
        let CheckNewPassword = getCheckLink(newPassword);
        if (CheckNewPassword === "Not Link" || CheckNewPassword === "Safe") {
                db.query(`select password from account where id=${id}`,(err,results)=>{
                    if (err) throw err;
                    if (results.length>0)  //account exists
                    {
                        const {password}=results[0];
                        bcrypt.compare(oldPassword,password,async (err,isMatch)=>{
                            if (err) throw err;
                            if (isMatch)  //password valid
                            {
                                if (newPassword===newPassword2)  //new password confirmed
                                {
                                    let hashedPassword= await bcrypt.hash(newPassword,10);
                                    db.query(`update account set password='${hashedPassword}' where id=${id}`,(err)=>{
                                        if (err) throw err;
                                        res.redirect('/profile');
                                    })
                                }
                            }
                            else {
                                req.flash('error','You enter the wrong password');
                                res.redirect(`/editPassword?id=${id}`);
                            }
                        })
                    }
                    else res.redirect('/index');
                })
        }
    }

})


router.get('/logout', isLoggedIn, (req,res)=>{
    req.session.destroy();
    res.redirect('/loginform')
})

router.get('/signupform', (req, res) => {
    res.render('signupform.ejs',{message:req.flash('error')});
})



module.exports = router;