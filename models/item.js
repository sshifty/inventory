var mongoose=require('mongoose');
var Schema=mongoose.Schema;


var ItemSchema=new Schema({
    name:{type:String,required:true,maxlength: 30},
    category:[{type:Schema.Types.ObjectId,ref:'Category',required:true}],
    brand:{type:Schema.Types.ObjectId,ref:'Brand',required:true},
    desc:{type:String,required:true,maxlengt:150},
    qty:{type:Number,required:true,min:0,max:10000},
    price:{type:Number,required:true,min:0,max:10000},
    imgURL:{type:String,required:false}
});

//Virtual for item's url

ItemSchema
.virtual('url')
.get(function(){
    return '/catalog/item/'+this._id;
});

module.exports=mongoose.model('Item',ItemSchema);

