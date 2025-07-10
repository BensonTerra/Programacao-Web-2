module.exports = (mongoose) => {
    const schema = new mongoose.Schema(
        {
            // by default, Mongoose adds an _id property to your schemas
            title: {
                type: String,
                required: [true, 'Username can not be empty or null!'],
                minlength: [5, 'Title must be at least 5 characters long!'],
                maxlength: [50, 'Title must be at most 50 characters long!']
            },
            description: {
                type: String,
                required: [true, 'Description can not be empty or null!']
            },
            published: {
                type: Boolean,
                default: false,
                // validate if is boolean (true or false)
                validate: {
                    validator: function (value) {
                        return typeof value === 'boolean';
                    },
                    message: 'Published must be a boolean value.'
                }
            },
            views: {
                // Views must be a non-negative integer
                type: Number,
                default: 0,
                min: [0, 'Views must be at least 0!'],
                // validate if is integer (0, 1, 2, ...)
                validate: {
                    validator: function (value) {
                        return Number.isInteger(value);
                    },
                    message: 'Views must be an integer value.'
                }
            },
            publishedAt: {
                type: Date,
                default: () => new Date(),
            },
            author: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
                required: [true, 'Author can not be empty or null!']
            },
        },
        { timestamps: false }
    );

    const Post = mongoose.model("post", schema);
    return Post;
};