module.exports = (sequelize, DataTypes) => {
    const Book = sequelize.define("booksRecurso", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Title can not be empty or null!" } }
        },
    }, {
        tableName: 'booksRecurso', // Força o nome exato da tabela
        timestamps: false
    });
    
    return Book;
};