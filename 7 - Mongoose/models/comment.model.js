module.exports = (mongoose) => {
    const schema = new mongoose.Schema(
            {
                text: { 
                    type: String, 
                    required: [true, 'Text can not be empty or null!'] }
            },
            { timestamps: false }
        );
  
    const Comment = mongoose.model("comment", schema);
    return Comment;
};