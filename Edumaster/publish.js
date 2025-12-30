const db = require('./config/db');

async function publishCourse() {
    try {
        await db.query("UPDATE courses SET status = 'Published' WHERE id = 1");
        console.log('Course published');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

publishCourse();