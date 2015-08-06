var rowjam = require('rowjam_npm');

var tableA = [
  {
      "MEETING_ID":"16540576",
      "EXPENSE_AMOUNT" : "1000.00",
      "ESTIMATE_AMOUNT" : "800.00",
      "START_DATE":"2015-04-13 08:00:00.000",
      "CATEGORY": ""
  },
  {
      "MEETING_ID":"16540577",
      "EXPENSE_AMOUNT" : "1030.00",
      "ESTIMATE_AMOUNT" : "810.00",
      "START_DATE":"2015-04-13 08:00:00.000",
      "CATEGORY": "visit"
  },
  {
      "MEETING_ID":"16540578",
      "EXPENSE_AMOUNT" : "1000.00",
      "ESTIMATE_AMOUNT" : "700.00",
      "START_DATE":"2015-04-17 08:00:00.000",
      "CATEGORY": "conference"
  }
];

  rowjam(tableA, true).setTypes({'EXPENSE_AMOUNT':'number'}).dump()

console.log(JSON.stringify(tableA, null, 2));