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

    if (cid_ === undefined) {
      console.warn("cid_ is undefined")
    }

    if (gameId_ === undefined) {
      console.warn("gameId_ is undefined")
    }

    if (currency_ === undefined) {
      console.warn("currency_ is undefined")
    }

    if (denom_ === undefined) {
      console.warn("denom_ is undefined")
    }

    if (defaultDenomId_ === undefined) {
      console.warn("defaultDenomId_ is undefined")
    }

    const payLoad_ = {
      cid: cid_,
      gameId: gameId_,
      currency: currency_,
      denom: denom_,
      defaultDenomId: defaultDenomId_,
    }

    if (gameId_ != "GameId") {
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
  allDcDenomMap.forEach((valueCurrency_, keyCid_) => {
    let buff = []

    const hallName_ = hallNameMap.get(keyCid_)
    if (!hallName_) {
      console.error(`找不到 Cid: ${keyCid_}`) //@note 這是異常，先以 HALL_LIST 為主
      return //沒有 hallName 後面就不處理了
    } else {
      let excelData = []

      let sheetName_

      //標題
      excelData.push([
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

      //面額標題
      excelData.push([
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

      valueCurrency_.forEach((valueGameId_, keyCurrency_) => {
        sheetName_ = keyCurrency_

        valueGameId_.forEach((valuePayLoad_, keyGameId_) => {
          let defaultDenomString_ = ""
          if (valuePayLoad_.defaultDenomId != 0) {
            if (valuePayLoad_.defaultDenomId === undefined) {
              const msg_ = `[Cid: ${keyCid_} Currency: ${keyCurrency_} GameId: ${keyGameId_}] valuePayLoad_.defaultDenomId is undefined`
              console.error(msg_)
              return // 資料有異常，下面不處理了
            } else {
              defaultDenomString_ = denomIndexToDenomString(valuePayLoad_.defaultDenomId)
            }
          } else {
            defaultDenomString_ = denomIndexListStringToDefaultDenomString(valuePayLoad_.denom)
          }

          const excelDenomList_ = convertDenomListStringToExcelDenomList(valuePayLoad_.denom)

          const denomListString_ = denomIndexListStringToDenomListString(valuePayLoad_.denom)

          //寫入一筆資料的EXCEL
          excelData.push([
            valuePayLoad_.cid,
            valuePayLoad_.gameId,
            valuePayLoad_.currency,
            denomListString_,
            ...excelDenomList_,
            valuePayLoad_.defaultDenomId,
            defaultDenomString_,
          ])
        }) // valueGameId_ end
        const oneSheetData = { name: `${sheetName_}`, data: [...excelData] }
        buff.push(oneSheetData)
      }) // valueCurrency_ end
    } //else end

    writeMultiplePagesExcel(`./output/${hallName_}.xlsx`, buff)
  }) // allDcDenomMap end
}

module.exports = {
  initAllDcDenom,
  allDcDenomMap,
  exportAllDcDenomToExcel,
}
