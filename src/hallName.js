const { excel } = require("58-toolkit")
const { getExcel } = excel

const hallNameMap = new Map()

function initHallName() {
  const hallNameSheet_ = getExcel("./input/HALL_NAME.xlsx", false, "HALL_NAME")

  hallNameSheet_.forEach((row_) => {
    const cid_ = row_[0]
    const userName_ = row_[1]

    if (cid_ != "Cid") {
      const value_ = hallNameMap.get(cid_)
      if (!value_) {
        hallNameMap.set(cid_, userName_)
      } else {
        console.error(`重複的 cid: ${cid_} userName: ${userName_}`)
      }
    }
  })
}

module.exports = { initHallName, hallNameMap }
