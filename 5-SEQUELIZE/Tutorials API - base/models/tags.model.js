module.exports = (sequelize,DataTypes) => {
    const Tag = sequelize.define('Tag',{
        text: DataTypes.STRING,
        primaryKey: true,
    },
    {
        timestamp:false
    })
    return Tag
}