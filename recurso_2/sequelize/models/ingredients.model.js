module.exports = (sequelize, DataTypes) => {
    const Ing = sequelize.define("ingredients", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Ingredient can not be empty or null!" } }
        },
        status: {
            type: DataTypes.ENUM('base', 'topping', 'dressing'),
            allowNull: false
        },
        savings: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        timestamps: false
    });
    
    return Ing;
};