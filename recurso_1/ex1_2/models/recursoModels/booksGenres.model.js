module.exports = (sequelize, DataTypes) => {
    const BooksGenres = sequelize.define("booksGenresRecurso", {
        bookId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'booksRecurso', // nome exato da tabela referenciada
                key: 'id'
            }
        },
        genreName: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'genresRecurso', // nome exato da tabela referenciada
                key: 'name'
            }
        }
    }, {
        tableName: 'booksGenresRecurso',
        timestamps: false
    });

    return BooksGenres;
};
