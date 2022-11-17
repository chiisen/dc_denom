const { excel, data, convert } = require("58-toolkit")
const { getExcel, writeMultiplePagesExcel } = excel
const { denomIndexToDenomString, denomIndexListStringToDenomListString, denomIndexListStringToDefaultDenomString } =
  data
const { convertDenomListStringToExcelDenomList } = convert

const { hallNameMap } = require("./hallName")

const allDcDenomMap = new Map()

function initAllDcDenom() {
  const allDcDenomSheet_ = getExcel("./input/ALL_DC_DENOM.xlsx", false, "ALL_DC_DENOM")

  allDcDenomSheet_.forEach((row_) => {
    const cid_ = row_[0]
    const gameId_ = row_[1]
    const currency_ = row_[2]
    const denom_ = row_[3]
    const defaultDenomId_ = row_[4]

    const payLoad_ = {
      cid: cid_,
      gameId: gameId_,
      currency: currency_,
      denom: denom_,
      defaultDenomId: defaultDenomId_,
    }

    if (gameId_ != "GameId") {
      const valueGameIdCurrency_ = allDcDenomMap.get(cid_)
      if (!valueGameIdCurrency_) {
        const keyGameIdCurrency_ = "${gameId_}-${currency_}"
        const newMapGameIdCurrency_ = new Map([[keyGameIdCurrency_, payLoad_]])
        allDcDenomMap.set(cid_, newMapGameIdCurrency_)
      } else {
        valueGameIdCurrency_.set(gameId_, payLoad_)
        allDcDenomMap.set(cid_, valueGameIdCurrency_)
      }
    }
  })
}

/**
 *
 */
function exportAllDcDenomToExcel() {
  allDcDenomMap.forEach((valueGameIdCurrency_, keyCid_) => {
    let buff = []

    let sheetName = hallNameMap.get(keyCid_)
    if (!sheetName) {
      console.error(`找不到 Cid: ${keyCid_}`) //@note 這是異常，先以 HALL_LIST 為主
    } else {
      let excelFishData = []

      //標題
      excelFishData.push([
        "Cid",
        "GameId",
        "Currency",
        "Denom",
        "29",
        "28",
        "27",
        "26",
        "25",
        "24",
        "23",
        "22",
        "21",
        "20",
        "19",
        "18",
        "17",
        "16",
        "15",
        "14",
        "13",
        "12",
        "11",
        "10",
        "9",
        "8",
        "7",
        "6",
        "5",
        "4",
        "3",
        "2",
        "1",
        "DefaultDenomId",
        "預設面額",
      ])

      excelFishData.push([
        "",
        "",
        "",
        "",
        "1:100000",
        "1:50000",
        "1:10000",
        "1:5000",
        "1:2000",
        "1:1000",
        "1:500",
        "1:200",
        "1:100",
        "1:50",
        "1:20",
        "1:10",
        "1:5",
        "1:2",
        "1:1",
        "2:1",
        "5:1",
        "10:1",
        "20:1",
        "50:1",
        "100:1",
        "200:1",
        "500:1",
        "1000:1",
        "2000:1",
        "5000:1",
        "10000:1",
        "50000:1",
        "100000:1",
        "",
        "",
      ])

      valueGameIdCurrency_.forEach((value_) => {
        let defaultDenomString_ = ""
        if (value_.defaultDenomId != 0) {
          defaultDenomString_ = denomIndexToDenomString(value_.defaultDenomId)
        } else {
          defaultDenomString_ = denomIndexListStringToDefaultDenomString(value_.denom)
        }

        console.log(value_.denom)
        const excelDenomList_ = convertDenomListStringToExcelDenomList(value_.denom)

        const denomListString_ = denomIndexListStringToDenomListString(value_.denom)

        excelFishData.push([
          value_.cid,
          value_.gameId,
          value_.currency,
          denomListString_,
          ...excelDenomList_,
          value_.defaultDenomId,
          defaultDenomString_,
        ])
      })

      const oneSheetData = { name: `${sheetName}`, data: [...excelFishData] }
      buff.push(oneSheetData)

      writeMultiplePagesExcel(`./output/${sheetName}.xlsx`, buff)
    }
  })
}

module.exports = {
  initAllDcDenom,
  allDcDenomMap,
  exportAllDcDenomToExcel,
}
