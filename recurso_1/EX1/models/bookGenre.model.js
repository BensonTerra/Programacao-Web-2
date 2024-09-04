module.exports = (sequelize, DataTypes) => {
    const BookGenre = sequelize.define("BookGenre", {
        genreName: {
            primaryKey: true,
            type: DataTypes.STRING,
        }
    }, {
        timestamps: false
    });
    return BookGenre;
};