module.exports = (sequelize, DataTypes) => {
    const Genre = sequelize.define("genresRecurso", {
        name: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        }
    }, {
        tableName: 'genresRecurso',
        timestamps: false
    });

    return Genre;
};
