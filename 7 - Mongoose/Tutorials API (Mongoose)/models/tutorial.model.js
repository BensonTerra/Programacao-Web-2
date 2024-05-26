module.exports = (mongoose) => {
    const schema = new mongoose.Schema(
        {
            // by default, Mongoose adds an _id property to your schemas
            title: { 
                type: String, 
                required: [true, 'Title can not be empty or null!'] 
            },
            description: String,
            published: { 
                type: Boolean, default: false
            },
            comments: [
                { type: mongoose.Schema.Types.ObjectId, ref: 'comment' }
            ]
        },
        { timestamps: false }
    );

    const Tutorial = mongoose.model("tutorial", schema);
    return Tutorial;
};