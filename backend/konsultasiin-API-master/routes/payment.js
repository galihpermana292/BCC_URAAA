const router = require("express").Router();
const Payment = require("../Models/Payment");
const Dosen = require("../Models/Dosen");
const midtransClient = require("midtrans-client");

let coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: "SB-Mid-server-KJhF1EBlbLFpuVHflMr2DxTm",
  clientKey: "SB-Mid-client-dyrxC4AokmQVl_8E",
});

router.get("/payment", async (req, res) => {
  try {
    const data = await Payment.find();
    let tampilData = data.map(item => {
      return {
        id: item._id,
        userId: item.userId,
        dosenId: item.dosenId,
        order_id: item.order_id,
        type: item.type,
        hari: item.hari,
        jam: item.jam,
        lokasi: item.lokasi,
        responseMidtrans: JSON.parse(item.responseMidtrans),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });
    res.status(200).send({
      success: true,
      message: "Success",
      data: tampilData,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err,
    });
  }
});

router.get("/payment/:_id", async (req, res) => {
  try {
    const data = await Payment.findById(req.params._id);

    res.status(200).send({
      success: true,
      message: "Success",
      data: data,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err,
    });
  }
});

router.get("/payment/history/:userId", async (req, res) => {
  try {
    let data = await Payment.find({ userId: req.params.userId }).populate({
      path: "dosenId",
      model: Dosen,
      select: { namaLengkap: 1, fakultas: 1, image: 1, lokasiJadwal: 1 },
    });
    let tampilData = data.map(item => {
      return {
        id: item._id,
        userId: item.userId,
        dosenId: item.dosenId,
        order_id: item.order_id,
        type: item.type,
        hari: item.hari,
        jam: item.jam,
        lokasi: item.lokasi,
        responseMidtrans: JSON.parse(item.responseMidtrans),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });
    res.status(200).send({
      success: true,
      message: "Success",
      data: tampilData,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err,
    });
  }
});

router.post("/payment", async (req, res) => {
  try {
    chargeResponse = await coreApi.charge(req.body);
    let dataOrder = {
      dosenId: req.body.dosenId,
      userId: req.body.userId,
      order_id: chargeResponse.order_id,
      type: req.body.type,
      hari: req.body.hari,
      jam: req.body.jam,
      lokasi: req.body.lokasi,
      responseMidtrans: JSON.stringify(chargeResponse),
    };
    const data = await Payment.create(dataOrder);
    res.status(200).send({
      success: true,
      message: "Success",
      data: data,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err,
    });
  }
});

router.post("/notifikasi", function (req, res) {
  coreApi.transaction.notification(req.body).then(statusResponse => {
    let orderId = statusResponse.order_id;
    let responseMidtrans = JSON.stringify(statusResponse);
    Payment.updateOne(
      { order_id: orderId },
      {
        responseMidtrans: responseMidtrans,
      }
    )
      .then(() => {
        res.status(200).send({
          success: true,
          message: "Success",
          data: [],
        });
      })
      .catch(err => {
        res.status(500).send({
          success: false,
          message: err,
        });
      });
  });
});

router.delete("/payment/:_id", async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params._id);
    res.status(200).send({
      success: true,
      message: "Payment Has Been Deleted!",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err,
    });
  }
});

module.exports = router;
