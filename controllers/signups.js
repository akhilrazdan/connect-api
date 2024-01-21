const signupMenteeForMentor = async (db, menteeId, mentorId, MAX_MENTEE_CHOICES, MAX_MENTOR_CAPACITY) => {
    try {
        await db.transaction(async trx => {
            const mentee = await trx('users').where({ uid: menteeId }).first();
            const mentor = await trx('mentors').where({ id: mentorId }).first();

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

            await trx('users')
                .where({ uid: menteeId })
                .update({ current_mentor_count: mentee.current_mentor_count + 1 });

            await trx('mentors')
                .where({ id: mentorId })
                .update({ current_mentee_count: mentor.current_mentee_count + 1 });
        });

        return { message: 'Signup successful' };
    } catch (error) {
        console.error(error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

module.exports = { signupMenteeForMentor };