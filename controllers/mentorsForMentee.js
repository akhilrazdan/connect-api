const { response } = require('express')
const mentors = require('./mentors')

const getChoicesForMentee = async (id, db, mentorsList, res) => {
    db.select("users.id",
        db.raw("(SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentee_id = users.id) AS signups_total"))
        .from('users')
        .where({ id })
        .then(data => {
            if (data.length) {
                console.log("Returning choice data for mentee")
                console.log(data[0])
                const response = {
                    signups_total: parseInt(data[0].signups_total),
                    max_mentee_choices: mentors.MAX_MENTEE_CHOICES,
                    mentors: mentorsList
                }
                res.json(response)
            } else {
                console.error('Error: Failed getting choices data for mentee id: ' + id)
                res.status(400).json("Nothing matteres")
            }
        })
        .catch(err => console.error(err))
}
const getMentorsForMentee = (req, res, db) => {
    // query = 'mentors.*, (SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentor_id = mentors.id) AS total_mentees'
    const { menteeId } = req.params;

    db.select("mentors.*",
        db.raw("(SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentor_id = mentors.id) AS total_mentees"),
        db.raw("? - (SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentor_id = mentors.id) AS available_slots", [mentors.MAX_MENTOR_SIGNUPS]),
        db.raw("(CASE WHEN EXISTS (SELECT * FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentor_id = mentors.id AND mentee_id = ?) THEN 'true' ELSE 'false' END) AS registered", [menteeId]))
        .from('mentors')
        .then(data => {
            if (data.length) {
                console.log("Server returning all mentors")
                getChoicesForMentee(menteeId, db, data, res)
            } else {
                res.status(400).json('No mentors!')
            }
        })
        .catch(err => res.status(400).json(err))
}

module.exports = {
    getMentorsForMentee
}
