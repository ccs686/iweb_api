const express = require("express");
const pool = require("../pool");
const router = express.Router();

// 添加购物车 /cart/add
router.post("/add", function(req,res){
  var obj = req.body;
  // 用户id参数
  if (!obj.uid) {
    res.json({code:301, msg:"uid is required"});
    return;
  }
  // 商品id参数
  if (!obj.cid) {
    res.json({code:302, msg:"cid is required"});
    return;
  }
  // 购买数量参数
  if (!obj.count) {
    obj.count = 1;
  }
  //     uid                      cid
  // 查询用户的购物车中是否已经添加过该商品?
  let sql = "SELECT count(*) as num FROM cart WHERE userId=? AND courseId=?";
  pool.query(sql, [obj.uid,obj.cid],(err, result)=>{
    if (err) throw err;
    if (result[0].num > 0) {
      // 商品已在购物车中(更新购买数量)
      var sql = `UPDATE cart SET count=count+${obj.count} WHERE userId=${obj.uid} AND courseId=${obj.cid}`;
    } else {
      // 商品尚未添加到购物车中(执行添加)
      var sql = `INSERT INTO cart VALUES (NULL, ${obj.uid}, ${obj.cid}, ${obj.count})`;
    }
    pool.query(sql, (err,result)=>{
      if (err) throw err;
      if (result.affectedRows > 0) {
        res.json({code:200,msg:"success"});
      } else {
        res.json({code:400,msg:"failed"});
      }
    });
  });
});

// 查询购物车(列表) /cart/list
router.post("/list", (req,res)=>{
  var obj = req.body;
  if (!obj.uid) {
    res.json({code: 301, msg: "uid is required"});
    return;
  }
  // 根据用户id,查询该用户的购物车信息
  let sql = "SELECT course.title, course.price, course.pic, cart.courseId,cart.count, cart.ctid FROM cart,course WHERE cart.courseId=course.cid AND cart.userId=?";
  pool.query(sql, [obj.uid], (err, result)=>{
    if (err) throw err;
    if (result.length > 0) {
      res.json({code: 200,msg:"success",data: result});
    } else { // 购物车为空
      res.json({code: 201,msg:"cart is empty"});
    }
  });
});

// 更新购物车(购买数量) /cart/update
router.post("/update", (req,res)=>{
  var obj = req.body;
  if (!obj.ctid) {
    res.json({code: 301, msg:"ctid is required"});
    return;
  }
  if (!obj.count) {
    res.json({code: 302, msg:"count is required"});
    return;
  }
  let sql = "UPDATE cart SET count=? WHERE ctid=?";
  pool.query(sql, [obj.count, obj.ctid], (err, result)=>{
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.json({code:200,msg:"success"});
    } else {
      res.json({code:301,msg:"failed"});
    }
  });
});

// 清空购物车 /cart/empty
router.post("/empty", (req,res)=>{
  var obj = req.body;
  if (!obj.uid) {
    res.json({code: 301, msg:"uid is required"});
    return;
  }
  let sql = "DELETE FROM cart WHERE userId=?";
  pool.query(sql, [obj.uid], (err, result)=>{
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.json({code:200,msg:"success"});
    } else {
      res.json({code:301,msg:"failed"});
    }
  });
});

// 删除购物车中的商品记录 /cart/delete
router.post("/delete", (req,res)=>{
  var obj = req.body;
  if (!obj.ctid) {
    res.json({code: 301, msg:"ctid is required"});
    return;
  }
  let sql = "DELETE FROM cart WHERE ctid=?";
  pool.query(sql, [obj.ctid], (err, result)=>{
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.json({code:200,msg:"success"});
    } else {
      res.json({code:301,msg:"failed"});
    }
  });
})


module.exports=router;