
const getMentors = (res, db) => {
    // query = 'mentors.*, (SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentor_id = mentors.id) AS total_mentees'

    db.select("mentors.*", db.raw("(SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentor_id = mentors.id) AS total_mentees"), db.raw("2 - (SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentor_id = mentors.id) AS available_slots")).from('mentors')
        .then(data => {
            if (data.length) {
                console.log("Server returning all mentors")
                console.log(data)
                res.json(data)
            } else {
                res.status(400).json('No mentors!')
            }
        })
        .catch(err => res.status(400).json(err))
}

module.exports = {
    getMentors
}

// select mentors.*, (SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentor_id = mentors.id) AS total_mentees from mentors;