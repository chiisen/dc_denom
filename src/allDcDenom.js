const { excel, data, convert, helpers, file } = require("58-toolkit")
const { getExcel, writeMultiplePagesExcel, writeMultiplePagesExcelJs } = excel
const { denomIndexToDenomString, denomIndexListStringToDefaultDenomString, mergeSortArray } = data
const { convertDenomListStringToExcelDenomList, convertExcelToDenomList, convertExcelToDenomString } = convert
const { isNumber } = helpers
const { emptyDir } = file

const { hallNameMap } = require("./hallName")
const { gameMinBetMap } = require("./gameMinBet")
const { minBetToExcelDenomListMap, minBetCurrencyToDefaultDenomNthMap } = require("./minBet")

const allDcDenomMap = new Map()
const isDiffMap = new Map() // 不一致的 HALL 列表

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
async function exportAllDcDenomToExcel() {
  //刪除所有檔案
  emptyDir(`./output`)

  allDcDenomMap.forEach((valueGameIdCurrency_, keyCid_) => {
    let buff_ = []

    let excelJsBuff_ = []

    let isDiff_ = false
    const hallName_ = hallNameMap.get(keyCid_)
    if (!hallName_) {
      console.error(`找不到 Cid: ${keyCid_}`) //@note 這是異常，先以 HALL_LIST 為主
      return //沒有 hallName 後面就不處理了
    } else {
      valueGameIdCurrency_.forEach((valueGameId_, keyCurrency_) => {
        let excelData_ = []

        let excelJsColumns_ = []
        let excelJsRows = []

        let sheetName_ = keyCurrency_

        //標題
        excelData_.push([
          "Cid",
          "GameId",
          "Name",
          "Currency",
          "資料庫的Denom",
          "DefaultDenomId",
          "預設面額",
          "正確的MinBetDenom",
          "正確的預設MinBetDenom",
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
        ])

        // ExcelJs 標題
        excelJsColumns_.push(
          { name: "Cid" },
          { name: "GameId" },
          { name: "Name" },
          { name: "Currency" },
          { name: "資料庫的Denom" },
          { name: "DefaultDenomId" },
          { name: "預設面額" },
          { name: "正確的MinBetDenom" },
          { name: "正確的預設MinBetDenom" },
          { name: "MinBet" },
          { name: "Denom是否一致" },
          { name: "29" },
          { name: "28" },
          { name: "27" },
          { name: "26" },
          { name: "25" },
          { name: "24" },
          { name: "23" },
          { name: "22" },
          { name: "21" },
          { name: "20" },
          { name: "19" },
          { name: "18" },
          { name: "17" },
          { name: "16" },
          { name: "15" },
          { name: "14" },
          { name: "13" },
          { name: "12" },
          { name: "11" },
          { name: "10" },
          { name: "9" },
          { name: "8" },
          { name: "7" },
          { name: "6" },
          { name: "5" },
          { name: "4" },
          { name: "3" },
          { name: "2" },
          { name: "1" }
        )

        const denomTitle_ = [
          "", // Cid
          "", // GameId
          "", // Name
          "", // Currency
          "", // Denom
          "", // DefaultDenomId
          "", // 預設面額
          "", // 正確的MinBetDenom
          "", // 正確的預設MinBetDenom
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
        ]

        //面額標題
        excelData_.push(denomTitle_)

        // ExcelJs 面額標題
        excelJsRows.push(denomTitle_)

        valueGameId_.forEach((value_) => {
          let defaultDenomString_ = ""
          if (value_.defaultDenomId != 0) {
            defaultDenomString_ = denomIndexToDenomString(value_.defaultDenomId)
          } else {
            defaultDenomString_ = denomIndexListStringToDefaultDenomString(value_.denom)
          }

          const excelDenomList_ = convertDenomListStringToExcelDenomList(value_.denom)

          const denomPayLoad_ = [
            value_.cid,
            value_.gameId,
            value_.name,
            value_.currency,
            value_.denom,
            value_.defaultDenomId,
            defaultDenomString_,
            value_.minBetDenomIndexList,
            value_.defaultMinBetDenomIndex,
            value_.minBet,
            value_.isSame,
            ...excelDenomList_,
          ]

          // 紀錄不一致的客戶
          if (!isDiff_) {
            isDiffMap.set(keyCid_, denomPayLoad_)
            isDiff_ = true
          }

          //寫入一筆資料的EXCEL
          excelData_.push(denomPayLoad_)

          // ExcelJs 寫入一筆資料的EXCEL
          excelJsRows.push(denomPayLoad_)
        }) // valueGameId_ end
        const oneSheetData = { name: `${sheetName_}`, data: [...excelData_] }
        buff_.push(oneSheetData)

        const oneExcelJsSheetData = {
          sheetName: `${sheetName_}`,
          columns: [...excelJsColumns_],
          rows: [...excelJsRows],
        }
        excelJsBuff_.push(oneExcelJsSheetData)
      }) // valueCurrency_ end
    } //else end

    let path_ = ""
    hallName_.pathList.forEach((x) => {
      path_ += `${x}/`
    })

    const fileName_ = `./output/${path_}/${hallName_.dc}.xlsx`

    writeMultiplePagesExcel(fileName_, buff_)

    //writeMultiplePagesExcelJs(fileName_, excelJsBuff_)
  }) // allDcDenomMap end

  let buff_ = []

  let excelData_ = []
  const sheetName_ = `All`
  isDiffMap.forEach((v, k) => {
    const hallName_ = hallNameMap.get(v[0])

    let path_ = ""
    hallName_.pathList.forEach((x) => {
      path_ += `${x}/`
    })
    excelData_.push([`${hallName_.dc}`, `${path_}`, `${v[10]}`])
  })

  const oneSheetData = { name: `${sheetName_}`, data: [...excelData_] }
  buff_.push(oneSheetData)

  writeMultiplePagesExcel(`./output/diff.xlsx`, buff_)
}

module.exports = {
  initAllDcDenom,
  allDcDenomMap,
  exportAllDcDenomToExcel,
}
