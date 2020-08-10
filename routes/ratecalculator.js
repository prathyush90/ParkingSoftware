const express = require('express');
const router = express.Router();
const vehiclemap = {};
const { default: ShortUniqueId } = require('short-unique-id');
const uid = new ShortUniqueId();
module.exports  = function(redis){
	router.post('/unparkvehicle', (req, res,next)=>{
		var vehicleNum = req.body.vehicleNum;
		redis.hgetall(vehicleNum+"-->park", (err, reply)=>{
			if(err || !reply){
				res.json({success:false,status:0, msg:"Nosuch Vehicle Parked"}).status(404);
			}else{
				var timeParked  = reply.entryTime;
				var milliPassed = Date.now()- timeParked;
				var type		= reply.type;
				var amount =0;
				if(type == 0){
					//2 wheeler - 0.1r/sec
					amount = 0.1*(milliPassed/1000);
				}else if(type==1){
					//car - 0.2r/sec
					amount = 0.2*(milliPassed/1000);
				}
				redis.del(vehicleNum+"-->park",(err,res)=>{

				})
				var lotid = reply.lotid;
				var type   = reply.type;
				var removekey = lotid+"<-->"+type;
				redis.hgetall(removekey, (err, reply)=>{
					var valueCurrent = reply.current + 1;
					if(valueCurrent < 0){
						valueCurrent = 0;
					}
					//update current value
					redis.hmset(removekey, {current:valueCurrent, vehicleNum:vehicleNum}, (err, reply)=>{

					});
				});
				res.json({success:true,status:1, msg:"Please pay "+amount+" rs"}).status(200);
				var toSaveObj = {};
				toSaveObj['lotid']   = reply.lotid;
				toSaveObj['amount']  = amount+" rupees";
				toSaveObj['duration']= milliPassed/1000+" seconds";
				if(!vehiclemap[vehicleNum]){
					vehiclemap[vehicleNum] = [];

				}
				var array = vehiclemap[vehicleNum];
				array.push(toSaveObj);
				vehiclemap[vehicleNum] = array;
			}
		})
	});

	router.post('/reportvehiclelog', (req, res,next)=>{
		var vehicleNum = req.body.vehicleNum;
		if(!vehiclemap[vehicleNum]){
			res.json({success:false,status:0, msg:"No data for such vehicle"}).status(302);
		}else{
			res.json({success:true,status:1, data:vehiclemap[vehicleNum]}).status(200);
		}
	});
		
	


	return router;
}