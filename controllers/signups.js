const signupMenteeForMentor = async (db, menteeId, mentorId, MAX_MENTEE_CHOICES, MAX_MENTOR_CAPACITY) => {
    try {
        if (menteeId === undefined || mentorId === undefined) {
            throw new Error('Invalid mentee or mentor ID'); // !TODO-akhilz Please send these as 400
        }
        console.log(`menteeId ${menteeId} mentorId ${mentorId}`);
        await db.transaction(async trx => {
            const mentee = await trx('users')
                .join('mentees', 'users.email', '=', 'mentees.email')
                .leftJoin('signups', 'users.uid', '=', 'signups.mentee_id')
                .where({ 'users.uid': menteeId })
                .select('users.*', 'mentees.track_id')
                .countDistinct('signups.mentor_id as current_mentor_count')
                .groupBy('users.uid', 'mentees.track_id')
                .first();

            const mentor = await trx('mentors')
                .leftJoin('signups', 'mentors.mentor_id', '=', 'signups.mentor_id')
                .where({ 'mentors.mentor_id': mentorId })
                .select('mentors.*')
                .countDistinct('signups.mentee_id as current_mentee_count')
                .groupBy('mentors.mentor_id')
                .first();

            if (!mentee || !mentor) {
                throw new Error('Mentor or mentee not found');
            }
            // Check if mentee and mentor are in the same department
            if (mentee.track_id !== mentor.track_id) {
                throw new Error(`Mentee and mentor are not in the same department ${mentee.track_id} ${mentor.track_id}`); // TODO-akhilz This is a 400 error, currently going as 500
            }

            if (mentee.current_mentor_count >= MAX_MENTEE_CHOICES) {
                throw new Error('Mentee has reached maximum choices');
            }

            if (mentor.current_mentee_count >= MAX_MENTOR_CAPACITY) {
                throw new Error('Mentor has reached maximum capacity');
            }

            await trx('signups').insert({ mentee_id: menteeId, mentor_id: mentorId });
        });

        return { message: 'Signup successful' };
    } catch (error) {
        console.error(error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

module.exports = { signupMenteeForMentor };