module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define("orders", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Title can not be empty or null!" } }
        },
        status: {
            type: DataTypes.ENUM('recieved', 'making', 'ready', 'picked', 'cancelled'),
            allowNull: false
        },
        student: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
    }, {
        tableName: 'orders', // Força o nome exato da tabela
        timestamps: false
    });
    
    return Order;
};