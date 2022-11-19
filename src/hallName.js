const { excel } = require("58-toolkit")
const { getExcel } = excel

const hallNameMap = new Map()

function initHallName() {
  const hallNameSheet_ = getExcel("./input/HALL_NAME.xlsx", false, "HALL_NAME")

  hallNameSheet_.forEach((row_) => {
    const cid_ = row_[0]
    const userName_ = row_[1]
    const nickName_ = row_[3]
    const upId_ = row_[10]
    const state_ = row_[21]
    const dc_ = row_[33]

    if (cid_ != "Cid") {
      const value_ = hallNameMap.get(cid_)
      if (!value_) {
        const payLoad_ = {
          cid: cid_,
          userName: userName_,
          nickName: nickName_,
          upId: upId_,
          state: state_,
          dc: dc_,
        }
        hallNameMap.set(cid_, payLoad_)
      } else {
        console.error(`重複的 cid: ${cid_} userName: ${userName_}`)
      }
    }
  })
}

module.exports = { initHallName, hallNameMap }
