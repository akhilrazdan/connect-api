const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');
const { createObjectCsvWriter } = require('csv-writer');
const getStatistics = async (req, res, db) => {
    try {
        // Query 1: Count unique mentees signed up
        const uniqueMenteesCount = await db('signups').countDistinct('mentee_id as count');

        // Query 2: Count unique mentors signed up
        const uniqueMentorsCount = await db('signups').countDistinct('mentor_id as count');

        // Query 3: Get mentees who have not signed up
        const menteesNotSignedUp = await db('mentees as m')
            .leftJoin('users as u', 'm.email', 'u.email')
            .leftJoin('signups as s', 'u.uid', 's.mentee_id')
            .select('m.email', 'u.name')
            .where('m.role_id', 2)
            .andWhere('s.mentee_id', null);

        // Construct the response object
        const statistics = {
            totalUniqueMentees: uniqueMenteesCount[0].count,
            totalUniqueMentors: uniqueMentorsCount[0].count,
            menteesNotSignedUp: menteesNotSignedUp.map(mentee => { return { email: mentee.email, name: mentee.name } })
        };

        res.json(statistics);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching admin statistics');
    }
};

const downloadSignups = async (req, res, db) => {
    try {
        const signups = await db('signups as s')
            .join('mentors as mt', 's.mentor_id', 'mt.mentor_id')
            .join('users as me', 's.mentee_id', 'me.uid')
            .select([
                's.signup_id',
                'me.email as mentee_email',
                'me.name as mentee_name',
                'mt.name as mentor_name',
                'mt.track_id',
                'mt.iaf_id',
                db.raw("s.signed_up_at as signed_up_at")
            ])
            .orderBy('signed_up_at', 'desc');

        const formattedSignups = signups.map(signup => {
            return {
                ...signup,
                signed_up_at: signup.signed_up_at
                    ? moment(signup.signed_up_at).format()
                    : ''
            };
        });
        // CSV writer
        const filePath = path.join(__dirname, 'signups-report.csv');
        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: [
                { id: 'signup_id', title: 'SIGNUP_ID' },
                { id: 'mentee_email', title: 'MENTEE_EMAIL' },
                { id: 'mentee_name', title: 'MENTEE_NAME' },
                { id: 'mentor_name', title: 'MENTOR_NAME' },
                { id: 'track_id', title: 'TRACK_ID' },
                { id: 'iaf_id', title: 'IAF_ID' },
                { id: 'signed_up_at', title: 'SIGNED_UP_AT(PT)' }
            ]
        });
        // Write data to CSV
        await csvWriter.writeRecords(formattedSignups);

        // Send file
        res.download(filePath, 'signups-report.csv', () => {
            fs.unlinkSync(filePath); // Remove file after sending
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating report');
    }
}
module.exports = {
    downloadSignups,
    getStatistics
}