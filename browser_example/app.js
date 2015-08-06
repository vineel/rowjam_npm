var rowjam = require('rowjam_npm');

console.log(rowjam);

var tableA = [
  {
      "MEETING_ID":"16540576",
      "EXPENSE_AMOUNT" : "1000.00",
      "ESTIMATE_AMOUNT" : "800.00",
      "START_DATE":"2015-04-13 08:00:00.000",
      "CATEGORY": "conference"
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

  // rowjam(tableA, true).setTypes({'EXPENSE_AMOUNT':'number'}).dump()

// tableA.sort(function(a,b) {
//   return a.CATEGORY > b.CATEGORY;
// })
//
// rowjam(tableA, false).dump().hello();

rowjam(tableA, true).sort(['START_DATE', 'desc', 'CATEGORY', 'desc']).dump();
