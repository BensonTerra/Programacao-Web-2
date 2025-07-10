module.exports = (mongoose) => {
    const schema = new mongoose.Schema(
        {
            // by default, Mongoose adds an _id property to your schemas
            username: {
                type: String,
                // set unique to true to avoid duplicates
                unique:  [true, 'Username {VALUE} already in use!'],
                required: [true, 'Username can not be empty or null!']
            },
            password: {
                type: String,
                required: [true, 'Password can not be empty or null!']
            },
            role: {
                type: String, 
                enum: {
                    values: ['admin', 'editor'],
                    message: '{VALUE} is not supported! Role must be one of the following: admin or editor'
                },
                default: 'editor'
            },
        },
        { timestamps: false }
    );

    const User = mongoose.model("user", schema);
    return User;
};