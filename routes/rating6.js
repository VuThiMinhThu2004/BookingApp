const express = require('express');
const router = express.Router();
const Rating = require('../model_mongodb/dbmongo6.js');
const db = require('../database');
let cnt = 0;


router.post('/submit6', async (req, res) => {
    const { rating } = req.body; 

    if (!rating) {
        return res.status(400).json({ error: 'Rating is a required field.' });
    }

    const dbquery = "SELECT DISTINCT booker_id FROM reservation re JOIN room_reserved rr ON rr.reservation_id = re.id JOIN room r ON r.id = rr.room_id WHERE re.booker_id = ? AND r.type_id = 6 AND re.status = 'checkout';";
    db.query(dbquery, [req.session.userId], async (err, results) => {
    if (err) {
        // Xử lý lỗi
        console.error('Error querying database:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
        // Trả về thông báo lỗi "Chưa đánh giá"
        console.log('Chưa thuê phòng');
        return res.redirect('/Assignment_r6');
    }
    // Thực hiện hành động khi kết quả không rỗng
    try{
        for (let i = 0; i < results.length; i ++) {
            const userId = results[i].booker_id;
            // const dateIn = results[i].date_in;
            const newRating = await Rating.create({ rating, idUser: userId });
            res.redirect('/Assignment_s6');
        }
    }
    catch {
        console.error('Đã đánh giá', err);
        return res.redirect('/Assignment_db6');
    }
});

});


router.get('/data6', async (req, res) => {
    try {
        const data = await Rating.aggregate([
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $project: { _id: 0, stars: '$_id', count: 1 } }
        ]);
        res.json(data);
    } catch (error) {
        console.error('Error retrieving data:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 