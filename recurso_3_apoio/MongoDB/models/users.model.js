module.exports = (mongoose) => {
   const schema = new mongoose.Schema(
      {
         name: {
            type: String
         },
         email: {
            type: String
         },
         password: {
            type: String
         },
         role: {
            type: String,
            enum: ['student', 'teacher']
         }
      },
      { timestamps: false }
   );

   const user = mongoose.model("user", schema);
   return user;
};