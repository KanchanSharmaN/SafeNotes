const mongoose = require("mongoose");

const fileSchema = mongoose.Schema({
    filename:{
        type: String,
        required:true
    },
    description:{
        type: String,
        required:true
    },
    date: {
        type: String,
        default: () => {
          const currentDate = new Date();
          const date = String(currentDate.getDate()).padStart(2, "0");
          const month = String(currentDate.getMonth() + 1).padStart(2, "0");
          const year = currentDate.getFullYear();
          return `${date}-${month}-${year}`;
        }
      }
      ,
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

})
const fileModel = mongoose.model('File',fileSchema);
module.exports = fileModel;
