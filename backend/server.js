const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'railway'
};

const db = mysql.createConnection(dbConfig);
const PORT = process.env.PORT || 3000;

const seedTrains = [
    { train_id: 1, train_name: 'Charminar Express', source: 'Hyderabad', destination: 'Chennai', total_seats: 120, departure_time: '18:00:00' },
    { train_id: 2, train_name: 'Rajdhani Express', source: 'Hyderabad', destination: 'Delhi', total_seats: 150, departure_time: '06:00:00' },
    { train_id: 3, train_name: 'Deccan Queen', source: 'Mumbai', destination: 'Pune', total_seats: 80, departure_time: '07:15:00' },
    { train_id: 4, train_name: 'Shatabdi Express', source: 'Delhi', destination: 'Bhopal', total_seats: 120, departure_time: '06:15:00' },
    { train_id: 5, train_name: 'Duronto Express', source: 'Mumbai', destination: 'Kolkata', total_seats: 160, departure_time: '11:05:00' },
    { train_id: 6, train_name: 'Garib Rath Express', source: 'Delhi', destination: 'Bangalore', total_seats: 200, departure_time: '22:30:00' },
    { train_id: 7, train_name: 'Vande Bharat Express', source: 'Delhi', destination: 'Jaipur', total_seats: 100, departure_time: '06:00:00' },
    { train_id: 8, train_name: 'Humsafar Express', source: 'Lucknow', destination: 'Delhi', total_seats: 140, departure_time: '19:45:00' },
    { train_id: 9, train_name: 'Tejas Express', source: 'Mumbai', destination: 'Ahmedabad', total_seats: 110, departure_time: '06:40:00' },
    { train_id: 10, train_name: 'Konkan Kanya Express', source: 'Mumbai', destination: 'Kochi', total_seats: 130, departure_time: '23:00:00' },
    { train_id: 11, train_name: 'East Coast Express', source: 'Hyderabad', destination: 'Visakhapatnam', total_seats: 140, departure_time: '05:45:00' },
    { train_id: 12, train_name: 'Coromandel Express', source: 'Kolkata', destination: 'Chennai', total_seats: 150, departure_time: '14:50:00' },
    { train_id: 13, train_name: 'Sampark Kranti Express', source: 'Bangalore', destination: 'Delhi', total_seats: 160, departure_time: '22:00:00' },
    { train_id: 14, train_name: 'Patna Rajdhani', source: 'Patna', destination: 'Delhi', total_seats: 140, departure_time: '18:25:00' },
    { train_id: 15, train_name: 'Nagpur Express', source: 'Mumbai', destination: 'Nagpur', total_seats: 120, departure_time: '21:00:00' },
    { train_id: 16, train_name: 'Gujarat Mail', source: 'Mumbai', destination: 'Ahmedabad', total_seats: 130, departure_time: '22:05:00' },
    { train_id: 17, train_name: 'Howrah Superfast', source: 'Kolkata', destination: 'Bhopal', total_seats: 150, departure_time: '07:30:00' },
    { train_id: 18, train_name: 'Chennai Rajdhani', source: 'Chennai', destination: 'Delhi', total_seats: 160, departure_time: '08:00:00' },
    { train_id: 19, train_name: 'Kochi Express', source: 'Chennai', destination: 'Kochi', total_seats: 110, departure_time: '19:15:00' },
    { train_id: 20, train_name: 'Secunderabad Express', source: 'Hyderabad', destination: 'Nagpur', total_seats: 130, departure_time: '23:15:00' }
];

// 🔌 DB CONNECTION
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'v4r4pr4s4d',
    database: 'railway'
});
const dbPromise = db.promise();

async function seedTrainMaster() {
    const [rows] = await dbPromise.query('SELECT COUNT(*) AS count FROM train');

    if (rows[0].count > 0) {
        return;
    }

    const values = seedTrains.map(t => [t.train_id, t.train_name, t.source, t.destination, t.total_seats]);
    await dbPromise.query(
        'INSERT INTO train (train_id, train_name, source, destination, total_seats) VALUES ?',
        [values]
    );

    console.log(`✅ Seeded ${seedTrains.length} trains into MySQL`);
}

async function getNextId(tableName, idColumn) {
    const [rows] = await dbPromise.query(
        `SELECT COALESCE(MAX(${idColumn}), 0) + 1 AS nextId FROM ${tableName}`
    );

    return Number(rows[0].nextId);
}

async function getOrCreateSchedule(trainId, travelDate) {
    const selectedDate = travelDate || new Date().toISOString().split('T')[0];
    const [existing] = await dbPromise.query(
        'SELECT schedule_id FROM schedule WHERE train_id = ? AND departure_date = ? LIMIT 1',
        [trainId, selectedDate]
    );

    if (existing.length > 0) {
        return existing[0].schedule_id;
    }

    const trainMeta = seedTrains.find(t => t.train_id === Number(trainId));
    const departureTime = trainMeta?.departure_time || '09:00:00';
    const scheduleId = await getNextId('schedule', 'schedule_id');

    await dbPromise.query(
        `INSERT INTO schedule (schedule_id, train_id, departure_date, arrival_date, departure_time)
         VALUES (?, ?, ?, ?, ?)`,
        [scheduleId, trainId, selectedDate, selectedDate, departureTime]
    );

    return scheduleId;
}

