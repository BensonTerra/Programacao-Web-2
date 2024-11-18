module.exports = (sequelize, DataTypes) => {
    const IngPerOrd = sequelize.define("ingredients_per_order", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Ingredient can not be empty or null!" } }
        },
    }, {
        timestamps: false
    });
    
    return IngPerOrd;
};