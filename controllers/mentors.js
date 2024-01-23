
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

const getMentorsByDepartment = async (db, mentee_id, track_id, MAX_MENTEE_CHOICES, MAX_MENTOR_CAPACITY) => {
    // Fetch mentors that are in the same department
    const mentors = await db('mentors as m')
        .leftJoin('iaf as i', 'm.iaf_id', '=', 'i.iaf_id') // Join with the iaf table
        .leftJoin('signups as s', function () {
            this.on('m.mentor_id', '=', 's.mentor_id')
                .andOn('s.mentee_id', '=', db.raw('?', [mentee_id]))
        })
        .leftJoin(db('signups as s2')
            .select('s2.mentor_id').count('* as current_mentee_count').groupBy('s2.mentor_id').as('s2'), 'm.mentor_id', '=', 's2.mentor_id')
        .select(
            'm.*',
            'i.name as iaf_name',
            db.raw('CASE WHEN s.mentor_id IS NOT NULL THEN TRUE ELSE FALSE END as is_registered'),
            db.raw('COALESCE(s2.current_mentee_count, 0) as current_mentee_count')
        )
        .where('m.track_id', '=', track_id)
        .orderBy('m.mentor_id');
    const sortedMentors = mentors.map(mentor => ({
        ...mentor,
        max_mentor_capacity: MAX_MENTOR_CAPACITY,
    })).sort((a, b) => a.mentor_id - b.mentor_id)
    const signups_total = mentors.reduce((count, mentor) => mentor.is_registered ? count + 1 : count, 0);
    return {
        mentors: sortedMentors,
        signupsTotal: signups_total,
        maxMenteeChoices: MAX_MENTEE_CHOICES
    }
};

const getMentorsForMenteeId = async (req, res, db, MAX_MENTEE_CHOICES, MAX_MENTOR_CAPACITY) => {
    try {
        const menteeId = req.query.menteeId;

        const user = await getMenteeDetails(db, menteeId);

        // Logic to determine the mentee's department
        const track_id = user.trackId;

        // Logic to fetch mentors from the same department
        const mentors = await getMentorsByDepartment(db, menteeId, track_id, MAX_MENTEE_CHOICES, MAX_MENTOR_CAPACITY);

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