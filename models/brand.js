var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var BrandSchema = new Schema({
    name:{type:String,required:true,maxLength:30},
    imgURL:{type:String,required:false}
});

//Virtual for brand's url

BrandSchema
.virtual('url')
.get(function(){
    return '/catalog/brand/'+this._id;
});

module.exports=mongoose.model('Brand',BrandSchema);