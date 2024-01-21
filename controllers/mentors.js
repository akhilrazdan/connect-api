
// const getMentors = (res, db) => {
//     // query = 'mentors.*, (SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentor_id = mentors.id) AS total_mentees'

//     db.select("mentors.*", db.raw("(SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentor_id = mentors.id) AS total_mentees"), db.raw("? - (SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentor_id = mentors.id) AS available_slots", [MAX_MENTOR_SIGNUPS])).from('mentors')
//         .then(data => {
//             if (data.length) {
//                 console.log("Server returning all mentors")
//                 console.log(data)
//                 res.json(data)
//             } else {
//                 res.status(400).json('No mentors!')
//             }
//         })
//         .catch(err => res.status(400).json(err))
// }

const getMenteeDetails = async (db, uid) => {
    try {
        const menteeDetails = await db.select(
            'mentees.email as menteeEmail',
            'mentees.track_id as trackId',
            'users.uid as userId',
            'users.name as userName',
            'users.joined as userJoined'
        )
            .from('mentees')
            .leftJoin('users', 'mentees.email', 'users.email')
            .where('users.uid', uid)
            .first();  // Assuming UID is unique and you want a single record

        if (!menteeDetails) {
            throw new Error(`Mentee with UID ${uid} not found.`);
        }

        return menteeDetails;
    } catch (error) {
        console.error('Error fetching mentee details:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
};


const getMenteeDepartment = async (db, menteeId) => {
    // Fetch the mentee's department based on menteeId
    const result = await db.select('track_id').from('users').where('uid', '=', menteeId).first();
    if (!result) {
        throw new Error(`Mentee with ID ${menteeId} not found.`);
    }
    return result.track_id;
};

const getMentorsByDepartment = async (db, track_id, MAX_MENTOR_CAPACITY) => {
    // Fetch mentors that are in the same department
    const mentors = await db.select('*').from('mentors').where('track_id', '=', track_id);
    // add a member called max_mentor_capacity to each member of mentors array
    return mentors.map(mentor => ({
        ...mentor,
        max_mentor_capacity: MAX_MENTOR_CAPACITY,
    }))
};

const getMentorsForMenteeId = async (req, res, db, MAX_MENTOR_CAPACITY) => {
    try {
        const menteeId = req.query.menteeId;

        const user = await getMenteeDetails(db, menteeId);

        // Logic to determine the mentee's department
        const track_id = user.trackId;
        console.log(`user : ${JSON.stringify(user)}`)

        // Logic to fetch mentors from the same department
        const mentors = await getMentorsByDepartment(db, track_id, MAX_MENTOR_CAPACITY);

        res.json(mentors);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

module.exports = {
    getMentorsForMenteeId,
}

// select mentors.*, (SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentor_id = mentors.id) AS total_mentees from mentors;