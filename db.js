console.log("db.js running!");

const spicedPg = require("spiced-pg");

let secrets;
if (process.env.NODE_ENV === "production") {
    secrets = process.env;
} else {
    secrets = require("./secrets.json");
}

const dbUrl =
    process.env.DATABASE_URL ||
    `postgres:${secrets.dbUser}:${secrets.dbPassword}@localhost:5432/images`;

const db = spicedPg(dbUrl);

// exports.get21Images = function(id) {
//     return db.query(
//         `SELECT * FROM images
//     WHERE id < $1
//     ORDER BY id DESC
//     LIMIT 21;`,
//         [id]
//     );
// };
//
// `SELECT * FROM images
//     WHERE id
//      id ASC
//      LIMIT 1;`;

exports.getMoreImages = function(id) {
    return db
        .query(
            `SELECT * FROM IMAGES
            WHERE id < $1
            ORDER by id DESC
        LIMIT 9;`,
            [id]
        )
        .then(result => {
            return result.rows;
        });
};
exports.getImages = function() {
    return db
        .query(`SELECT * FROM images ORDER BY id DESC LIMIT 9`)
        .then(result => {
            return result.rows;
        });
};

exports.uploadData = function(username, desc, file, title) {
    return db
        .query(
            `INSERT INTO images (username, description, url, title) VALUES ($1,$2,$3,$4) returning *`,
            [username, desc, file, title]
        )
        .then(result => {
            console.log("RESULTTTT.rows DB:", result.rows);

            return result.rows;
        });
};

exports.getBigImage = function(id) {
    return db.query(`SELECT * FROM images WHERE id = $1`, [id]).then(result => {
        return result.rows[0];
    });
};

exports.showComments = function(user_id) {
    return db
        .query(`SELECT * FROM comments WHERE user_id = $1`, [user_id])
        .then(result => {
            return result.rows;
        });
};

exports.uploadComment = function(id, username, comment) {
    return db
        .query(
            `INSERT INTO comments (user_id, username, comment) VALUES ($1,$2,$3) returning *`,
            [id, username, comment]
        )
        .then(comments => {
            console.log("comments.rows DB:", comments.rows[0]);

            return comments.rows[0];
        });
};
exports.deleteImage = function(id) {
    return db
        .query(`DELETE FROM images CASCADE WHERE id = $1 RETURNING *`, [id])
        .then(result => {
            return result.rows[0];
        });
};

exports.deleteComments = function(id) {
    return db
        .query(`DELETE FROM comments CASCADE WHERE user_id = $1 RETURNING *`, [
            id
        ])
        .then(result => {
            return result.rows[0];
        });
};
