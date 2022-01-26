var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var CategorySchema=new Schema({
    name:{type:String,required:true,maxLength:30},
    imgURL:{type:String,required:false}
});

//Virtual for Category's URL

CategorySchema
.virtual('url')
.get(function(){
    return '/catalog/category/'+this._id;
});

module.exports=mongoose.model('Category',CategorySchema);