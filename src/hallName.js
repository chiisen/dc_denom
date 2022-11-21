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
  }) // hallNameSheet_ end

  hallNameMap.forEach((x) => {
    const targetDC_ = x.dc
    let levelIcon_ = `💫`
    let levelPath_ = ""
    if (x.upId != "-1") {
      const list_ = []

      let upHall_ = hallNameMap.get(x.upId)
      while (upHall_ && upHall_.upId != "-1") {
        list_.push(`${upHall_.dc}`)
        levelPath_ += ` ${upHall_.dc} `
        console.log(levelIcon_ + `來源-DC: ${targetDC_} 的階層-DC: ${levelPath_}`)

        upHall_ = hallNameMap.get(upHall_.upId)

        levelIcon_ += `💫`
      } // while end
      const reverseList_ = list_.reverse()
      x.pathList = reverseList_
    } else {
      console.error(`來源-DC: ${targetDC_} 一開始 upId 就是 "-1" (可能是 I8 的那個最上層)`)
    }
  }) // hallNameMap end
}

module.exports = { initHallName, hallNameMap }
