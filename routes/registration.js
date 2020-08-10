const express = require('express');
const router = express.Router();

const { default: ShortUniqueId } = require('short-unique-id');
const uid = new ShortUniqueId();
module.exports  = function(redis){
	router.post('/registerlot', (req, res,next)=>{
		var name =req.body.name;
		var location = req.body.location;
		var unid = uid.randomUUID(13);
		redis.hmset(unid, {name:name, location:location}, (err,reply)=>{
				if(err){
					res.json({success:false,status:0}).status(302);
					return;
				}
				res.json({success:true,status:1,lotid:unid}).status(201);
		});
		
	})


	return router;
}