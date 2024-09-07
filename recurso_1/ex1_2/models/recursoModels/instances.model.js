module.exports = (sequelize, DataTypes) => {
    const Instance = sequelize.define("instancesRecurso", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('Available', 'Booked', 'Maintenance'),
            allowNull: false
        },
        bookedBy: {
            type: DataTypes.STRING,
            allowNull: true
        },
        returnDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        bookId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'booksRecurso', // nome exato da tabela referenciada
                key: 'id'
            }
        }
    }, {
        tableName: 'instancesRecurso',
        timestamps: false
    });

    return Instance;
};
