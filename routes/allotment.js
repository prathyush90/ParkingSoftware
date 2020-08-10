const express = require('express');
const router = express.Router();
module.exports  = function(redis){
	router.post('/parkvehicle', (req, res,next)=>{
		var lotid = req.body.lotid;
		var type  = req.body.type;//0 -2 wheeler 1 -car
		var vehicleNum = req.body.vehicleNum;
		redis.hgetall(vehicleNum+"-->park",  (err, reply)=>{
			if(reply){
				//car already parked
				res.json({success:false,status:0, msg:"Cant park same car again"}).status(404);
				return
			}else{
		
				redis.hgetall(lotid, (err, reply)=>{
					if(!reply){
						res.json({success:false,status:0, msg:"Invalid parking lot"}).status(404);
						return
					}
					//res.json({success:true,status:1}).status(200);
					var keyVal = lotid+"<-->"+type;
					redis.hgetall(keyVal, (err, reply)=>{
						let currVal = 2;
						if(reply){
							currVal = reply.current
						}
						
						if(currVal > 0){
							res.json({success:true,status:1, msg:"Parked succesfully"}).status(200);
							var valueCurrent = currVal - 1;
							//update current value
							redis.hmset(keyVal, {current:valueCurrent, vehicleNum:vehicleNum}, (err, reply)=>{

							});
							//update car entry time
							var carObj = {}
							carObj['entryTime'] = Date.now();
							carObj['lotid']		= lotid;
							carObj['type']		= type;

							redis.hmset(vehicleNum+"-->park", carObj, (err, res)=>{
								console.log(err);
							})

							//for report purposes

						}else{
							res.json({success:false,status:2, msg:"No Space Available"}).status(200);
						}
					});

				});
			}
		})
		
	})


	return router;
}
