const clc = require("cli-color")

const { initGameMinBet } = require("./gameMinBet")
const { initSingleMinBet } = require("./minBet")

const { initHallName } = require("./hallName")
const { initAllDcDenom, exportAllDcDenomToExcel } = require("./allDcDenom")

initGameMinBet()
initSingleMinBet()

initHallName()

initAllDcDenom()

exportAllDcDenomToExcel()

console.log(clc.red("dc_denom 程式結束!"))
