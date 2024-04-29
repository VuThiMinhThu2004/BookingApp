const express = require('express');
const router = express.Router();

const Rating = require('../model_mongodb/dbmongo.js');
const db = require('../database');

router.post('/submit', async (req, res) => {
    const { rating } = req.body; 
    const { id } = req.query;
    console.log(id);

    if (!rating) {
        return res.status(400).json({ error: 'Rating is a required field.' });
    }

    const dbquery = `SELECT DISTINCT booker_id FROM reservation re JOIN room_reserved rr ON rr.reservation_id = re.id JOIN room r ON r.id = rr.room_id WHERE re.booker_id = ? AND r.type_id = ${id} AND re.status =  'checkout';`;
    db.query(dbquery, [req.session.userId], async (err, results) => {
    if (err) {
        // Xử lý lỗi
        console.error('Error querying database:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
    console.log(results.length);
    if (results.length === 0) {
        // Trả về thông báo lỗi "Chưa đánh giá"
        console.log('Chưa thuê phòng');
        return res.redirect(`/Assignment_r${id}`);
    }
    // Thực hiện hành động khi kết quả không rỗng
    try{
        for (let i = 0; i < results.length; i ++) {
            const userId = results[i].booker_id;
          
            // const dateIn = results[i].date_in;
            const newRating = await Rating.create({ idRoom: Number(id), rating, idUser: userId});
            res.redirect(`/Assignment_s${id}`);
        }
    }
    catch {
        console.error('Đã đánh giá', err);
        return res.redirect(`/Assignment_db${id}`);
    }
});

});


router.get('/data', async (req, res) => {
    const {id} = req.query;
    console.log(id);
    try {
        const data = await Rating.aggregate([
            { $match: {idRoom: Number(id)} },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $project: { _id: 0, stars: '$_id', count: 1 } }
        ]);
        console.log(data);
        res.json(data);
    } catch (error) {
        console.error('Error retrieving data:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;