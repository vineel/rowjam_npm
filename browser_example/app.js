var rowjam = require('rowjam_npm');

var tableA = [
    {
        "MEETING_ID":"16540576",
        "EXPENSE_AMOUNT" : "1000.00",
        "ESTIMATE_AMOUNT" : "800.00",
        "START_DATE":"2015-04-13 08:00:00.000",
        "CATEGORY": "conference",
        "ORGANIZER": "Bob"
    },
    {
        "MEETING_ID":"16540577",
        "EXPENSE_AMOUNT" : "1030.00",
        "ESTIMATE_AMOUNT" : "810.00",
        "START_DATE":"2015-04-13 08:00:00.000",
        "CATEGORY": "visit",
        "ORGANIZER": "Amy"
    },
    {
        "MEETING_ID":"16540578",
        "EXPENSE_AMOUNT" : "1000.00",
        "ESTIMATE_AMOUNT" : "700.00",
        "START_DATE":"2015-04-17 08:00:00.000",
        "CATEGORY": "conference",
        "ORGANIZER": "Cathy"
    }
  ];

 
  console.log("Start a chain with the source table array.");
  var jam = rowjam(tableA, true).dump();

  console.log("Datatypes sometimes get mixed up, so we make sure they're right (and predictable).");
  jam.setTypes({'MEETING_ID':'string', 'EXPENSE_AMOUNT':'number', 'ESTIMATE_AMOUNT':'number', 'START_DATE':'string'}).dump();

  console.log("Find a row where MEETING_ID===16540577");
  rowjam.print(jam.findFirst('MEETING_ID', '===', '16540577'));
  
  console.log("Find an array of rows where ESTIMATE_AMOUNT is at least 800");
  rowjam.print(jam.find('ESTIMATE_AMOUNT', '>=', 800));

  console.log('filter by CATEGORY === "conference"');
  jam.filter('CATEGORY', '===', 'conference').dump();

  console.log('Add up some results using summarize. This ends the chain.');
  var summary = jam.summarize(['EXPENSE_AMOUNT', 'ESTIMATE_AMOUNT'], ['CATEGORY'], ",", "MEETING_COUNT");
  rowjam.print(summary);
 
  console.log('Convert the table array into a lookup object based on category.');
  var lookup = rowjam(tableA).toLookup('CATEGORY');
  rowjam.print(lookup);

  console.log('Extract an array of values from a specific column. (CATEGORY)');
  var arr = rowjam(tableA).values('CATEGORY', false);
  rowjam.print(arr);

  console.log('Extract an array of UNIQUE values from a specific column. (CATEGORY)');
  var arr = rowjam(tableA).values('CATEGORY', true);
  rowjam.print(arr);

  console.log('Sort the array based on CATEGORY asc, START_DATE desc');
  var jam2 = rowjam(tableA).sort(['CATEGORY', 'asc', 'START_DATE', 'desc']).dump();
  
  var tableB = [
      {
          "MEETING_ID" : "16540576",
          "SPEAKER_FEE": 100.00
      },
      {
          "MEETING_ID" : "16540576",
          "SPEAKER_FEE": 120.00
      },
      {
          "MEETING_ID" : "16540577",
          "SPEAKER_FEE": 130.00
      },
      {
          "MEETING_ID" : "16540578",
          "SPEAKER_FEE": 140.00
      },
      {
          "MEETING_ID" : "16540578",
          "SPEAKER_FEE": 150.00
      },
      {
          "MEETING_ID" : "16540576",
          "SPEAKER_FEE": 160.00
      }
  ];
  
  console.log("Let's use the table below to join against.");
  rowjam.print(tableB);
  
  console.log("Let's make sure that tableB.MEETING_ID is a string. Let's affect the original variable.");
  rowjam(tableB, false).setTypes({'MEETING_ID':'string'});
  
  console.log("Let's join sub-arrays of tableB to tableA and save it to new column named 'fees'.");
  rowjam(tableA, true).setTypes({'MEETING_ID':'string'}).joinAsArray('fees', 'MEETING_ID', tableB, 'MEETING_ID').dump();
  
  console.log("Let's do the same thing but summarize each tableB sub-array. Stats the easy way.");
  rowjam(tableA, true).setTypes({'MEETING_ID' : 'string'}).joinAsSummary('fee_summary', 'MEETING_ID', tableB, 'MEETING_ID', ['SPEAKER_FEE'],[], '', 'SPEAKERS').dump();
  
  console.log("Let's merge the summary columns into source rows.");
  rowjam(tableA, true).setTypes({'MEETING_ID' : 'string'}).joinAsSummary('', 'MEETING_ID', tableB, 'MEETING_ID', ['SPEAKER_FEE'],[], '', 'SPEAKERS').dump();
  
  console.log("done.");