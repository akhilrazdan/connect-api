const MAX_MENTEE_CHOICES = 5;
const MAX_MENTOR_SIGNUPS = 2;

const getMentors = (res, db) => {
    // query = 'mentors.*, (SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentor_id = mentors.id) AS total_mentees'

    db.select("mentors.*", db.raw("(SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentor_id = mentors.id) AS total_mentees"), db.raw("? - (SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentor_id = mentors.id) AS available_slots", [MAX_MENTOR_SIGNUPS])).from('mentors')
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
    getMentors, 
    MAX_MENTEE_CHOICES,
    MAX_MENTOR_SIGNUPS
}

// select mentors.*, (SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentor_id = mentors.id) AS total_mentees from mentors;