db.connect(async err => {
    if (err) {
        console.error('❌ MySQL connection failed:', err);
        return;
    }

    console.log('✅ Connected to MySQL');

    try {
        await seedTrainMaster();
    } catch (seedErr) {
        console.error('⚠️ Train seed warning:', seedErr.message);
    }
});

// 🎲 PNR
function generatePNR() {
    return 'PNR' + Math.floor(1000000 + Math.random() * 9000000);
}

app.get('/health', (req, res) => {
    res.json({ ok: true, message: 'RailYatra backend is running' });
});

//////////////////////////////////////////////////////////////
// 🚂 BOOK TICKET
//////////////////////////////////////////////////////////////
app.post('/book', async (req, res) => {
    const { name, age, gender, phone, train_id, classType, travel_date } = req.body;

    if (!name || !age || !phone || !train_id) {
        return res.status(400).json({ message: 'Missing required booking fields' });
    }

    try {
        const [trainRows] = await dbPromise.query(
            'SELECT train_id, train_name, total_seats FROM train WHERE train_id = ?',
            [train_id]
        );

        if (trainRows.length === 0) {
            return res.status(404).json({ message: 'Train not found' });
        }

        const train = trainRows[0];
        const passengerId = await getNextId('passenger', 'passenger_id');

        await dbPromise.query(
            'INSERT INTO passenger (passenger_id, name, age, gender, phone) VALUES (?, ?, ?, ?, ?)',
            [passengerId, name, age, gender, phone]
        );

        const scheduleId = await getOrCreateSchedule(train_id, travel_date);
        const [countRows] = await dbPromise.query(
            "SELECT COUNT(*) AS bookedSeats FROM booking WHERE schedule_id = ? AND status = 'Confirmed'",
            [scheduleId]
        );

        const bookedSeats = Number(countRows[0].bookedSeats || 0);

        if (bookedSeats >= Number(train.total_seats)) {
            return res.status(400).json({ message: 'No seats available' });
        }

        const seatNumber = bookedSeats + 1;
        const pnr = generatePNR();
        const bookingId = await getNextId('booking', 'booking_id');
        const paymentId = await getNextId('payment', 'payment_id');

        await dbPromise.query(
            `INSERT INTO booking (booking_id, passenger_id, schedule_id, seat_number, PNR, status)
             VALUES (?, ?, ?, ?, ?, 'Confirmed')`,
            [bookingId, passengerId, scheduleId, seatNumber, pnr]
        );

        await dbPromise.query(
            `INSERT INTO payment (payment_id, booking_id, amount, payment_status, payment_date)
             VALUES (?, ?, ?, 'Paid', CURDATE())`,
            [paymentId, bookingId, 500]
        );

        res.json({
            message: 'Booking Confirmed',
            PNR: pnr,
            pnr,
            trainName: train.train_name,
            seatNumber,
            class: classType || `Seat ${seatNumber}`,
            status: 'Confirmed'
        });
    } catch (error) {
        res.status(500).json({ message: 'Booking failed', error: error.message });
    }
});

//////////////////////////////////////////////////////////////
// 📋 GET BOOKINGS
//////////////////////////////////////////////////////////////
app.get('/bookings', async (req, res) => {
    try {
        const [results] = await dbPromise.query(`
            SELECT
                b.PNR AS PNR,
                b.PNR AS pnr,
                p.name,
                t.train_name,
                t.train_name AS train_no,
                CONCAT('Seat ', b.seat_number) AS class,
                b.status,
                s.departure_date,
                b.seat_number
            FROM booking b
            JOIN passenger p ON b.passenger_id = p.passenger_id
            JOIN schedule s ON b.schedule_id = s.schedule_id
            JOIN train t ON s.train_id = t.train_id
            ORDER BY b.booking_id DESC
        `);

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
    }
});

//////////////////////////////////////////////////////////////
// 🔍 PNR CHECK
//////////////////////////////////////////////////////////////
app.get('/pnr/:pnr', async (req, res) => {
    const pnr = req.params.pnr;

    try {
        const [results] = await dbPromise.query(`
            SELECT
                b.PNR AS PNR,
                b.PNR AS pnr,
                p.name,
                t.train_name,
                t.train_name AS train_no,
                CONCAT('Seat ', b.seat_number) AS class,
                b.status,
                s.departure_date,
                b.seat_number
            FROM booking b
            JOIN passenger p ON b.passenger_id = p.passenger_id
            JOIN schedule s ON b.schedule_id = s.schedule_id
            JOIN train t ON s.train_id = t.train_id
            WHERE b.PNR = ?
        `, [pnr]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'PNR not found' });
        }

        res.json(results[0]);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch PNR', error: error.message });
    }
});

//////////////////////////////////////////////////////////////
// ❌ CANCEL BOOKING
//////////////////////////////////////////////////////////////
app.put('/cancel/:pnr', async (req, res) => {
    const pnr = req.params.pnr;

    try {
        const [result] = await dbPromise.query(
            "UPDATE booking SET status = 'Cancelled' WHERE PNR = ?",
            [pnr]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'PNR not found' });
        }

        res.json({ message: 'Booking Cancelled' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel booking', error: error.message });
    }
});

//////////////////////////////////////////////////////////////
// 🚀 SERVER
//////////////////////////////////////////////////////////////
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});