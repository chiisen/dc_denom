const fs = require("fs")

const { excel, data, convert, helpers, file } = require("58-toolkit")
const { getExcel, writeMultiplePagesExcel } = excel
const { denomIndexToDenomString, denomIndexListStringToDefaultDenomString, mergeSortArray } = data
const { convertDenomListStringToExcelDenomList, convertExcelToDenomList, convertExcelToDenomString } = convert
const { isNumber } = helpers
const { emptyDir } = file

const { hallNameMap } = require("./hallName")
const { gameMinBetMap } = require("./gameMinBet")
const { minBetToExcelDenomListMap, minBetCurrencyToDefaultDenomNthMap } = require("./minBet")

const allDcDenomMap = new Map()

function initAllDcDenom() {
  const allDcDenomSheet_ = getExcel("./input/ALL_DC_DENOM.xlsx", false, "ALL_DC_DENOM")

  allDcDenomSheet_.forEach((row_) => {
    const cid_ = row_[0]
    const gameId_ = row_[1]
    const currency_ = row_[2]
    const denom_ = row_[3]
    const defaultDenomId_ = row_[4]

    if (gameId_ != "GameId") {
      const gameMinBet_ = gameMinBetMap.get(gameId_)

      const keyMinBetIdCurrency_ = `${gameMinBet_.minBet}-${currency_}`

      const excelDenomList_ = minBetToExcelDenomListMap.get(keyMinBetIdCurrency_)
      const denomList_ = convertExcelToDenomList(excelDenomList_)

      const denomString_ = convertExcelToDenomString(excelDenomList_)

      const defaultDenomNth_ = minBetCurrencyToDefaultDenomNthMap.get(keyMinBetIdCurrency_)
      const defaultDenomIndexNth_ = defaultDenomNth_ - 1
      const defaultMinBetDenomIndex_ = denomList_[defaultDenomIndexNth_]

      let isSame_ = true
      if (isNumber(denom_)) {
        if (denom_ != excelDenomList_[0]) {
          isSame_ = false
        }
      } else {
        const sourceDenomIndexList_ = denom_.split(",")
        isSame_ = mergeSortArray(sourceDenomIndexList_, denomList_)
      }

      const payLoad_ = {
        cid: cid_,
        gameId: gameId_,
        currency: currency_,
        denom: denom_,
        defaultDenomId: defaultDenomId_,
        minBet: gameMinBet_.minBet,
        name: gameMinBet_.name,
        minBetDenomIndexList: denomString_,
        defaultMinBetDenomIndex: defaultMinBetDenomIndex_,
        isSame: isSame_,
      }

      const valueGameIdByCurrency_ = allDcDenomMap.get(cid_)
      const newMapGameId_ = new Map()
      newMapGameId_.set(gameId_, payLoad_)
      const newMapCurrency_ = new Map()
      newMapCurrency_.set(currency_, newMapGameId_)

      if (!valueGameIdByCurrency_) {
        //沒有 Cid
        allDcDenomMap.set(cid_, newMapCurrency_)
      } else {
        //有 Cid
        const valueCurrency_ = valueGameIdByCurrency_.get(currency_)
        if (!valueCurrency_) {
          //沒有 Currency
          valueGameIdByCurrency_.set(currency_, newMapGameId_)
        } else {
          //有 Currency，檢查 GameId
          const valueGameId_ = valueCurrency_.get(gameId_)
          if (!valueGameId_) {
            //沒有 GameId
            valueCurrency_.set(gameId_, payLoad_)
          } else {
            //有 GameId
            console.error(`重複的 Currency: ${currency_} GameId: ${gameId_}`)
          }
        }
      }
    }
  })
}

/**
 * 輸出所有 DC 的 denom 到 EXCEL
 */
function exportAllDcDenomToExcel() {
  //刪除所有檔案
  emptyDir(`./output`)

  allDcDenomMap.forEach((valueGameIdCurrency_, keyCid_) => {
    let buff = []

    const hallName_ = hallNameMap.get(keyCid_)
    if (!hallName_) {
      console.error(`找不到 Cid: ${keyCid_}`) //@note 這是異常，先以 HALL_LIST 為主
      return //沒有 hallName 後面就不處理了
    } else {
      valueGameIdCurrency_.forEach((valueGameId_, keyCurrency_) => {
        let excelData = []
        let sheetName_ = keyCurrency_

        //標題
        excelData.push([
          "Cid",
          "GameId",
          "Name",
          "Currency",
          "資料庫的Denom",
          "MinBet",
          "Denom是否一致",
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
          "正確的MinBetDenom",
          "正確的預設MinBetDenom",
        ])

        //面額標題
        excelData.push([
          "", // Cid
          "", // GameId
          "", // Name
          "", // Currency
          "", // Denom
          "", // MinBet
          "", // Denom是否一致
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
          "", // DefaultDenomId
          "", // 預設面額
          "", // 正確的MinBetDenom
          "", // 正確的預設MinBetDenom
        ])

        valueGameId_.forEach((value_) => {
          let defaultDenomString_ = ""
          if (value_.defaultDenomId != 0) {
            defaultDenomString_ = denomIndexToDenomString(value_.defaultDenomId)
          } else {
            defaultDenomString_ = denomIndexListStringToDefaultDenomString(value_.denom)
          }

          const excelDenomList_ = convertDenomListStringToExcelDenomList(value_.denom)

          //寫入一筆資料的EXCEL
          excelData.push([
            value_.cid,
            value_.gameId,
            value_.name,
            value_.currency,
            value_.denom,
            value_.minBet,
            value_.isSame,
            ...excelDenomList_,
            value_.defaultDenomId,
            defaultDenomString_,
            value_.minBetDenomIndexList,
            value_.defaultMinBetDenomIndex,
          ])
        }) // valueGameId_ end
        const oneSheetData = { name: `${sheetName_}`, data: [...excelData] }
        buff.push(oneSheetData)
      }) // valueCurrency_ end
    } //else end

    let path_ = ""
    hallName_.pathList.forEach((x) => {
      path_ += `${x}/`
    })

    const fileName_ = `./output/${path_}/${hallName_.dc}.xlsx`

    writeMultiplePagesExcel(fileName_, buff)
  }) // allDcDenomMap end
}

module.exports = {
  initAllDcDenom,
  allDcDenomMap,
  exportAllDcDenomToExcel,
}
