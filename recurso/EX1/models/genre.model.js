module.exports = (sequelize, DataTypes) => {
    const Genre = sequelize.define("Genre", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Title can not be empty or null!" } }
        },
    }, {
        timestamps: false
    });
    return Genre;
};