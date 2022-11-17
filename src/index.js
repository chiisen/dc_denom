const clc = require("cli-color")

const { initHallName } = require("./hallName")
const { initAllDcDenom, exportAllDcDenomToExcel } = require("./allDcDenom")

initHallName()

initAllDcDenom()

exportAllDcDenomToExcel()

console.log(clc.red("dc_denom 程式結束!"))
