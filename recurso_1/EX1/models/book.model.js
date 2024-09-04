module.exports = (sequelize, DataTypes) => {
    const Book = sequelize.define("Book", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Title can not be empty or null!" } }
        },
    }, {
        timestamps: false
    });
    return Book;
};